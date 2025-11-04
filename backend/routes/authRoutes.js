const express = require('express');
const router = express.Router();

// We will create this controller file next
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;