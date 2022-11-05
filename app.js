/* eslint-disable prettier/prettier */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-Limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const { parseArgs } = require('util');

const app = express();

app.set('view engine', 'pug');
// help create correct path
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES
//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
// SET Security HTTP Headers
// app.use(helmet()); // fix Error for mapbox
app.use(
	helmet({
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			directives: {
				'child-src': ['blob:'],
				// 'connect-src': ['https://*.mapbox.com'],
				// 'default-src': ["'self'"],
				'font-src': ["'self'", 'https://fonts.gstatic.com'],
				'img-src': ["'self'", 'data:', 'blob:'],
				'script-src': [
					"'self'",
					'https://*.mapbox.com',
					'cdnjs.cloudflare.com',
				],
				// 'style-src': ["'self'", 'https:'],
				'worker-src': ['blob:'],
			},
		},
	})
);

// Dev Logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}
// LIMITS REQ from same API
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requeests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// BODY PARSER, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); // Middleware for JSON function that can modify the incomiing request data - Just the step to go0 through
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Middleware for JSON function that can modify the incomiing request data - Just the step to go0 through

// DATA SANITISATION against NoSQL Query Injection
app.use(mongoSanitize());

// DATA SANITISATION against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsAverage',
			'ratingsQuantity',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	})
);

// TEST MIDDLE WARE
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString(); // Readable string
	// console.log(req.cookies);
	next();
});

// 3 Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
