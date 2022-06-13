const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const TempUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'User must have an email!'],
        validate: [validator.isEmail, 'Please enter a valid email!']
    },
    verifyToken: String,
    verifyTokenExpiresIn: Date
});

TempUserSchema.methods.createVerifyToken = function() {

    //Create a token based on random 32 byte hexadecimal string.
    const token = crypto.randomBytes(32).toString('hex');

    //Hash the token and save it to the database.
    this.verifyToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

    //Save the token expiry timestamp to the database.
    this.verifyTokenExpiresIn = Date.now() + (10 * 60 * 1000);

    //Return the plain token to the user.
    return token;
}

TempUserSchema.methods.isVerificationTokenExpired = function() {
    return Date.now() > this.verifyTokenExpiresIn;
}

module.exports = mongoose.model('Temp User', TempUserSchema);