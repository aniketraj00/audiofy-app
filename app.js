const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const trackRouter = require('./routers/trackRouter');
const albumRouter = require('./routers/albumRouter');
const userRouter = require('./routers/userRouter');
const viewRouter = require('./routers/viewRouter');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');


const app = express();


//GLOBAL MIDDLEWARES



/**
 * In order to access 'x-forwarded-proto' header from
 * req.headers object we need to enable trust-proxy
 * It indicates that app is behind a front-facing proxy, 
 * and to use the X-Forwarded-* headers to determine 
 * the connection and the IP address of the client
 */
app.enable('trust proxy')

//Enables all CORS(Cross Origin Resource Sharing) requests. TODO: Update these setting after testing to ensure app security
app.use(cors());

//Enables preflight phase handling (Complex request like sending cookie goes through a preflight phase)
app.options('*', cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})

//Redirect unsecure http request to secure https request.
const requireHTTPS = (req, res, next) => {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP, please try again in an hour!'
// })
// app.use('/api', limiter);

/**
 * Set the 'view engine' to use 'pug' for parsing the html templates.
 * Also set the default directory containing all the views to /views.
 */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//Sets security HTTP headers. Also sets Content Security Policy to false (required to be set in order to load remote scripts)
app.use(
    helmet({
      contentSecurityPolicy: false, // sensitive
    })
);

//Enables using static files in our app.
app.use(express.static(`${__dirname}/public`));

//Enables Development Loggings.
app.use(morgan('dev'));

//Enables parsing of the cookies received in the request object.
app.use(cookieParser());

//Data Sanitization against NoSQL query injection.
app.use(mongoSanitize());

//Data Sanitization against XSS (cross-site-scripting).
app.use(xss());

//Enables body-parser to parse json in the request body(req.body).
app.use(express.json());
// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }))

//Compresses responses like txt or json.
app.use(compression());


//PRIMARY ROUTES
app.use('/api/v1/tracks', trackRouter);
app.use('/api/v1/albums', albumRouter);
app.use('/api/v1/users', userRouter);
app.use('/', viewRouter);


//UNKNOWN ROUTES
app.use('*', (req, res, next) => {
    next(new AppError(404, `Can't find ${req.originalUrl} on this server!`))
});

//Global error handling middleware.
app.use(globalErrorHandler);

module.exports = app;