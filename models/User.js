const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a first name!']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'userDefault.jpg'
    },
    email: {
        type: String,
        required: [true, 'User must have an email!'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password field cannot be empty!'],
        select: false,
        validate: {
            validator: function(el) {
                return el.length >= 8;
            },
            message: 'Password length cannot be less than 8'
        } 
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password confirm field cannot be empty!'],
        validate: {
            validator: function(el) {
                return el === this.password
            },
            message: 'Passwords are not the same!',
        }
    },
    passwordLastChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});


//Pre Save Middleware for encrypting the password before it is saved (we will use bcryptjs npm package for this purpose).
UserSchema.pre('save', async function(next) {
    //We don't need to hash the password everytime the user document is saved (i.e. if other user data like name is changed)
    if(!this.isModified('password')) return next();
    //Otherwise hash the password and save it in the password field.
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})


//Pre Save Middleware for setting the passwordLastChangedAt field before saving the document
UserSchema.pre('save', function(next) {
    //If the password field is not modified and the document is new (i.e. while signing up) then we don't need to set the passwordLastChangedAt field.
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordLastChangedAt = Date.now() - 1000;
    next();
    
})


//Pre Find Middleware to return only the active users.
UserSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
})


//Instance method to check the input password (candidate password) and the hashed database password (user password) using bcrypt npm package.
UserSchema.methods.checkPassword = async function (candidatePwd, userPwd) {
    return await bcrypt.compare(candidatePwd, userPwd);
}


//Instance method that checks if the user changed the password after the jwt token was issued by comparing the timestamps (jwt isat timestamp and the passwordLastChangedAt timestamp).
UserSchema.methods.checkIfPwdChanged = function (JWTTimeStamp) {
    if(this.passwordLastChangedAt) {
        return JWTTimeStamp < Number.parseInt(Date.parse(this.passwordLastChangedAt) / 1000);
    }
    return false;
}

UserSchema.methods.createPwdResetToken = function() {
    //Get a 32byte hexadecimal token.
    const resetToken = crypto.randomBytes(32).toString('hex');

    //Hash the hexadecimal token and save it into the passwordResetToken field. 
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    //Set the passwordResetToken expiry date.
    this.passwordResetTokenExpiry = Date.now() + (10 * 60 * 1000);
   
    //return the token.
    return resetToken;
}


module.exports = mongoose.model('User', UserSchema);