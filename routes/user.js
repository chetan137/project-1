const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isAdmin } = require("../middleware.js");

// Signup routes
router.route("/signup")
    .get(userController.signup_render)
    .post(wrapAsync(userController.signup));

// Login routes
router.get("/login", saveRedirectUrl, userController.login_render);
router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: '/login',
        failureFlash: true
    }),
    userController.login
);

// Logout route
router.get("/logout", userController.logout);

// Export the router
module.exports = router;
