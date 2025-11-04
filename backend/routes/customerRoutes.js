const express = require('express');
const router = express.Router();
const { 
    generateCustomers, 
    getMyCustomers, 
    getCustomerAnalytics 
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// All routes here are protected
router.use(protect);

router.route('/')
    .get(getMyCustomers);

router.route('/generate')
    .post(generateCustomers);

router.route('/analytics')
    .get(getCustomerAnalytics);

module.exports = router;