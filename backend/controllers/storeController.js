const Store = require('../models/Store');
const Product = require('../models/Product');

// @desc    Create a store
// @route   POST /api/stores
exports.createStore = async (req, res) => {
    try {
        // Check if user already has a store
        const existingStore = await Store.findOne({ user: req.user.id });
        if (existingStore) {
            return res.status(400).json({ message: 'You can only create one store' });
        }
        
        const { name, description } = req.body;
        const store = await Store.create({
            name,
            description,
            user: req.user.id // From our protect middleware
        });
        res.status(201).json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get the logged-in user's store
// @route   GET /api/stores/my-store
exports.getMyStore = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ success: false, data: null, message: 'No store found for this user' });
        }
        res.status(200).json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete user's store and all its products
// @route   DELETE /api/stores
exports.deleteStore = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Cascade Delete: Remove all products associated with the store
        await Product.deleteMany({ store: store._id });
        // Then, remove the store itself
        await store.deleteOne();

        res.status(200).json({ success: true, message: 'Store and all products removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};