const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DBConnection = async () => {
    const MONGO_URI = process.env.MONGO_URL;
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ DB Connection established");
    } catch (error) {
        console.log("❌ Error while connecting to Mongo:", error.message);
        throw error; // Re-throw to prevent server from starting with no DB
    }
};

module.exports = {DBConnection}