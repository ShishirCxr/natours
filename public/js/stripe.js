/* eslint-disable */
// to fix the content policy I downloaded chrome extension named Always Disable Content-Security-Policy
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
	const stripe = Stripe(
		'pk_test_51LxAHVHgJIvqnH7C53DTUg6j1NCVh7KCyFLM4aUoJmJewGdSHgbFGvybDYyx0p0KgGpFIeKyXercvY8YyZVkRR1z00B6CfUzgE'
	);
	try {
		// 1 get checkout session from API
		const session = await axios(
			`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
		);
		console.log(session);
		// 2 create checkout form charge credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		});
	} catch (err) {
		console.log(err);
		showAlert('error', err);
	}
};
