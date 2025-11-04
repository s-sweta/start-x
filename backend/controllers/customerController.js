const Customer = require('../models/Customer');
const Store = require('../models/Store');

// Customer persona templates
const PERSONA_TEMPLATES = {
    PRICE_SENSITIVE: {
        priceConsciousness: 85,
        loyaltyTendency: 30,
        mobilePref: 50,
        impulsiveness: 20,
        avgOrderValue: 35,
        visitFrequency: 1
    },
    LOYALTY_DRIVEN: {
        priceConsciousness: 40,
        loyaltyTendency: 90,
        mobilePref: 60,
        impulsiveness: 35,
        avgOrderValue: 75,
        visitFrequency: 4
    },
    MOBILE_FIRST: {
        priceConsciousness: 60,
        loyaltyTendency: 50,
        mobilePref: 95,
        impulsiveness: 70,
        avgOrderValue: 45,
        visitFrequency: 3
    },
    IMPULSE_BUYER: {
        priceConsciousness: 25,
        loyaltyTendency: 40,
        mobilePref: 80,
        impulsiveness: 95,
        avgOrderValue: 85,
        visitFrequency: 2
    }
};

// Generate random names for customers
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
const LAST_NAMES = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];

const generateRandomName = () => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
};

const generateRandomEmail = (name) => {
    const domain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'][Math.floor(Math.random() * 4)];
    return `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 999)}@${domain}`;
};

// Add some randomness to persona characteristics
const addVariation = (baseValue, variation = 15) => {
    const min = Math.max(0, baseValue - variation);
    const max = Math.min(100, baseValue + variation);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// @desc    Generate customers for a store
// @route   POST /api/customers/generate
exports.generateCustomers = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const { count = 20 } = req.body; // Default to 20 customers
        const personas = Object.keys(PERSONA_TEMPLATES);
        const customers = [];

        // Clear existing customers for this store
        await Customer.deleteMany({ store: store._id });

        for (let i = 0; i < count; i++) {
            const persona = personas[Math.floor(Math.random() * personas.length)];
            const template = PERSONA_TEMPLATES[persona];
            const name = generateRandomName();

            const customer = {
                name,
                email: generateRandomEmail(name),
                persona,
                priceConsciousness: addVariation(template.priceConsciousness),
                loyaltyTendency: addVariation(template.loyaltyTendency),
                mobilePref: addVariation(template.mobilePref),
                impulsiveness: addVariation(template.impulsiveness),
                avgOrderValue: addVariation(template.avgOrderValue, 20),
                visitFrequency: Math.max(1, addVariation(template.visitFrequency, 1)),
                store: store._id,
                isActive: true
            };

            customers.push(customer);
        }

        const createdCustomers = await Customer.insertMany(customers);
        
        res.status(201).json({
            success: true,
            message: `Generated ${createdCustomers.length} customers`,
            data: createdCustomers
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all customers for the user's store
// @route   GET /api/customers
exports.getMyCustomers = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const customers = await Customer.find({ store: store._id });
        
        // Group customers by persona for better visualization
        const customersByPersona = customers.reduce((acc, customer) => {
            if (!acc[customer.persona]) {
                acc[customer.persona] = [];
            }
            acc[customer.persona].push(customer);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
            groupedByPersona: customersByPersona
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get customer analytics
// @route   GET /api/customers/analytics
exports.getCustomerAnalytics = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const customers = await Customer.find({ store: store._id });
        
        const analytics = {
            totalCustomers: customers.length,
            personaDistribution: {},
            averageCharacteristics: {
                priceConsciousness: 0,
                loyaltyTendency: 0,
                mobilePref: 0,
                impulsiveness: 0
            },
            totalPotentialRevenue: 0
        };

        // Calculate persona distribution and averages
        customers.forEach(customer => {
            // Persona distribution
            analytics.personaDistribution[customer.persona] = 
                (analytics.personaDistribution[customer.persona] || 0) + 1;

            // Average characteristics
            analytics.averageCharacteristics.priceConsciousness += customer.priceConsciousness;
            analytics.averageCharacteristics.loyaltyTendency += customer.loyaltyTendency;
            analytics.averageCharacteristics.mobilePref += customer.mobilePref;
            analytics.averageCharacteristics.impulsiveness += customer.impulsiveness;

            // Potential monthly revenue (avgOrderValue * visitFrequency)
            analytics.totalPotentialRevenue += customer.avgOrderValue * customer.visitFrequency;
        });

        // Calculate averages
        if (customers.length > 0) {
            Object.keys(analytics.averageCharacteristics).forEach(key => {
                analytics.averageCharacteristics[key] = 
                    Math.round(analytics.averageCharacteristics[key] / customers.length);
            });
        }

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    generateCustomers: exports.generateCustomers,
    getMyCustomers: exports.getMyCustomers,
    getCustomerAnalytics: exports.getCustomerAnalytics
};