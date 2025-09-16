const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { DBConnection } = require('./db'); // Assuming this path is correct

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/authRoutes');

// Connect to database
DBConnection();

const app = express();

// Middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser for JSON

// Mount routers
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));