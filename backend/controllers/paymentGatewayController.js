const PaymentGateway = require('../models/PaymentGateway');
const Store = require('../models/Store');

// Default payment gateway configurations (amounts in Indian Rupees)
const DEFAULT_GATEWAYS = [
    {
        name: 'Credit/Debit Cards',
        type: 'CARD',
        successRate: 95,
        processingFee: 2.9,
        minAmount: 10,
        maxAmount: 500000,
        description: 'Traditional card payments with high reliability'
    },
    {
        name: 'UPI Payments',
        type: 'UPI',
        successRate: 98,
        processingFee: 0,
        minAmount: 1,
        maxAmount: 1000000,
        description: 'Instant UPI transfers with zero processing fee'
    },
    {
        name: 'Digital Wallets',
        type: 'WALLET',
        successRate: 97,
        processingFee: 1.5,
        minAmount: 10,
        maxAmount: 200000,
        description: 'E-wallet payments for quick transactions'
    },
    {
        name: 'Cryptocurrency',
        type: 'CRYPTO',
        successRate: 85,
        processingFee: 1.0,
        minAmount: 100,
        maxAmount: 10000000,
        description: 'Bitcoin and altcoin payments'
    }
];

// @desc    Initialize default payment gateways for a store
// @route   POST /api/payment-gateways/initialize
exports.initializePaymentGateways = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Check if gateways already exist
        const existingGateways = await PaymentGateway.find({ store: store._id });
        if (existingGateways.length > 0) {
            return res.status(400).json({ 
                message: 'Payment gateways already initialized for this store.' 
            });
        }

        // Create default gateways
        const gateways = DEFAULT_GATEWAYS.map(gateway => ({
            ...gateway,
            store: store._id
        }));

        const createdGateways = await PaymentGateway.insertMany(gateways);

        res.status(201).json({
            success: true,
            message: 'Payment gateways initialized successfully',
            data: createdGateways
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all payment gateways for user's store
// @route   GET /api/payment-gateways
exports.getPaymentGateways = async (req, res) => {
    try {
        console.log('🔍 GET /api/payment-gateways called');
        console.log('🔍 User ID:', req.user?.id);
        
        const store = await Store.findOne({ user: req.user.id });
        console.log('🔍 Store found:', store ? 'Yes' : 'No');
        
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const gateways = await PaymentGateway.find({ store: store._id }).sort({ type: 1 });
        console.log('🔍 Existing gateways found:', gateways.length);

        // If no gateways exist, auto-initialize them
        if (gateways.length === 0) {
            console.log('🔍 Auto-initializing payment gateways...');
            const defaultGateways = DEFAULT_GATEWAYS.map(gateway => ({
                ...gateway,
                store: store._id
            }));

            const createdGateways = await PaymentGateway.insertMany(defaultGateways);
            
            return res.status(200).json({
                success: true,
                data: createdGateways,
                message: 'Payment gateways auto-initialized'
            });
        }

        res.status(200).json({
            success: true,
            data: gateways
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update payment gateway configuration
// @route   PUT /api/payment-gateways/:id
exports.updatePaymentGateway = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const { isEnabled, successRate, processingFee, minAmount, maxAmount, description } = req.body;

        // Validate input
        if (successRate !== undefined && (successRate < 0 || successRate > 100)) {
            return res.status(400).json({ message: 'Success rate must be between 0 and 100' });
        }

        if (processingFee !== undefined && (processingFee < 0 || processingFee > 10)) {
            return res.status(400).json({ message: 'Processing fee must be between 0 and 10%' });
        }

        const gateway = await PaymentGateway.findOne({ 
            _id: req.params.id, 
            store: store._id 
        });

        if (!gateway) {
            return res.status(404).json({ message: 'Payment gateway not found.' });
        }

        // Update fields
        if (isEnabled !== undefined) gateway.isEnabled = isEnabled;
        if (successRate !== undefined) gateway.successRate = successRate;
        if (processingFee !== undefined) gateway.processingFee = processingFee;
        if (minAmount !== undefined) gateway.minAmount = minAmount;
        if (maxAmount !== undefined) gateway.maxAmount = maxAmount;
        if (description !== undefined) gateway.description = description;

        await gateway.save();

        res.status(200).json({
            success: true,
            message: 'Payment gateway updated successfully',
            data: gateway
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get enabled payment gateways for transaction processing
// @route   GET /api/payment-gateways/enabled
exports.getEnabledGateways = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const enabledGateways = await PaymentGateway.find({ 
            store: store._id, 
            isEnabled: true 
        }).sort({ type: 1 });

        res.status(200).json({
            success: true,
            data: enabledGateways
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reset payment gateways to default configuration
// @route   POST /api/payment-gateways/reset
exports.resetPaymentGateways = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Delete existing gateways
        await PaymentGateway.deleteMany({ store: store._id });

        // Create default gateways
        const gateways = DEFAULT_GATEWAYS.map(gateway => ({
            ...gateway,
            store: store._id
        }));

        const createdGateways = await PaymentGateway.insertMany(gateways);

        res.status(200).json({
            success: true,
            message: 'Payment gateways reset to default configuration',
            data: createdGateways
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    initializePaymentGateways: exports.initializePaymentGateways,
    getPaymentGateways: exports.getPaymentGateways,
    updatePaymentGateway: exports.updatePaymentGateway,
    getEnabledGateways: exports.getEnabledGateways,
    resetPaymentGateways: exports.resetPaymentGateways
};