require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

/**
 * Handling Uncaught Exception and Unhandled Promise Rejections.
 */
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Application Shutting Down...');
    server.close(() => {
        process.exit(1);
    })
})

process.on('unhandledRejection', err => {
    
    console.log(err.name, err.message);
    console.log('Application Shutting Down...');
    server.close(() => {
        process.exit(1);
    })

})

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED, Application shutting down...');
    server.close(() => {
        console.log('Process terminated!');
    })
})


const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASS);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log('Connected to database successfully!');
    });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App started! Listening to port : ${port}`)
})

