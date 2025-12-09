const mongoose = require('mongoose');

// MongoDB connection URL (local MongoDB)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-portal';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Document Schema
const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    filesize: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Create model
const Document = mongoose.model('Document', documentSchema);

module.exports = { connectDB, Document };
