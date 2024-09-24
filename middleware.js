const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');

const User = require("./models/user");
const {listingSchema,reviewSchema}=require("./joi_Schema.js");

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { abortEarly: false }); // abortEarly: false allows collecting all errors

    if (error) {
        // Detailed error message joining all messages
        const errMsg = error.details.map(el => el.message).join(', ');
        next(new ExpressError(errMsg, 400));
        console.log(errMsg); // Pass the error to the next middleware (error handler)
    } else {
        next();
    }
};




module.exports.isAdmin = (req, res, next) => {

    if (req.isAuthenticated() && req.user.role === 'admin') {

        return next();
    } else {

        req.flash("error", "You need to be an admin to access this page");
        res.redirect("/login");
    }
};





module.exports.isLoggedIn =(req,res,next)=>{


    if(!req.isAuthenticated()){
       req.session.redirectUrl =req.originalUrl;
        req.flash("error","you must be Logged before use this page !!");
        return res.redirect("/login");

    }
    next();
};
module.exports.saveRedirectUrl =(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl =req.session.redirectUrl;
    }
    next();
}
