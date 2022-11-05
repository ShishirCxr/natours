const mongoose = require('mongoose');
const dotenv = require('dotenv');

// HANDLING UNCAUGHT EXCEPTIONS /// SYNC FUNCTIONS
process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN...');
	console.log(err.name, err.message);
	process.exit(1); // SHOULD THEN BE TERMINATE AND RESTART THE SERVER
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	//.connect(process.env.DATABASE_LOCAL, {  // HOSTED DB VERSION
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		//userFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('DB connection successfully established');
	});
// .catch((err) => console.log('Error')); // ONE WAY FOR UNHANDLED REJECTION PROMISE

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});

// UNHANDLED REJECTION GLOBALLY
process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! SHUTTING DOWN...');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
