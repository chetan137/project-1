
  const mongoose = require('mongoose');

// Define schema for hotel listing
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keyFeatures: [String], // List of key features
  amenities: [String],   // List of amenities
  houseRules: {
    checkIn: {
      type: String,
      default: '3 pm'
    },
    checkOut: {
      type: String,
      default: '11 am'
    },
    children: {
      type: Boolean,
      default: true
    },
    infants: {
      type: Boolean,
      default: true
    },
    pets: {
      type: Boolean,
      default: true
    },
    parties: {
      type: Boolean,
      default: false
    },
    smoking: {
      type: Boolean,
      default: false
    },
    additionalRules: {
      respectCommunity: {
        type: Boolean,
        default: true
      },
      accessCardLossFee: {
        type: Number,
        default: 500
      },
      keyLossFee: {
        type: Number,
        default: 100
      },
      noSmoking: {
        type: Boolean,
        default: true
      }
    }
  },
  images: {
    type: [String],
    validate: [arrayLimit, 'Exceeds the limit of 10 images'],
  },
  video: {
    type: String,
    validate: {
      validator: function(v) {
        return v && v.match(/^https?:\/\/.+$/);
      },
      message: 'Invalid video URL'
    }
  }, // Video URL with validation
  calendar: [{
    date: {
      type: Date,
      required: true
    },
    available: {
      type: Boolean,
      required: true
    }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    lat: {
      type: Number,
      required: true
    },
    long: {
      type: Number,
      required: true
    }
  },
   geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Custom validator for image array length
function arrayLimit(val) {
  return val.length <= 10;

}

// Create the Listing model
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
