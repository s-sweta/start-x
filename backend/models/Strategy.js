const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // ✅ EXPAND THE ENUM TO INCLUDE MORE TYPES
    type: {
        type: String,
        enum: ['PERCENTAGE_DISCOUNT', 'CRM_LOYALTY_POINTS', 'MOBILE_PUSH_OFFER'],
        required: true,
    },
    // ✅ ADD A FLEXIBLE 'DETAILS' OBJECT FOR TYPE-SPECIFIC DATA
    details: {
        // For PERCENTAGE_DISCOUNT
        discountPercentage: { type: Number },
        // For CRM_LOYALTY_POINTS
        pointsPerPurchase: { type: Number },
        // For MOBILE_PUSH_OFFER
        offerMessage: { type: String },
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true,
        // ✅ REMOVE 'unique: true' TO ALLOW MULTIPLE STRATEGIES PER STORE
    },
}, { timestamps: true });

module.exports = mongoose.model('Strategy', StrategySchema);