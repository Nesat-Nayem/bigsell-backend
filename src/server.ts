import mongoose from 'mongoose';
import app from './app'; 
import config from './app/config';

// For Vercel deployment, we need to handle database connection differently
let isConnected = false;

async function connectDB() {
    if (isConnected) {
        return;
    }
    
    try {
        await mongoose.connect(config.database_url as string);
        isConnected = true;
        console.log('Database connected successfully');
    } catch (err) {
        console.log('Database connection error:', err);
        throw err;
    }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = config.port || 3000;
    connectDB().then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }).catch((err) => {
        console.log('Failed to start server:', err);
    });
} else {
    // Connect to database on module initialization for Vercel/production
    connectDB();
}

// For Vercel deployment - export the app directly
module.exports = app;