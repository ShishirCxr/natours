const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json()); // Middleware for JSON function that can modify the incomiing request data - Just the step to go0 through

/* app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Hello from the server side',
		app: 'Natours',
	});
});

app.post('/', (req, res) => {
	res.send('You can post to this endpoint...');
}); */

// Reading File with GET
const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours, // same name need not have to declare the value
		},
	});
}); // Always specify the version for comapatibility

app.get('/api/v1/tours/:id', (req, res) => {
	console.log(req.params);
	const id = req.params.id * 1;
	const tour = tours.find((el) => el.id === id);

	/* if (id > tours.length) { */
	if (!tour) {
		// alternative solution
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		});
	}

	res.status(200).json({
		status: 'success',
		data: {
			tours,
		},
	});
}); // Always specify the version for comapatibility

// Creating using POST
app.post('/api/v1/tours', (req, res) => {
	// console.log(req.body); // body is the property created because of that middleware
	const newId = tours[tours.length - 1].id + 1; // database specify the new id
	const newTour = Object.assign({ id: newId }, req.body);

	tours.push(newTour);

	fs.writeFile(
		`${__dirname}/dev-data/data/tours-simple.json`,
		JSON.stringify(tours),
		(err) => {
			res.status(201).json({
				status: 'success',
				data: {
					tour: newTour,
				},
			}); // 201 means created
		}
	); // not async inorder to not block the server process
	// res.send('Done'); // cannot send the request twice
});
/* res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours, // same name need not have to declare the value
		},
 */

app.patch('/api/v1/tours/:id', (req, res) => {
	if (req.params.id * 1 > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		});
	}
	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Updated tour here>',
		},
	});
});

app.delete('/api/v1/tours/:id', (req, res) => {
	if (req.params.id * 1 > tours.length) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID',
		});
	}
	res.status(204).json({
		status: 'success',
		data: null,
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
