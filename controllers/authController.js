const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const TempUser = require('../models/TempUser');
const Email = require('../utils/email');



const signToken = id => {
    //Object containing { id } will act as the payload
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY
    });
}

const createAndSendToken = (user, statusCode, req, res) => {
    //Create the token
    const token = signToken(user.id);
    
    //Set the cookie parameters
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    }

    //Set the cookie to the response object
    res.cookie('jwt', token, cookieOptions);

    //Set the password field to undefined cause we dont want the password to be visible in reponse
    user.password = undefined;

    //Send the response along with cookie and jwt token to the user
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}


exports.verifySignup = async (req, res, next) => {

    /**
     * Check if the user already exits to prevent duplicate requests.
     * Get the email id from req.body and create the temporary user
     * Set verification token and expiry timestamp using the instance method createVerifyToken()
     * Send the verification email to the id provided along with token and temporary User id.
     */

    let tempUser;
    let targetUser;
    try {
        targetUser = await User.findOne({ email: req.body.email });
        if(targetUser) return next(new AppError(400, 'User with that email already exists!'));

        tempUser = await TempUser.create({ email: req.body.email });
        const verificationToken = tempUser.createVerifyToken();
        await tempUser.save({ validateBeforeSave: false });
        
        const verificationUrl = `${req.protocol}://${req.get('host')}/signup/${tempUser.id}/${verificationToken}`;
        await new Email(tempUser.email, 'User', verificationUrl).sendSignupVerificationMail();

    } catch (err) {
        if(tempUser) {
            await TempUser.findByIdAndDelete(tempUser.id);
        }
        return next(new AppError(400, err.message));
        
    }
    
    res.status(200).json({
        status: 'success',
        message: 'A confirmation link has been sent to the given email address!'
    });

};


exports.signup = catchAsync(async (req, res, next) => {

    const { tempUserId, verificationToken } = req.params;
    const tempUser = await TempUser.findOne({ _id: tempUserId });

    //Hash the verification token received from the verification link.
    const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
   
    //Check if the temporary user id is valid.
    if(!tempUser) return next(new AppError(400, 'Invalid verification link! Please re-initiate the signup process.'));

    //Check if the verification link was not expired.
    if(tempUser.isVerificationTokenExpired()) return next(new AppError(400, 'Verification link expired! Please re-initiate the signup process.'));
    

    //Check if the verification token is valid.
    if(tempUser.verifyToken !== hashedToken) return next(new AppError(400, 'Invalid verification link! Please re-initiate the signup process.'));
    
    
    //Create a new user
    const newUser = await User.create({
        name: req.body.name,
        email: tempUser.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    //Delete all the temp user docs created by user due to one or multiple requests.
    await TempUser.deleteMany({ email: tempUser.email });

    //Send greetings to the new user email
    const redirectUrl = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser.email, newUser.name.split(' ')[0], redirectUrl).sendGreetingsEmail();
    
    //Sign and send the token as a response
    createAndSendToken(newUser, 201, req, res);

});


exports.login = catchAsync(async (req, res, next) => {

    //Get the email and password from the request body i.e. req.body
    const { email, password } = req.body;

    //Check if the email and password is not empty.
    if(!email || !password) return next(new AppError(400, 'Please enter email and password!'));

    //Query the database for the requested user
    const targetUser = await User.findOne({ email }).select('+password');

    //Check if the user exist and verify the credentials.
    if(!targetUser || !(await targetUser.checkPassword(password, targetUser.password))) return next(new AppError(401, 'Incorrect email or password!'));

    //Create and send the jwt token as response to the user
    createAndSendToken(targetUser, 200, req, res);
});


exports.checkAuthorization = catchAsync(async (req, res, next) => {
    
    let token;

    //Get the jwt token (if exists).
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //Get the jwt token from the authorization field from the request header object (i.e. req.headers.authorization) containing Bearer token 
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        //Get the jwt token from the cookie itself (if present) (Note - req.cookies is available only by using npm package called cookie-parser).
        token = req.cookies.jwt;
    }

    //Check if the token was fetched successfully. Otherwise the user might not be logged in.
    if(!token) return next(new AppError(401, 'You are not logged in! Please log in to get access.'));
    

    //Validate the token using jwt package and the jwt_secret_key env variable.
    /**
     * jwt.verify() function is synchronous in nature.
     * Running an intensive function like jwt.verify() 
     * could block our main application execution thread.
     * Hence we need to make it asynchronous and for
     * that we can use promisify function from node 'utils'
     * package. This will make the function asynchronous.
     */
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    //Check if the user still exists.
    const targetUser = await User.findById(decoded.id);
    if(!targetUser) return next(new AppError(401, 'The user does no longer exist.'));

    //Check if the password was changed after the token was issued.
    if(targetUser.checkIfPwdChanged(decoded.iat)) return next(new AppError(401, 'User recently changed password! Please login again.'));
      

    //Grant access to the user by calling the next middleware.
    res.locals.user = targetUser;
    req.user = targetUser;

    next();

});


exports.isLoggedIn = async (req, res, next) => {
    //Check if jwt cookies are available
    if(req.cookies.jwt) {   
        try {

            //Decode the jwt token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_KEY);

            //Get the user based on the decoded payload data from jwt
            const targetUser = await User.findById(decoded.id);
            
            //Check if the user still exist
            if(!targetUser) return next();

            //Check if the password was changed after the token was issued
            if(targetUser.checkIfPwdChanged(decoded.iat)) return next();

            //Grant access to the user
            res.locals.user = targetUser;
            return next();

        } catch (err) {
            return next()
        }
    }
    next();
}


exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + (10 * 1000)),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
    res.status(200).json({ status: 'success' });
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action.'
            });
        }
        next();
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) Check if the user exists and is active
    const targetUser = await User.findOne({ email: req.body.email }).select('+active');

    if(!targetUser) return next(new AppError(404, 'There is no user with that email address.'));
    
    if(!targetUser.active) return next(new AppError(400, 'Account with that email has been closed!'));

    //2) Create password reset token and save it to the database
    const resetToken = targetUser.createPwdResetToken();
    await targetUser.save({ validateBeforeSave: false });

    //3) Send the password reset token to the user via email
    try {
        const redirectUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
        await new Email(targetUser.email, targetUser.name.split(' ')[0], redirectUrl).sendResetTokenEmail();

    } catch (err) {
        //If there is error in sending email then undo the changes and return the function with the response containing error
        targetUser.passwordResetToken = undefined,
        targetUser.passwordResetTokenExpiry = undefined
        await targetUser.save({ validateBeforeSave: false });
        return next(new AppError(500, 'There was an error sending the email. Try again later!'));
    }

    //4) Notify the user regarding the token via the response.
    res.status(200).json({
        status: 'success',
        message: 'A verification link has been sent to the registered email address!'
    })

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //Get and Hash the token using sha256 algorithm
    const hashedResetToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    //Find the user using token
    const targetUser = await User.findOne({ passwordResetToken: hashedResetToken, passwordResetTokenExpiry: { $gt: Date.now() } });

    //Check for token validity
    if(!targetUser) return next(new AppError(400, 'Password reset link is invalid or has expired!'));

    //Update the password and null the reset token and expiry fields
    if(!req.body.password || !req.body.passwordConfirm) return next(new AppError(400, 'Password or confirm password field cannot be empty!')); 
    
    targetUser.password = req.body.password;
    targetUser.passwordConfirm = req.body.passwordConfirm;
    targetUser.passwordResetToken = undefined;
    targetUser.passwordResetTokenExpiry = undefined;
    
    await targetUser.save();

    //Send response
    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully!'
    })

});

exports.updatePassword = async (req, res, next) => {

}