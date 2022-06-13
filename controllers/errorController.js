const errorHandler = require('../utils/errorHandlers');


const sendProdError = (err, req, res) => {
    
    //API ERROR HANDLING
    if(req.originalUrl.includes('/api')){

        // If operational, trusted errors : send message to the client.
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // Programming or other unknown error: don't leak error details.
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    
    //VIEWS ERROR HANDLING
    // if(err.isOperational) {
    //     // If operational, trusted errors : send message to the client.
    //     return res.status(err.statusCode).render('error', {
    //         title: 'Something went wrong!',
    //         msg: err.message
    //     });
    // }

    // // Programming or other unknown error: don't leak error details.
    // res.status(err.statusCode).render('error', {
    //     title: 'Something went wrong!',
    //     msg: 'Please try again later.'
    // });

}

const sendDevError = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        console.log(err.name);
        res.status(err.statusCode).json({
            status: err.status,
            name: err.name,
            message: err.message,
            error: err,
            stack: err.stack
        });
    } else {
        // res.status(err.statusCode).render('error', {
        //     title: 'Something went wrong!',
        //     msg: err.message
        // });
    }
}

module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error' 

    if(process.env.NODE_ENV === 'development') {

        sendDevError(err, req, res);

    } else if (process.env.NODE_ENV === 'production') {
        /**
         * Destructuring does not completely copies the err object
         * i.e. err.name, err.message does not gets copy. So, we
         * need to explicitly specify those properties.
         * 
         */
        let error = {...err, name: err.name, message: err.message};

        if(error.name === 'CastError') error = errorHandler.handleCastErrorDB(error);
        if(error.code === 11000) error = errorHandler.handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = errorHandler.handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = errorHandler.handleJWTError(error);
        if(error.name === 'TokenExpiredError') error = errorHandler.handleJWTExpiryError(error);
        sendProdError(error, req, res);
    }


}