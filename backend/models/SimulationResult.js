const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { DBConnection } = require('./db'); // Assuming this path is correct

// Load env vars
dotenv.config();

// Debug environment variables
console.log('🔍 Environment Variables Check:');
console.log('MONGO_URL:', process.env.MONGO_URL ? 'Found' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Missing');

// Route files
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const customerRoutes = require('./routes/customerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Connect to database
DBConnection().catch(err => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
});

// Middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser for JSON

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const handleRunSimulation = async () => {
    console.log('🚀 Starting 7-day simulation...');
    setSimulationRunning(true);
    try {
        // Run the simulation
        const res = await api.post('/transactions/simulate', { days: 7 });
        const transactionCount = res.data.data?.transactions || 0;
        
        // Get analytics
        const analyticsRes = await api.get('/transactions/analytics');
        setTransactionAnalytics(analyticsRes.data.data);
        
        // Save simulation result
        const simulationData = {
            inputs: {
                days: 7,
                customerCount: customers.length,
                productCount: products.length,
                activeStrategies: strategies.filter(s => s.isActive).length
            },
            metrics: {
                transactionCount,
                revenue: analyticsRes.data.data?.totalRevenue || 0,
                orderValue: analyticsRes.data.data?.averageOrderValue || 0,
                successRate: analyticsRes.data.data?.successRate || 0
            },
            raw: {
                transactions: res.data.data,
                analytics: analyticsRes.data.data
            },
            notes: `7-day simulation with ${customers.length} customers and ${strategies.filter(s => s.isActive).length} active strategies`
        };

        // Get the first active strategy's ID (you might want to adjust this logic)
        const activeStrategy = strategies.find(s => s.isActive);
        if (activeStrategy) {
            const savedSim = await api.post(`/api/strategies/${activeStrategy._id}/simulations`, simulationData);
            console.log('✅ Simulation saved:', savedSim.data);
            
            // Update simulation history
            setSimulationHistory(prev => [savedSim.data, ...prev]);
        }
        
        setMessage(`Simulation complete! Generated ${transactionCount} transactions over 7 days.`);
        
        // Refresh simulation history
        const historyRes = await api.get(`/api/strategies/${activeStrategy._id}/simulations`);
        setSimulationHistory(historyRes.data.data);
        
    } catch (error) {
        console.error('❌ Simulation error:', error);
        let errorMessage = 'Failed to run simulation.';
        if (error.response?.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        setMessage(`Error: ${errorMessage}`);
    } finally {
        setSimulationRunning(false);
    }
};

const [simulationHistory, setSimulationHistory] = useState([]);
const [selectedSimulation, setSelectedSimulation] = useState(null);

const loadSimulationHistory = async (strategyId) => {
    try {
        const res = await api.get(`/api/strategies/${strategyId}/simulations`);
        setSimulationHistory(res.data.data);
    } catch (error) {
        console.error('Failed to load simulation history:', error);
    }
};

{/* Add this after your existing simulation controls */}
{simulationHistory.length > 0 && (
    <div className="simulation-history">
        <h4>Simulation History</h4>
        <div className="simulation-list">
            {simulationHistory.map(sim => (
                <div 
                    key={sim._id} 
                    className={`simulation-card ${selectedSimulation?._id === sim._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSimulation(sim)}
                >
                    <div className="simulation-card-header">
                        <span className="sim-date">{new Date(sim.createdAt).toLocaleString()}</span>
                        <span className="sim-metrics">
                            💰 ${sim.metrics.revenue.toLocaleString()}
                        </span>
                    </div>
                    <div className="simulation-card-body">
                        <p>{sim.notes}</p>
                        <div className="sim-stats">
                            <span>📊 {sim.metrics.transactionCount} transactions</span>
                            <span>💵 ${sim.metrics.orderValue.toFixed(2)} avg order</span>
                            <span>✅ {(sim.metrics.successRate * 100).toFixed(1)}% success</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)}

{selectedSimulation && (
    <div className="simulation-details">
        <h4>Simulation Details</h4>
        <button 
            className="close-details"
            onClick={() => setSelectedSimulation(null)}
        >
            ×
        </button>
        <div className="details-content">
            <div className="details-section">
                <h5>Input Parameters</h5>
                <ul>
                    <li>Duration: {selectedSimulation.inputs.days} days</li>
                    <li>Customers: {selectedSimulation.inputs.customerCount}</li>
                    <li>Products: {selectedSimulation.inputs.productCount}</li>
                    <li>Active Strategies: {selectedSimulation.inputs.activeStrategies}</li>
                </ul>
            </div>
            <div className="details-section">
                <h5>Results</h5>
                <ul>
                    <li>Total Revenue: ${selectedSimulation.metrics.revenue.toLocaleString()}</li>
                    <li>Transactions: {selectedSimulation.metrics.transactionCount}</li>
                    <li>Avg Order Value: ${selectedSimulation.metrics.orderValue.toFixed(2)}</li>
                    <li>Success Rate: {(selectedSimulation.metrics.successRate * 100).toFixed(1)}%</li>
                </ul>
            </div>
        </div>
    </div>
)}


