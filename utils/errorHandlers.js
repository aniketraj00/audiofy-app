const AppError = require('./appError');


/**
 * Basic Error Handler Functions.
 * Handler for DB Field Casting Error.
 * Handler for Duplicate DB Entry.
 * Handler for Basic DB Field Validations.
 * Handler for JWT Errors
 */

exports.handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}.`;
    return new AppError(400, message);
}

exports.handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: "${err.keyValue.name}". Please use another value!`;
    return new AppError(400, message);
}

exports.handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(400, message);
}

exports.handleJWTError = () => new AppError(401, 'Invalid token. Please log in again!');

exports.handleJWTExpiryError = () => new AppError(401, 'Your token has expired. Please log in again!');