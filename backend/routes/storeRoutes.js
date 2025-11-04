const express = require('express');
const router = express.Router();
const { createStore, getMyStore, deleteStore } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

// All routes here are protected
router.use(protect);

router.route('/')
    .post(createStore)
    .delete(deleteStore);

router.route('/my-store')
    .get(getMyStore);

module.exports = router;