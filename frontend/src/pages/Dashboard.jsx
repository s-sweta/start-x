import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StrategyForm from '../components/StrategyForm';
import './Dashboard.css';

const Dashboard = () => {
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // State for the create store form
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');

    // State for the add product form
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productCost, setProductCost] = useState('');

    const [strategies, setStrategies] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState(null);

    // State to toggle the add product form's visibility
    const [showProductForm, setShowProductForm] = useState(false);

    // Customer simulation state
    const [customers, setCustomers] = useState([]);
    const [customerAnalytics, setCustomerAnalytics] = useState(null);
    const [showCustomerSection, setShowCustomerSection] = useState(false);

    // Transaction simulation state
    const [transactionAnalytics, setTransactionAnalytics] = useState(null);
    const [showTransactionSection, setShowTransactionSection] = useState(false);
    const [simulationRunning, setSimulationRunning] = useState(false);

    // Payment gateway state
    const [paymentGateways, setPaymentGateways] = useState([]);
    const [showPaymentConfig, setShowPaymentConfig] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeRes = await api.get('/stores/my-store');
                if (storeRes.data.success && storeRes.data.data) {
                    setStore(storeRes.data.data);
                    const [productsRes, strategiesRes, customersRes, analyticsRes, transactionAnalyticsRes] = await Promise.all([
                        api.get('/products'),
                        api.get('/strategies'),
                        api.get('/customers'),
                        api.get('/customers/analytics'),
                        api.get('/transactions/analytics').catch(() => ({ data: { data: null } }))
                    ]);
                    setProducts(productsRes.data.data);
                    setStrategies(strategiesRes.data.data);
                    setCustomers(customersRes.data.data || []);
                    setCustomerAnalytics(analyticsRes.data.data);
                    setTransactionAnalytics(transactionAnalyticsRes.data.data);
                }
            } catch (error) {
                if (error.response && error.response.status !== 404) {
                    console.error("Error fetching data:", error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveStrategy = async (strategyData) => {
        try {
            if (editingStrategy) {
                const res = await api.put(`/strategies/${editingStrategy._id}`, strategyData);
                setStrategies(strategies.map(s => s._id === editingStrategy._id ? res.data.data : s));
                setMessage('Strategy updated successfully!');
            } else {
                const res = await api.post('/strategies', strategyData);
                setStrategies([...strategies, res.data.data]);
                setMessage('Strategy created successfully!');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to save strategy.');
        } finally {
            setIsFormVisible(false);
            setEditingStrategy(null);
        }
    };

    const handleDeleteStrategy = async (strategyId) => {
        if (window.confirm('Are you sure you want to delete this strategy?')) {
            try {
                await api.delete(`/strategies/${strategyId}`);
                setStrategies(strategies.filter(s => s._id !== strategyId));
                setMessage('Strategy deleted successfully!');
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to delete strategy.');
            }
        }
    };

    const handleToggleActive = async (strategy) => {
        try {
            const updatedStrategy = { ...strategy, isActive: !strategy.isActive };
            const res = await api.put(`/strategies/${strategy._id}`, { isActive: updatedStrategy.isActive });
            setStrategies(strategies.map(s => s._id === strategy._id ? res.data.data : s));
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to toggle strategy.');
        }
    };

    const handleEditClick = (strategy) => {
        setEditingStrategy(strategy);
        setIsFormVisible(true);
    };

    const handleAddNewClick = () => {
        setEditingStrategy(null);
        setIsFormVisible(true);
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/stores', { name: storeName, description: storeDescription });
            setStore(res.data.data);
            setMessage('Store created successfully!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to create store.');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/products', { name: productName, price: productPrice, category: productCategory, cost: productCost });
            setProducts([...products, res.data.data]);
            setProductName(''); setProductPrice(''); setProductCategory(''); setProductCost('');
            setShowProductForm(false);
            setMessage('Product added successfully!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add product.');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                setProducts(products.filter(p => p._id !== productId));
                setMessage('Product deleted successfully!');
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to delete product.');
            }
        }
    };

    const handleDeleteStore = async () => {
        if (window.confirm('DANGER: Are you sure you want to delete your store and all its products? This cannot be undone.')) {
            try {
                await api.delete('/stores');
                setStore(null);
                setProducts([]);
                setMessage('Store deleted successfully.');
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to delete store.');
            }
        }
    };

    const handleGenerateCustomers = async () => {
        try {
            const res = await api.post('/customers/generate', { count: 20 });
            setCustomers(res.data.data);
            const analyticsRes = await api.get('/customers/analytics');
            setCustomerAnalytics(analyticsRes.data.data);
            setMessage('Generated 20 customers successfully!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to generate customers.');
        }
    };

    const handleRunSimulation = async () => {
        console.log('🚀 Starting 7-day simulation...');
        console.log('Current customers:', customers.length);
        console.log('Current products:', products.length);
        setSimulationRunning(true);
        try {
            console.log('📡 Making API call to /transactions/simulate');
            const res = await api.post('/transactions/simulate', { days: 7 });
            console.log('✅ Simulation response:', res.data);
            
            const transactionCount = res.data.data?.transactions || 0;
            setMessage(`Simulation complete! Generated ${transactionCount} transactions over 7 days. Check console for details.`);

            const analyticsRes = await api.get('/transactions/analytics');
            console.log('📈 Analytics response:', analyticsRes.data);
            setTransactionAnalytics(analyticsRes.data.data);
        } catch (error) {
            console.error('❌ Simulation error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Full error:', error);
            
            let errorMessage = 'Failed to run simulation.';
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setSimulationRunning(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) return <div className="page-container"><h2>Loading Dashboard...</h2></div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="tab-content">
                        <div className="overview-stats">
                            <div className="stat-card">
                                <h3>Total Products</h3>
                                <p className="stat-number">{products.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Active Strategies</h3>
                                <p className="stat-number">{strategies.filter(s => s.isActive).length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Customers</h3>
                                <p className="stat-number">{customers.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Revenue</h3>
                                <p className="stat-number">${transactionAnalytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </div>
                );
            
            case 'products':
                return (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3>Product Management</h3>
                            <button onClick={() => setShowProductForm(!showProductForm)} className="add-product-btn">
                                {showProductForm ? 'Cancel' : '+ Add Product'}
                            </button>
                        </div>

                        {showProductForm && (
                            <div className="form-section">
                                <h4>Add a New Product</h4>
                                <form onSubmit={handleAddProduct} className="dashboard-form">
                                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name" required />
                                    <input type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Selling Price" required />
                                    <input type="number" step="0.01" value={productCost} onChange={(e) => setProductCost(e.target.value)} placeholder="Cost Price" required />
                                    <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="Category" required />
                                    <button type="submit">Add Product</button>
                                </form>
                            </div>
                        )}

                        <div className="product-list-section">
                            {products.length > 0 ? (
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Cost</th>
                                            <th>Margin</th>
                                            <th>Category</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product._id}>
                                                <td>{product.name}</td>
                                                <td>${parseFloat(product.price).toFixed(2)}</td>
                                                <td>${parseFloat(product.cost || 0).toFixed(2)}</td>
                                                <td>{product.cost ? ((product.price - product.cost) / product.price * 100).toFixed(1) + '%' : 'N/A'}</td>
                                                <td>{product.category}</td>
                                                <td>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="delete-product-btn">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>You haven't added any products yet.</p>
                            )}
                        </div>
                    </div>
                );

            case 'strategies':
                return (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3>Strategy Library</h3>
                            {!isFormVisible && (
                                <button onClick={handleAddNewClick} className="add-strategy-btn">+ Add New Strategy</button>
                            )}
                        </div>

                        {isFormVisible && (
                            <StrategyForm
                                onSave={handleSaveStrategy}
                                existingStrategy={editingStrategy}
                                onCancel={() => { setIsFormVisible(false); setEditingStrategy(null); }}
                            />
                        )}

                        <div className="strategy-list">
                            {strategies.length > 0 ? strategies.map(s => (
                                <div key={s._id} className="strategy-card">
                                    <div className="strategy-card-header">
                                        <h4>{s.name}</h4>
                                        <div className="toggle-switch">
                                            <label>
                                                <input type="checkbox" checked={s.isActive} onChange={() => handleToggleActive(s)} />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <p className="strategy-type">{s.type.replace('_', ' ')}</p>
                                    <div className="strategy-card-actions">
                                        <button onClick={() => handleEditClick(s)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDeleteStrategy(s._id)} className="btn-delete">Delete</button>
                                    </div>
                                </div>
                            )) : (
                                !isFormVisible && <p>You haven't created any strategies yet. Click 'Add New Strategy' to begin.</p>
                            )}
                        </div>
                    </div>
                );

            case 'customers':
                return (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3>Customer Simulation</h3>
                            <div className="customer-actions">
                                <button onClick={handleGenerateCustomers} className="generate-customers-btn">
                                    🎲 Generate Customers
                                </button>
                                <button
                                    onClick={() => setShowCustomerSection(!showCustomerSection)}
                                    className="toggle-customers-btn"
                                >
                                    {showCustomerSection ? 'Hide Details' : 'Show Details'}
                                </button>
                            </div>
                        </div>

                        {customerAnalytics && (
                            <div className="customer-analytics">
                                <div className="analytics-grid">
                                    <div className="analytics-card">
                                        <h4>Total Customers</h4>
                                        <p className="big-number">{customerAnalytics.totalCustomers}</p>
                                    </div>
                                    <div className="analytics-card">
                                        <h4>Monthly Revenue Potential</h4>
                                        <p className="big-number">${customerAnalytics.totalPotentialRevenue?.toFixed(0)}</p>
                                    </div>
                                    <div className="analytics-card">
                                        <h4>Avg Price Consciousness</h4>
                                        <p className="big-number">{customerAnalytics.averageCharacteristics?.priceConsciousness}%</p>
                                    </div>
                                    <div className="analytics-card">
                                        <h4>Avg Loyalty</h4>
                                        <p className="big-number">{customerAnalytics.averageCharacteristics?.loyaltyTendency}%</p>
                                    </div>
                                </div>

                                <div className="persona-distribution">
                                    <h4>Customer Personas</h4>
                                    <div className="persona-grid">
                                        {Object.entries(customerAnalytics.personaDistribution || {}).map(([persona, count]) => (
                                            <div key={persona} className="persona-card">
                                                <span className="persona-name">{persona.replace('_', ' ')}</span>
                                                <span className="persona-count">{count} customers</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showCustomerSection && customers.length > 0 && (
                            <div className="customer-list">
                                <h4>Customer Details</h4>
                                <div className="customer-table-container">
                                    <table className="customer-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Persona</th>
                                                <th>Price Conscious</th>
                                                <th>Loyalty</th>
                                                <th>Mobile Pref</th>
                                                <th>Avg Order</th>
                                                <th>Visits/Month</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.slice(0, 10).map(customer => (
                                                <tr key={customer._id}>
                                                    <td>{customer.name}</td>
                                                    <td>
                                                        <span className={`persona-badge ${customer.persona.toLowerCase()}`}>
                                                            {customer.persona.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>{customer.priceConsciousness}%</td>
                                                    <td>{customer.loyaltyTendency}%</td>
                                                    <td>{customer.mobilePref}%</td>
                                                    <td>${customer.avgOrderValue}</td>
                                                    <td>{customer.visitFrequency}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {customers.length > 10 && (
                                        <p className="showing-text">Showing first 10 of {customers.length} customers</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'simulation':
                return (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3>🎯 Business Simulation</h3>
                            <div className="simulation-actions">
                                <button
                                    onClick={handleRunSimulation}
                                    disabled={simulationRunning || customers.length === 0 || products.length === 0}
                                    className="run-simulation-btn"
                                >
                                    {simulationRunning ? '⏳ Running...' : '🚀 Run 7-Day Simulation'}
                                </button>
                                {transactionAnalytics && (
                                    <button
                                        onClick={() => setShowTransactionSection(!showTransactionSection)}
                                        className="toggle-analytics-btn"
                                    >
                                        {showTransactionSection ? 'Hide Analytics' : 'Show Analytics'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {customers.length === 0 && (
                            <div className="simulation-warning">
                                ⚠️ Generate customers first to run simulations
                            </div>
                        )}

                        {products.length === 0 && (
                            <div className="simulation-warning">
                                ⚠️ Add products first to run simulations
                            </div>
                        )}

                        {transactionAnalytics && (
                            <div className="transaction-overview">
                                <div className="overview-grid">
                                    <div className="overview-card revenue">
                                        <h4>Total Revenue</h4>
                                        <p className="big-number">${transactionAnalytics.totalRevenue?.toFixed(2)}</p>
                                    </div>
                                    <div className="overview-card transactions">
                                        <h4>Successful Transactions</h4>
                                        <p className="big-number">{transactionAnalytics.successfulTransactions}</p>
                                        <small>{transactionAnalytics.totalTransactions} total</small>
                                    </div>
                                    <div className="overview-card avg-order">
                                        <h4>Avg Order Value</h4>
                                        <p className="big-number">${transactionAnalytics.averageOrderValue?.toFixed(2)}</p>
                                    </div>
                                    <div className="overview-card success-rate">
                                        <h4>Success Rate</h4>
                                        <p className="big-number">
                                            {transactionAnalytics.totalTransactions > 0 ?
                                                ((transactionAnalytics.successfulTransactions / transactionAnalytics.totalTransactions) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showTransactionSection && transactionAnalytics && (
                            <div className="detailed-analytics">
                                <div className="analytics-row">
                                    <div className="analytics-section">
                                        <h4>Payment Methods</h4>
                                        <div className="payment-methods">
                                            {Object.entries(transactionAnalytics.paymentMethodDistribution || {}).map(([method, count]) => (
                                                <div key={method} className="payment-method-item">
                                                    <span className="method-name">{method}</span>
                                                    <span className="method-count">{count} transactions</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="analytics-section">
                                        <h4>Customer Persona Performance</h4>
                                        <div className="persona-performance">
                                            {Object.entries(transactionAnalytics.personaPerformance || {}).map(([persona, data]) => (
                                                <div key={persona} className="persona-performance-item">
                                                    <div className="persona-info">
                                                        <span className="persona-name">{persona.replace('_', ' ')}</span>
                                                        <span className="persona-stats">
                                                            {data.transactions} transactions • ${data.revenue?.toFixed(2)} revenue
                                                        </span>
                                                    </div>
                                                    <div className="success-rate-badge">
                                                        {data.successRate}% success
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {transactionAnalytics.recentTransactions?.length > 0 && (
                                    <div className="recent-transactions">
                                        <h4>Recent Transactions</h4>
                                        <div className="transaction-list">
                                            {transactionAnalytics.recentTransactions.slice(0, 5).map((transaction, index) => (
                                                <div key={transaction._id || index} className="transaction-item">
                                                    <div className="transaction-info">
                                                        <span className="customer-name">
                                                            {transaction.customer?.name || 'Unknown Customer'}
                                                        </span>
                                                        <span className="transaction-amount">
                                                            ${transaction.finalAmount?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="transaction-meta">
                                                        <span className={`status ${transaction.paymentStatus?.toLowerCase()}`}>
                                                            {transaction.paymentStatus}
                                                        </span>
                                                        <span className="payment-method">
                                                            {transaction.paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'payments':
                return (
                    <div className="tab-content">
                        <div className="section-header">
                            <h3>💳 Payment Gateway Configuration</h3>
                            <button onClick={() => setShowPaymentConfig(!showPaymentConfig)} className="config-btn">
                                {showPaymentConfig ? 'Hide Config' : 'Configure Gateways'}
                            </button>
                        </div>

                        <div className="payment-gateways-overview">
                            <div className="gateway-grid">
                                <div className="gateway-card active">
                                    <div className="gateway-header">
                                        <h4>💳 Credit/Debit Cards</h4>
                                        <span className="status-badge active">Active</span>
                                    </div>
                                    <p>Success Rate: 95%</p>
                                    <p>Processing Fee: 2.9%</p>
                                </div>
                                
                                <div className="gateway-card active">
                                    <div className="gateway-header">
                                        <h4>📱 UPI Payments</h4>
                                        <span className="status-badge active">Active</span>
                                    </div>
                                    <p>Success Rate: 98%</p>
                                    <p>Processing Fee: 0.5%</p>
                                </div>
                                
                                <div className="gateway-card">
                                    <div className="gateway-header">
                                        <h4>💰 Digital Wallets</h4>
                                        <span className="status-badge">Inactive</span>
                                    </div>
                                    <p>Success Rate: 92%</p>
                                    <p>Processing Fee: 1.8%</p>
                                </div>
                                
                                <div className="gateway-card">
                                    <div className="gateway-header">
                                        <h4>₿ Cryptocurrency</h4>
                                        <span className="status-badge">Inactive</span>
                                    </div>
                                    <p>Success Rate: 88%</p>
                                    <p>Processing Fee: 1.2%</p>
                                </div>
                            </div>
                        </div>

                        {showPaymentConfig && (
                            <div className="payment-config-section">
                                <h4>Gateway Configuration</h4>
                                <div className="config-form">
                                    <div className="config-item">
                                        <label>Card Processing Success Rate (%)</label>
                                        <input type="range" min="80" max="99" defaultValue="95" />
                                        <span>95%</span>
                                    </div>
                                    <div className="config-item">
                                        <label>UPI Success Rate (%)</label>
                                        <input type="range" min="85" max="99" defaultValue="98" />
                                        <span>98%</span>
                                    </div>
                                    <div className="config-item">
                                        <label>Enable Fraud Detection</label>
                                        <input type="checkbox" defaultChecked />
                                    </div>
                                    <div className="config-item">
                                        <label>Transaction Timeout (seconds)</label>
                                        <input type="number" min="10" max="300" defaultValue="30" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return <div>Tab not found</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>BizStratSim Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {message && <p className="message">{message}</p>}

            {!store ? (
                <div className="form-section">
                    <h2>Create Your Store</h2>
                    <form onSubmit={handleCreateStore} className="dashboard-form">
                        <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store Name" required />
                        <textarea value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} placeholder="Store Description" required></textarea>
                        <button type="submit">Create Store</button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="store-info-section">
                        <div className="store-header">
                            <div>
                                <h2>Welcome to {store.name}</h2>
                                <p>{store.description}</p>
                            </div>
                            <button onClick={handleDeleteStore} className="delete-store-btn">Delete Store</button>
                        </div>
                    </div>

                    <div className="dashboard-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Overview
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            📦 Products
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'strategies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('strategies')}
                        >
                            🎯 Strategies
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('customers')}
                        >
                            👥 Customers
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('simulation')}
                        >
                            🚀 Simulation
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            💳 Payments
                        </button>
                    </div>

                    {renderTabContent()}
                </>
            )}
        </div>
    );
};

export default Dashboard;