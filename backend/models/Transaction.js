const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    discountApplied: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['CARD', 'UPI', 'WALLET', 'CRYPTO'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
        default: 'PENDING'
    },
    appliedStrategies: [{
        strategy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Strategy'
        },
        impact: String // Description of how strategy affected this transaction
    }],
    loyaltyPointsEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);