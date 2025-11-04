const mongoose = require('mongoose');

const PaymentGatewaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a gateway name'],
        trim: true
    },
    type: {
        type: String,
        enum: ['CARD', 'UPI', 'WALLET', 'CRYPTO'],
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    successRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 95, // 95% success rate by default
        required: true
    },
    processingFee: {
        type: Number,
        min: 0,
        max: 10, // Max 10% processing fee
        default: 2.5, // 2.5% default processing fee
        required: true
    },
    minAmount: {
        type: Number,
        min: 0,
        default: 10 // Minimum transaction amount in Rupees
    },
    maxAmount: {
        type: Number,
        min: 0,
        default: 1000000 // Maximum transaction amount in Rupees (10 Lakh)
    },
    description: {
        type: String,
        trim: true
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    }
}, { timestamps: true });

// Ensure unique gateway type per store
PaymentGatewaySchema.index({ store: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('PaymentGateway', PaymentGatewaySchema);