
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
require('dotenv').config();

const mapBoxToken = process.env.MAP_BOX_TOKEN;

if (!mapBoxToken) {
    throw new Error('Mapbox access token not found. Please set MAPBOX_TOKEN in your .env file.');
}

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports = async (location) => {
    return geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
};
