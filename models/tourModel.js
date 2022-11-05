const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour name must be provided'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have less or equal than 40 characters'],
			minlength: [10, 'A tour name must have more or equal than 10 characters'],
			// validate: [
			// 	validator.isAlpha,
			// 	'The tour name must only contain characters',
			// ],
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size'],
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty must be either easy, medium or difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
			set: (val) => Math.round((val * 10) / 10),
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'A tour price must be provided'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (val) {
					// This only points to current doc on NEW# document creation
					return val < this.price;
				},
				message:
					'The Discount price ({VALUE}) should be below the original price',
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A description must be provided'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a image'],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false, // hides to the client
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			deafult: false,
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		// reviews: [
		// 	{
		// 		type: mongoose.Schema.ObjectId,
		// 		ref: 'Review',
		// 	},
		// ],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
});
// Document Middle ware; runsbefore .save() and .create()  != .insertMany()
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});
// for creating new documnets only FOR EMBEDDING
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async (id) => await User.findById(id));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// });

// DOCUMENT MIDDLE WARE
// we can have middleware before and after the event and we can have that with save() event
// tourSchema.pre('save', function (next) {
// 	console.log('will save the document...');
// 	next();
// });

// tourSchema.post('save', function (doc, next) {
// 	console.log(doc);
// 	next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
	// tourSchema.pre('find', function (next) {
	this.find({ secretTour: { $ne: true } });

	this.start = Date.now();
	next();
});
tourSchema.pre(/^find/, function (next) {
	// populate displays all data but alwasys creaates new quewries so it can also lag performance on the long run for heavy applications
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt',
	});
	next();
});

tourSchema.post(/^find/, function (docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds `);
	next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// 	console.log(this.pipeline());
// 	next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
