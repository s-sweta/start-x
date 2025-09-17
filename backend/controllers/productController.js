const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Add a product to a store
// @route   POST /api/products
exports.addProduct = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(400).json({ message: 'You must create a store before adding products' });
        }

        const { name, price, category, cost } = req.body;

        if (cost >= price) {
             return res.status(400).json({ message: 'Cost must be less than the selling price.' });
        }
        
        const product = await Product.create({
            name,
            price,
            category,
            cost, // Add cost here
            store: store._id
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all products for the user's store
// @route   GET /api/products
exports.getMyProducts = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(200).json({ success: true, data: [] }); // No store, so no products
        }
        
        const products = await Product.find({ store: store._id });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Security Check: Ensure the product belongs to the user's store
        const store = await Store.findOne({ user: req.user.id });
        if (product.store.toString() !== store._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};