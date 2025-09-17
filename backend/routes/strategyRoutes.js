const express = require('express');
const router = express.Router();
const {
    createStrategy,
    getMyStrategies,
    updateStrategy,
    deleteStrategy
} = require('../controllers/strategyController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

// Routes for getting all strategies and creating a new one
router.route('/')
    .get(getMyStrategies)
    .post(createStrategy);

// Routes for updating and deleting a specific strategy by its ID
router.route('/:id')
    .put(updateStrategy)
    .delete(deleteStrategy);

module.exports = router;