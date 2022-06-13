
module.exports = class AppError extends Error {
    /**
     * 
     * @param {number} statusCode error code to be forwarded as the response to the invalid http request
     * @param {string} message short description of the error to be forwarded along with the error code to the invalid http request
     */
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = true;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);

    }
}