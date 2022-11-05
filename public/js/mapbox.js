/* eslint-disable */
export const displayMap = (locations) => {
	mapboxgl.accessToken =
		'pk.eyJ1Ijoic2hpc2hpcmJrIiwiYSI6ImNsOWZkYnV6dzAyNHIzdXA5Mncxa2NrejcifQ.2DAayLd5GsKY4JUeSjNDhw';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/shishirbk/cl9fedrjo000014mwyc0gr6e1',
		scrollZoom: false,
		// center: [-118.113941, 34.111745],

		// interactive: true,
	});

	const bounds = new mapboxgl.LngLatBounds();

	locations.forEach((loc) => {
		// create marker
		const el = document.createElement('div');
		el.className = 'marker';

		// Add the marker
		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom',
		})
			.setLngLat(loc.coordinates)
			.addTo(map);

		// Add Popup
		new mapboxgl.Popup({
			offset: 30,
		})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day ${loc.day}: ${loc.description}</>p`)
			.addTo(map);

		// Extends the map bounds to include current location
		bounds.extend(loc.coordinates);
	});
	const nav = new mapboxgl.NavigationControl();
	map.addControl(nav, 'top-right');

	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			left: 100,
			right: 100,
		},
	});
};
