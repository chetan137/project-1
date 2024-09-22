const Joi = require('joi');
const ExpressError = require('../utils/ExpressError'); // Assuming you have a custom Express error handler

module.exports.validateListing = (req, res, next) => {
    const listingSchema = Joi.object({
        listing: Joi.object({
            title: Joi.string().required().messages({
                'string.empty': 'Title is required',
            }),
            description: Joi.string().optional(),
            price: Joi.number().required().messages({
                'number.base': 'Price must be a number',
                'any.required': 'Price is required',
            }),
            location: Joi.string().required().messages({
                'string.empty': 'Location is required',
            }),
            country: Joi.string().required().messages({
                'string.empty': 'Country is required',
            }),


            images: Joi.array().items(Joi.string()).optional(), // Expecting an array of image URLs
            video: Joi.string().optional(), // URL for the video
            keyFeatures: Joi.array().items(Joi.string()).optional(), // Array of key features
            amenities: Joi.array().items(Joi.string()).optional(), // List of amenities
            houseRules: Joi.object({
                checkIn: Joi.string().required().messages({
                    'string.empty': 'Check-in time is required',
                }),
                checkOut: Joi.string().required().messages({
                    'string.empty': 'Check-out time is required',
                }),
                children: Joi.boolean().required(),
                infants: Joi.boolean().required(),
                pets: Joi.boolean().required(),
                parties: Joi.boolean().required(),
                smoking: Joi.boolean().required(),
                additionalRules: Joi.array().items(Joi.string()).optional(), // List of additional rules
            }).required(),
            calendar: Joi.object({
                availableDates: Joi.array().items(Joi.date()).required(), // Array of available dates
            }).required(),
            reviews: Joi.array().items(
                Joi.object({
                    user: Joi.string().required(), // User ID or username
                    rating: Joi.number().min(1).max(5).required(),
                    comment: Joi.string().optional(),
                })
            ).optional(), // Reviews section
        }).required(),
    });

    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
};
