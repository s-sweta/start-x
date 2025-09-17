const Strategy = require('../models/Strategy');
const Store = require('../models/Store');

// @desc    Create a new strategy for the user's store
// @route   POST /api/strategies
exports.createStrategy = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Get data from request and add the store ID
        const strategyData = { ...req.body, store: store._id };

        const strategy = await Strategy.create(strategyData);
        res.status(201).json({ success: true, data: strategy });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all strategies for the user's store
// @route   GET /api/strategies
exports.getMyStrategies = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const strategies = await Strategy.find({ store: store._id });
        res.status(200).json({ success: true, count: strategies.length, data: strategies });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a specific strategy by its ID
// @route   PUT /api/strategies/:id
exports.updateStrategy = async (req, res) => {
    try {
        let strategy = await Strategy.findById(req.params.id);
        if (!strategy) {
            return res.status(404).json({ message: 'Strategy not found.' });
        }

        // 🔒 Security Check: Ensure the strategy belongs to the user's store
        const store = await Store.findOne({ user: req.user.id });
        if (strategy.store.toString() !== store._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this strategy.' });
        }

        strategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: strategy });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a specific strategy by its ID
// @route   DELETE /api/strategies/:id
exports.deleteStrategy = async (req, res) => {
    try {
        const strategy = await Strategy.findById(req.params.id);
        if (!strategy) {
            return res.status(404).json({ message: 'Strategy not found.' });
        }

        // 🔒 Security Check: Ensure the strategy belongs to the user's store
        const store = await Store.findOne({ user: req.user.id });
        if (strategy.store.toString() !== store._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this strategy.' });
        }

        await strategy.deleteOne();

        res.status(200).json({ success: true, message: 'Strategy deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};