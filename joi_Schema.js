const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required(),
        images: Joi.array().items(Joi.string().uri()).required(), // Array of image URLs
        video: Joi.string().uri().allow(null, ''), // Video URL
        keyFeatures: Joi.array().items(Joi.string()).required(), // Array of key features
        amenities: Joi.array().items(Joi.string()).required(), // Array of amenities
        houseRules: Joi.object({
            checkIn: Joi.string().default('3 pm'),
            checkOut: Joi.string().default('11 am'),
            children: Joi.boolean().default(true),
            infants: Joi.boolean().default(true),
            pets: Joi.boolean().default(true),
            parties: Joi.boolean().default(false),
            smoking: Joi.boolean().default(false),
            additionalRules: Joi.object({
                respectCommunity: Joi.boolean().default(true),
                accessCardLossFee: Joi.number().default(500),
                keyLossFee: Joi.number().default(100),
                noSmoking: Joi.boolean().default(true),
            }).optional(),
        }).required(),
        calendar: Joi.array().items(Joi.object({
            date: Joi.date().required(),
            available: Joi.boolean().required(),
        })).required(),

        
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});
