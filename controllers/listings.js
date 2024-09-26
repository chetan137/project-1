const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_BOX_TOKEN;
console.log(`Mapbox Token: ${mapToken}`);

const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Listing = require("../models/listings");
const { listingSchema } = require("../joi_Schema");
const ExpressError = require('../utils/ExpressError');
const logger = require('../utils/logger');

const MAX_RETRIES = 3;
const TIMEOUT = 10000;

async function fetchGeocodingData(location, retries = 0) {
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
    console.log( `this bulder in render new form ${req.user}`);
    res.render('listings/new');
};

module.exports.createListing = async (req, res, next) => {
    try {
        // Parse body correctly (handling different content types)
        const body = req.body.listing ? req.body : JSON.parse(JSON.stringify(req.body));
        console.log("Parsed body:", body);

        // Modify data types before validation if needed
        const { houseRules, location,availableDates } = body.listing;
        if (houseRules && typeof houseRules.additionalRules === 'string') {
            houseRules.additionalRules = { rule: houseRules.additionalRules };  // Convert to object
        }

          const coordinatesResponse = await fetchGeocodingData(location);


        if (!coordinatesResponse.body.features.length) {
            throw new ExpressError('Invalid location', 401);
        }
         const coordinates = coordinatesResponse.body.features[0].geometry.coordinates;
        if (typeof body.listing.location === 'string') {
       body.listing.location = {
        lat: coordinates[1],   // Latitude is the second element in the GeoJSON coordinates array
         long: coordinates[0]   // Longitude is the first element in the GeoJSON coordinates array
    };
}

         if (typeof availableDates === 'string') {
            const dateArray = availableDates.split(',').map(dateStr => dateStr.trim());
            body.listing.availableDates = dateArray.map(dateStr => ({
                date: new Date(dateStr), // Convert to Date object
                available: true // Set availability status (default to true)
            }));
        } else if (Array.isArray(availableDates)) {
            body.listing.availableDates = availableDates.map(date => ({
                date: new Date(date), // Ensure date is a Date object
                available: true // Set availability status (default to true)
            }));
        }
        
        // Validate request body using Joi
        const { error, value } = listingSchema.validate(body.listing, { abortEarly: false });
        if (error) {
            return next(new ExpressError(error.details.map(detail => detail.message).join(', '), 400));
        }
        console.log("Validated listing data:", value);

        // Process uploaded files (images and video)
        const images = req.files && req.files['listing[images]'] ? req.files['listing[images]'].map(file => file.path) : [];
        const video = req.files && req.files['listing[video]'] && req.files['listing[video]'][0] ? req.files['listing[video]'][0].path : null;

        // Create new listing with validated data
        const newListing = new Listing({
            ...value,
            owner: req.user._id,  // Associate listing with user
            images,  // Array of image URLs
            video,   // Video URL
            location: {
                lat: value.location.lat,
                long: value.location.long
            }
        });

        // Save the new listing to the database
        const savedListing = await newListing.save();
        console.log("New Listing Created:", savedListing);
        req.flash('success', 'Successfully added a new listing!');
        res.redirect(`/listings/${savedListing._id}`);
    } catch (err) {
        console.error('Error creating listing:', err);
        next(err);  // Forward the error to error-handling middleware
    }
};
