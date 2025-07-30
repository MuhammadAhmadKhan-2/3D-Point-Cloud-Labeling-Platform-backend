import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express()

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://calm-hamster-1e3234.netlify.app",
        "https://metabread.cloud",
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to database once
let dbConnected = false;
const ensureDbConnection = async () => {
    if (!dbConnected) {
        await connectDb();
        dbConnected = true;
    }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await ensureDbConnection();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// Root route for Vercel
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running on Vercel'
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
})

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000
    app.listen(port, () => {
        console.log(`Server is started on port ${port}`)
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
}

// Export the app for Vercel
export default app;
