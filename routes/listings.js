const express = require("express");
const router = express.Router();
const { listingSchema, reviewSchema } = require("../joi_Schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listings.js");
const flash = require("connect-flash");
const multer = require("multer");
const { storage } = require("../cloudCONFIG.js");
const upload = multer({ storage });
//const { isOwner, validateListing, isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// Route for rendering the new listing form

router.route("/")
    .get(wrapAsync(listingController.renderNewForm))
    .post(
        upload.fields([
            { name: 'listing[images]', maxCount: 10 },  // Up to 10 images
            { name: 'listing[video]', maxCount: 1 }     // A single video
        ]),
        wrapAsync(listingController.createListing)
    );



module.exports = router;
