const express = require('express');
const {
    initializePaymentGateways,
    getPaymentGateways,
    updatePaymentGateway,
    getEnabledGateways,
    resetPaymentGateways
} = require('../controllers/paymentGatewayController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/payment-gateways/initialize
router.post('/initialize', initializePaymentGateways);

// @route   GET /api/payment-gateways
router.get('/', getPaymentGateways);

// @route   GET /api/payment-gateways/enabled
router.get('/enabled', getEnabledGateways);

// @route   PUT /api/payment-gateways/:id
router.put('/:id', updatePaymentGateway);

// @route   POST /api/payment-gateways/reset
router.post('/reset', resetPaymentGateways);

module.exports = router;