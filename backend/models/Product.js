const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    cost: {
        type: Number,
        required: [true, 'Please add the cost of the product']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ProductSchema.path('cost').validate(function(value) {
    return value < this.price;
}, 'Cost price must be less than selling price.');

module.exports = mongoose.model('Product', ProductSchema);