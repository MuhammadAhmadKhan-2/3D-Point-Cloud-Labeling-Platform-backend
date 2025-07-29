import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express()

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    console.log('Headers:', req.headers)
    console.log('Origin:', req.get('Origin'))
    next()
})

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://metabread.cloud',
    'https://quiet-salmiakki-361d30.netlify.app',
    'https://quiet-salmiakki-361d38.netlify.app',
    'https://pointcloudlabelingplatform.netlify.app',
    'https://3-d-point-cloud-labeling-platform-backend-fwrl-7fz79tgej.vercel.app',
];

// Enable CORS for all routes
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if the origin is in the allowed list or matches a pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
        // Simple check for exact match or subdomain
        if (!origin) return false;
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
        
        return normalizedOrigin === normalizedAllowed || 
               normalizedOrigin === `https://www.${normalizedAllowed.replace('https://', '')}` ||
               normalizedOrigin.startsWith(normalizedAllowed);
    });

    if (isAllowed || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, x-access-token');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

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
