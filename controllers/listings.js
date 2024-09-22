

const Listing = require("../models/listings.js");
const { listingSchema } = require("../joi_Schema.js");
const ExpressError = require('../utils/ExpressError');
const fetchGeocodingData = require('../utils/geocode');

const logger = require('../utils/logger');

// Renders the form for creating new listings
module.exports.renderNewForm = (req, res) => {
    console.log(req.user);
    res.render('listings/new');
};

// Handles the creation of new listings
module.exports.createListing = async (req, res, next) => {
    try {
        // Log the creation request
        logger.info('Creating new listing', { listing: req.body.listing, user: req.user });

        // Validate the listing data
        const result = listingSchema.validate(req.body.listing);
        if (result.error) {
            throw new ExpressError(result.error.details.map(el => el.message).join(','), 400);
        }

        // Extract location from the listing and fetch geocode data
        const { location } = req.body.listing;
        const coordinatesResponse = await fetchGeocodingData(location);
        if (!coordinatesResponse.body.features.length) {
            throw new ExpressError('Invalid location', 400);
        }
        const geometry = coordinatesResponse.body.features[0].geometry;

        // Process uploaded files (images and video)
        const images = req.files['listing[images]'] ? req.files['listing[images]'].map(file => file.path) : [];
        const video = req.files['listing[video]'] && req.files['listing[video]'][0] ? req.files['listing[video]'][0].path : null;

        // Create a new listing object
        const newListing = new Listing({
            ...req.body.listing,
            owner: req.user._id, // Owner is the currently logged-in user
            images,  // Array of image paths
            video,   // Video file path
            geometry,
        });

        // Save the new listing to the database
        const savedListing = await newListing.save();
        logger.info('New listing created successfully', { listingId: savedListing._id });

        req.flash('success', 'Successfully added a new listing!');
        res.redirect(`/listings/${savedListing._id}`);
    } catch (err) {
        // Log errors
        logger.error('Error creating listing', { error: err });

        // Handle specific errors (validation or geocoding)
        if (err instanceof ExpressError) {
            req.flash('error', err.message);
            return res.redirect(req.get("Referrer") || "/");
        }
        

        // Forward other errors to the global error handler
        next(err);
    }
};
