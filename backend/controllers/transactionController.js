const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Strategy = require('../models/Strategy');
const Store = require('../models/Store');

// Simulate customer behavior based on persona and active strategies
const simulateCustomerBehavior = (customer, products, activeStrategies) => {
    const behavior = {
        willBuy: false,
        selectedProducts: [],
        paymentMethod: 'CARD',
        responseToStrategies: []
    };

    // Base purchase probability based on persona
    let purchaseProbability = 0.3; // 30% base chance

    // Adjust based on customer characteristics
    if (customer.persona === 'IMPULSE_BUYER') {
        purchaseProbability += 0.4; // 70% total
    } else if (customer.persona === 'LOYALTY_DRIVEN') {
        purchaseProbability += 0.3; // 60% total
    } else if (customer.persona === 'MOBILE_FIRST') {
        purchaseProbability += 0.2; // 50% total
    } else if (customer.persona === 'PRICE_SENSITIVE') {
        purchaseProbability += 0.1; // 40% total
    }

    console.log(`🎯 DEBUG - ${customer.name} (${customer.persona}): base probability ${purchaseProbability.toFixed(2)}`);

    // Apply strategy effects
    activeStrategies.forEach(strategy => {
        let strategyImpact = 0;
        let impactDescription = '';

        switch (strategy.type) {
            case 'PERCENTAGE_DISCOUNT':
                const discount = strategy.details.discountPercentage || 0;
                if (customer.priceConsciousness > 60) {
                    strategyImpact = discount * 0.02; // Price-sensitive customers love discounts
                    impactDescription = `Attracted by ${discount}% discount`;
                } else {
                    strategyImpact = discount * 0.01; // Others less affected
                    impactDescription = `Moderately interested in ${discount}% discount`;
                }
                break;

            case 'CRM_LOYALTY_POINTS':
                if (customer.loyaltyTendency > 60) {
                    strategyImpact = 0.25; // Loyalty-driven customers love points
                    impactDescription = `Motivated by loyalty points program`;
                } else {
                    strategyImpact = 0.1;
                    impactDescription = `Slightly interested in loyalty points`;
                }
                break;

            case 'MOBILE_PUSH_OFFER':
                if (customer.mobilePref > 70) {
                    strategyImpact = 0.3; // Mobile-first customers respond well
                    impactDescription = `Engaged through mobile push notification`;
                } else {
                    strategyImpact = 0.05;
                    impactDescription = `Noticed mobile offer`;
                }
                break;
        }

        purchaseProbability += strategyImpact;
        behavior.responseToStrategies.push({
            strategy: strategy._id,
            impact: impactDescription
        });
    });

    // Cap probability at 95%
    purchaseProbability = Math.min(0.95, purchaseProbability);

    // Determine if customer will buy
    behavior.willBuy = Math.random() < purchaseProbability;

    if (behavior.willBuy) {
        // Select products based on customer preferences
        const affordableProducts = products.filter(p => p.price <= customer.avgOrderValue * 1.5);
        
        if (affordableProducts.length > 0) {
            // Impulse buyers might buy multiple items
            const maxItems = customer.persona === 'IMPULSE_BUYER' ? 3 : 
                           customer.persona === 'LOYALTY_DRIVEN' ? 2 : 1;
            
            const numItems = Math.floor(Math.random() * maxItems) + 1;
            
            for (let i = 0; i < numItems && i < affordableProducts.length; i++) {
                const randomProduct = affordableProducts[Math.floor(Math.random() * affordableProducts.length)];
                
                // Avoid duplicates
                if (!behavior.selectedProducts.find(p => p.product.toString() === randomProduct._id.toString())) {
                    behavior.selectedProducts.push({
                        product: randomProduct._id,
                        quantity: Math.floor(Math.random() * 2) + 1, // 1-2 quantity
                        price: randomProduct.price
                    });
                }
            }
        }

        // Choose payment method based on persona
        const paymentMethods = ['CARD', 'UPI', 'WALLET', 'CRYPTO'];
        if (customer.persona === 'MOBILE_FIRST') {
            behavior.paymentMethod = Math.random() < 0.7 ? 'UPI' : 'WALLET';
        } else if (customer.persona === 'IMPULSE_BUYER') {
            behavior.paymentMethod = Math.random() < 0.5 ? 'CARD' : 'UPI';
        } else {
            behavior.paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        }
    }

    return behavior;
};

// @desc    Run transaction simulation
// @route   POST /api/transactions/simulate
exports.simulateTransactions = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const { days = 7 } = req.body; // Simulate for 7 days by default

        // Get all necessary data
        const [customers, products, strategies] = await Promise.all([
            Customer.find({ store: store._id, isActive: true }),
            Product.find({ store: store._id }),
            Strategy.find({ store: store._id, isActive: true })
        ]);

        console.log('🔍 DEBUG - Store ID:', store._id);
        console.log('🔍 DEBUG - Found customers:', customers.length);
        console.log('🔍 DEBUG - Found products:', products.length);
        console.log('🔍 DEBUG - Found strategies:', strategies.length);

        if (customers.length === 0) {
            console.log('❌ No active customers found');
            return res.status(400).json({ message: 'No customers found. Generate customers first.' });
        }

        if (products.length === 0) {
            console.log('❌ No products found');
            return res.status(400).json({ message: 'No products found. Add products first.' });
        }

        // Clear existing transactions for this store
        await Transaction.deleteMany({ store: store._id });

        const transactions = [];
        const simulationResults = {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalRevenue: 0,
            strategyEffectiveness: {}
        };

        // Simulate each day
        for (let day = 0; day < days; day++) {
            console.log(`📅 DEBUG - Simulating day ${day + 1}`);
            let dayVisits = 0;
            let dayPurchases = 0;
            
            // Each customer has a chance to visit based on their visit frequency
            for (const customer of customers) {
                const dailyVisitChance = customer.visitFrequency / 30; // Convert monthly to daily
                
                if (Math.random() < dailyVisitChance) {
                    dayVisits++;
                    console.log(`👤 DEBUG - Customer ${customer.name} visited (chance: ${dailyVisitChance.toFixed(3)})`);
                    
                    const behavior = simulateCustomerBehavior(customer, products, strategies);
                    console.log(`🛒 DEBUG - Customer behavior: willBuy=${behavior.willBuy}, products=${behavior.selectedProducts.length}`);
                    
                    if (behavior.willBuy && behavior.selectedProducts.length > 0) {
                        dayPurchases++;
                        const totalAmount = behavior.selectedProducts.reduce(
                            (sum, item) => sum + (item.price * item.quantity), 0
                        );

                        // Apply discounts from active strategies
                        let discountApplied = 0;
                        const discountStrategy = strategies.find(s => s.type === 'PERCENTAGE_DISCOUNT');
                        if (discountStrategy) {
                            discountApplied = totalAmount * (discountStrategy.details.discountPercentage / 100);
                        }

                        const finalAmount = totalAmount - discountApplied;

                        // Calculate loyalty points
                        let loyaltyPointsEarned = 0;
                        const loyaltyStrategy = strategies.find(s => s.type === 'CRM_LOYALTY_POINTS');
                        if (loyaltyStrategy) {
                            loyaltyPointsEarned = loyaltyStrategy.details.pointsPerPurchase || 0;
                        }

                        // Simulate payment success/failure (95% success rate)
                        const paymentStatus = Math.random() < 0.95 ? 'SUCCESS' : 'FAILED';

                        const transaction = {
                            customer: customer._id,
                            store: store._id,
                            products: behavior.selectedProducts,
                            totalAmount,
                            discountApplied,
                            finalAmount,
                            paymentMethod: behavior.paymentMethod,
                            paymentStatus,
                            appliedStrategies: behavior.responseToStrategies,
                            loyaltyPointsEarned: paymentStatus === 'SUCCESS' ? loyaltyPointsEarned : 0,
                            createdAt: new Date(Date.now() - (days - day - 1) * 24 * 60 * 60 * 1000) // Spread across days
                        };

                        transactions.push(transaction);
                        console.log(`💳 DEBUG - Transaction created: $${finalAmount.toFixed(2)} (${paymentStatus})`);

                        // Update simulation results
                        simulationResults.totalTransactions++;
                        if (paymentStatus === 'SUCCESS') {
                            simulationResults.successfulTransactions++;
                            simulationResults.totalRevenue += finalAmount;
                        } else {
                            simulationResults.failedTransactions++;
                        }

                        // Track strategy effectiveness
                        behavior.responseToStrategies.forEach(strategyResponse => {
                            const strategyId = strategyResponse.strategy.toString();
                            if (!simulationResults.strategyEffectiveness[strategyId]) {
                                simulationResults.strategyEffectiveness[strategyId] = {
                                    triggeredTransactions: 0,
                                    revenue: 0
                                };
                            }
                            simulationResults.strategyEffectiveness[strategyId].triggeredTransactions++;
                            if (paymentStatus === 'SUCCESS') {
                                simulationResults.strategyEffectiveness[strategyId].revenue += finalAmount;
                            }
                        });
                    }
                }
            }
            console.log(`📊 DEBUG - Day ${day + 1} summary: ${dayVisits} visits, ${dayPurchases} purchases`);
        }

        // Save all transactions
        console.log('💾 DEBUG - Total transactions generated:', transactions.length);
        console.log('💰 DEBUG - Total revenue:', simulationResults.totalRevenue);
        
        if (transactions.length > 0) {
            await Transaction.insertMany(transactions);
            console.log('✅ DEBUG - Transactions saved to database');
        } else {
            console.log('⚠️ DEBUG - No transactions generated!');
        }

        res.status(201).json({
            success: true,
            message: `Simulated ${days} days of transactions`,
            data: {
                transactions: transactions.length,
                results: simulationResults
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get transaction analytics
// @route   GET /api/transactions/analytics
exports.getTransactionAnalytics = async (req, res) => {
    try {
        const store = await Store.findOne({ user: req.user.id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const transactions = await Transaction.find({ store: store._id })
            .populate('customer', 'name persona')
            .populate('products.product', 'name category')
            .sort({ createdAt: -1 });

        const analytics = {
            totalTransactions: transactions.length,
            successfulTransactions: transactions.filter(t => t.paymentStatus === 'SUCCESS').length,
            failedTransactions: transactions.filter(t => t.paymentStatus === 'FAILED').length,
            totalRevenue: transactions
                .filter(t => t.paymentStatus === 'SUCCESS')
                .reduce((sum, t) => sum + t.finalAmount, 0),
            averageOrderValue: 0,
            paymentMethodDistribution: {},
            personaPerformance: {},
            dailyRevenue: {},
            recentTransactions: transactions.slice(0, 10)
        };

        // Calculate average order value
        const successfulTransactions = transactions.filter(t => t.paymentStatus === 'SUCCESS');
        if (successfulTransactions.length > 0) {
            analytics.averageOrderValue = analytics.totalRevenue / successfulTransactions.length;
        }

        // Payment method distribution
        transactions.forEach(transaction => {
            analytics.paymentMethodDistribution[transaction.paymentMethod] = 
                (analytics.paymentMethodDistribution[transaction.paymentMethod] || 0) + 1;
        });

        // Persona performance
        transactions.forEach(transaction => {
            const persona = transaction.customer?.persona || 'UNKNOWN';
            if (!analytics.personaPerformance[persona]) {
                analytics.personaPerformance[persona] = {
                    transactions: 0,
                    revenue: 0,
                    successRate: 0
                };
            }
            analytics.personaPerformance[persona].transactions++;
            if (transaction.paymentStatus === 'SUCCESS') {
                analytics.personaPerformance[persona].revenue += transaction.finalAmount;
            }
        });

        // Calculate success rates for personas
        Object.keys(analytics.personaPerformance).forEach(persona => {
            const personaData = analytics.personaPerformance[persona];
            const successfulCount = transactions.filter(t => 
                t.customer?.persona === persona && t.paymentStatus === 'SUCCESS'
            ).length;
            personaData.successRate = personaData.transactions > 0 ? 
                (successfulCount / personaData.transactions * 100).toFixed(1) : 0;
        });

        // Daily revenue (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(date => {
            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.createdAt).toISOString().split('T')[0];
                return transactionDate === date && t.paymentStatus === 'SUCCESS';
            });
            analytics.dailyRevenue[date] = dayTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
        });

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    simulateTransactions: exports.simulateTransactions,
    getTransactionAnalytics: exports.getTransactionAnalytics
};