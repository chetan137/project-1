
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_BOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Listing = require("../models/listings.js");
const { listingSchema } = require("../joi_Schema.js");
const ExpressError = require('../utils/ExpressError');
const fetchGeocodingData = require('../utils/geocode');

const logger = require('../utils/logger');


const MAX_RETRIES = 3;
const TIMEOUT = 10000;


async function FetchGeocodingData(location, retries = 0) {
    try {
        const response = await Promise.race([
            geocodingClient.forwardGeocode({
                query: location,
                limit: 1,
            }).send(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), TIMEOUT))
        ]);

        return response;
    } catch (err) {
        if (retries < MAX_RETRIES) {
            logger.warn(`Geocoding request failed. Retry attempt ${retries + 1}. Error: ${err.message}`);
            return fetchGeocodingData(location, retries + 1);
        } else {
            throw new ExpressError('Geocoding service timed out. Please try again later.', 408);
        }
    }
}

// Renders the form for creating new listings
module.exports.renderNewForm = (req, res) => {
    console.log(` this bulder in render new form ${req.user}`);
    res.render('listings/new');
};
module.exports.createListing = async (req, res, next) => {
    try {
        // Log the incoming request for debugging
        console.log("Checking req.user:", req.user);
        console.log("Request Body:", JSON.stringify(req.body, null, 2)); // Pretty-print the request body

        // Check if the user is authenticated
        if (!req.user) {
            return next(new ExpressError('User not authenticated', 401));
        }

        // Validate required fields
        const { listing } = req.body;
        if (!listing) {
            return next(new ExpressError('Listing data is missing', 400));
        }

        const { title, location, houseRules, availableDates, price } = listing;

        // Check required fields
        if (!title) {
            return next(new ExpressError('Title is required', 400));
        }
        if (!location) {
            return next(new ExpressError('Location is required', 400));
        }
        if (!availableDates) {
            return next(new ExpressError('Available dates are required', 400));
        }
        if (!price) {
            return next(new ExpressError('Price is required', 400));
        }

        // Validate houseRules.additionalRules
        if (houseRules && typeof houseRules.additionalRules === 'string') {
            try {
                houseRules.additionalRules = JSON.parse(houseRules.additionalRules); // Convert from string to object if needed
            } catch (error) {
                return next(new ExpressError('Invalid JSON format for additionalRules', 400));
            }
        }

        // Fetch geocoding data
        const coordinatesResponse = await fetchGeocodingData(location);
        console.log("Coordinates Response:", coordinatesResponse);

        // Check if the location is valid
        if (!coordinatesResponse.body.features.length) {
            logger.warn('Invalid location during geocoding', { location });
            throw new ExpressError('Invalid location', 400);
        }

        // Extract coordinates from the response
        const geometry = coordinatesResponse.body.features[0].geometry;
        const { coordinates } = geometry;
        if (!coordinates || coordinates.length < 2) {
            throw new ExpressError('Geocoding did not return valid coordinates', 400);
        }

        // Process uploaded files (images and video)
        const images = req.files['listing[images]'] ? req.files['listing[images]'].map(file => file.path) : [];
        const video = req.files['listing[video]'] && req.files['listing[video]'][0] ? req.files['listing[video]'][0].path : null;

        // Create a new listing object
        const newListing = new Listing({
            ...listing,
            owner: req.user._id,
            images,
            video,
            location: {
                lat: coordinates[1], // Latitude
                long: coordinates[0] // Longitude
            },
            geometry,
        });

        console.log("New Listing:", newListing);

        // Save the new listing to the database
        const savedListing = await newListing.save();
        logger.info('New listing created successfully', { listingId: savedListing._id });

        req.flash('success', 'Successfully added a new listing!');
        res.redirect(`/listings/${savedListing._id}`);
    } catch (err) {
        // Log errors with detailed context
        logger.error('Error creating listing', { error: err.message, stack: err.stack });
        next(err);
    }
};

