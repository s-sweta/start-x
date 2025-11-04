const express = require('express');
const router = express.Router();
const { addProduct, getMyProducts, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(addProduct)
    .get(getMyProducts);

router.route('/:id').delete(deleteProduct);

module.exports = router;