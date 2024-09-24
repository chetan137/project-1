const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false }
    }
});
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
const User = mongoose.model('User', userSchema);

module.exports = User;
