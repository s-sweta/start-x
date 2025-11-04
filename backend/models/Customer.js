const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    persona: {
        type: String,
        enum: ['PRICE_SENSITIVE', 'LOYALTY_DRIVEN', 'MOBILE_FIRST', 'IMPULSE_BUYER'],
        required: true
    },
    // Behavior characteristics (0-100 scale)
    priceConsciousness: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    loyaltyTendency: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    mobilePref: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    impulsiveness: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    // Shopping behavior
    avgOrderValue: {
        type: Number,
        default: 50
    },
    visitFrequency: {
        type: Number, // visits per month
        default: 2
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);