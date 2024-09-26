

const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    keyFeatures: Joi.array().items(Joi.string()),
    amenities: Joi.array().items(Joi.string()),
    houseRules: Joi.object({
        checkIn: Joi.string().default('3 pm'),
        checkOut: Joi.string().default('11 am'),
        children: Joi.boolean().default(true),
        infants: Joi.boolean().default(true),
        pets: Joi.boolean().default(true),
        parties: Joi.boolean().default(false),
        smoking: Joi.boolean().default(false),
        additionalRules: Joi.object({
            rule: Joi.string(),  // Expecting this field when submitted
            respectCommunity: Joi.boolean().default(true),
            accessCardLossFee: Joi.number().default(500),
            keyLossFee: Joi.number().default(100),
            noSmoking: Joi.boolean().default(true)
        }).unknown(true) // To handle any other potential rules
    }).unknown(true), // Allow additional fields for houseRules
    images: Joi.array().items(Joi.string().uri()), // Expect array of image URLs
    video: Joi.string().uri().optional().allow(null), // Expect video URL or null
    calendar: Joi.array().items(Joi.object({
        date: Joi.date().required(),
        available: Joi.boolean().required()
    })),
    location: Joi.object({
        lat: Joi.number().required(),
        long: Joi.number().required()
    }),
    reviews: Joi.array().items(Joi.object({
        user: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().optional(),
        createdAt: Joi.date().default(Date.now)
    })).optional()
}).unknown(true);


module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
