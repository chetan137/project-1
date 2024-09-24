const Joi = require('joi');

// Joi validation schema for listing
const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  keyFeatures: Joi.array().items(Joi.string()).optional(),  // List of key features
  amenities: Joi.array().items(Joi.string()).optional(),    // List of amenities
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
      noSmoking: Joi.boolean().default(true)
    }).optional()
  }).optional(),
  images: Joi.array().items(Joi.string()).optional(),  // List of image URLs
  video: Joi.string().optional(),                     // Video URL
  calendar: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      available: Joi.boolean().required()
    })
  ).optional(),
  reviews: Joi.array().items(
    Joi.object({
      user: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().optional(),
      createdAt: Joi.date().default(Date.now)
    })
  ).optional(),
  location: Joi.object({
    lat: Joi.number().required(),
    long: Joi.number().required()
  }).required(),
  createdAt: Joi.date().default(Date.now)
});

module.exports = { listingSchema };


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});
