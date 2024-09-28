const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listings");
const wrapAsync = require("../utils/wrapAsync");
const { upload } = require("../cloudCONFIG"); // This handles both images and video
const { isLoggedIn, validateListing } = require("../middleware");

const app = express();

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get("/", wrapAsync(listingController.renderNewForm));


router.post("/",


    upload.fields([
        { name: 'listing[images]', maxCount: 30 }, // Array of images
        { name: 'listing[video]', maxCount: 1 }     // Single video
    ]),

isLoggedIn,



    wrapAsync(listingController.createListing)

);
router.route("/:id").delete(isLoggedIn,wrapAsync(listingController.deleteListings));

module.exports = router;
