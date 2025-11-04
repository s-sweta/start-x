const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Registration attempt for email:', email);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating user...');
        const user = await User.create({ email, password });
        console.log('User created successfully:', user._id);

        // If user is created successfully, create a token for them
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        
        console.log('Token created successfully');
        
        // Send the token back, just like in the login function
        res.status(201).json({
            message: 'User registered successfully',
            token: token
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        res.status(200).json({
            message: 'Logged in successfully',
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'No user found with that email address' });
        }

        // Generate reset token (in a real app, you'd send this via email)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Set reset token and expiration (1 hour)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
        
        await user.save();

        // In a real application, you would send an email here
        // For demo purposes, we'll just return a success message
        console.log(`Password reset token for ${email}: ${resetToken}`);
        
        res.status(200).json({
            message: 'Password reset instructions sent to your email',
            // In production, don't send the token in response
            resetToken: resetToken // Only for demo purposes
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};