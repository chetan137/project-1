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

