const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    console.log('🔍 Auth middleware called for:', req.method, req.path);
    console.log('🔍 Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('🔍 Token extracted:', token ? 'Yes' : 'No');

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('🔍 Token decoded successfully, user ID:', decoded.id);

            // Get user from the token and attach to request object
            req.user = await User.findById(decoded.id).select('-password');
            console.log('🔍 User found:', req.user ? 'Yes' : 'No');

            next();
        } catch (error) {
            console.error('🔍 Auth error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('🔍 No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};