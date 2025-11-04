const express = require('express');
const router = express.Router();
const { 
    simulateTransactions, 
    getTransactionAnalytics 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes here are protected
router.use(protect);

router.route('/simulate')
    .post(simulateTransactions);

router.route('/analytics')
    .get(getTransactionAnalytics);

// Test endpoint
router.route('/test')
    .get((req, res) => {
        console.log('🧪 TEST endpoint hit!');
        res.json({ message: 'Transaction routes are working!' });
    });

module.exports = router;