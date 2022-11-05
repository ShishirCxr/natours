const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
// POST /tour/1231sdffds21321/reviews
// GET /tour/1231sdffds21321/reviews

router.use('/:tourId/reviews', reviewRouter);

// PARAM MIDDLEWARE ONLY works with the id parameters here
// router.param('id', tourController.checkID);
// Create  a checkBody middleware
// Check if the body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	);
router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mil
// /tours-within/distance=233/center/-33.847352, 151.035315/unit=mil

router.route('/:distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.createTour
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
		tourController.updateTour
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

module.exports = router;
