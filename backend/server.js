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