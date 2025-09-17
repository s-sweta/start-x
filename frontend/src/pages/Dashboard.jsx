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

    // --- NEW: State to toggle the add product form's visibility ---
    const [showProductForm, setShowProductForm] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeRes = await api.get('/stores/my-store');
                if (storeRes.data.success && storeRes.data.data) {
                    setStore(storeRes.data.data);
                    const [productsRes, strategiesRes] = await Promise.all([
                        api.get('/products'),
                        api.get('/strategies')
                    ]);
                    setProducts(productsRes.data.data);
                    setStrategies(strategiesRes.data.data);
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
                // Update existing strategy
                const res = await api.put(`/strategies/${editingStrategy._id}`, strategyData);
                setStrategies(strategies.map(s => s._id === editingStrategy._id ? res.data.data : s));
                setMessage('Strategy updated successfully!');
            } else {
                // Create new strategy
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
            setShowProductForm(false)
            setMessage('Product added successfully!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add product.');
        }
    };

    // --- NEW: Handler to delete a product ---
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

    // --- NEW: Handler to delete the entire store ---
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };
    
    if (loading) return <div className="page-container"><h2>Loading Dashboard...</h2></div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                 <h1>Dashboard</h1>
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
                            {/* --- NEW: Add Product Button --- */}
                            <button onClick={() => setShowProductForm(!showProductForm)} className="add-product-btn">
                                {showProductForm ? 'Cancel' : '+ Add Product'}
                            </button>
                        </div>
                        {/* --- NEW: Delete Store Button --- */}
                        <button onClick={handleDeleteStore} className="delete-store-btn">Delete Store</button>
                    </div>

                    {/* --- NEW: Conditionally render the Add Product form --- */}
                    {showProductForm && (
                        <div className="form-section">
                            <h3>Add a New Product</h3>
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
                        <h3>Your Products</h3>
                        {products.length > 0 ? (
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Actions</th>{/* --- NEW: Actions Column --- */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>${parseFloat(product.price).toFixed(2)}</td>
                                            <td>{product.category}</td>
                                            {/* --- NEW: Delete Button for each product --- */}
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

                    <div className="strategy-section">
                        <div className="strategy-header">
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

                </>
            )}
        </div>
    );
};

export default Dashboard;