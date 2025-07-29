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
    'https://3-d-point-cloud-labeling-platfor-git-99cd39-ahmadkhans-projects.vercel.app'
];

// Enable CORS for all routes
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('Checking origin:', origin); // Debug log
    
    // Check if the origin is in the allowed list
    let isAllowed = false;
    
    if (origin) {
        const normalizedOrigin = origin.replace(/\/$/, '');
        
        isAllowed = allowedOrigins.some(allowedOrigin => {
            const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
            
            return normalizedOrigin === normalizedAllowed || 
                   normalizedOrigin === `https://www.${normalizedAllowed.replace('https://', '')}` ||
                   normalizedOrigin.startsWith(normalizedAllowed);
        });
    }

    console.log('Origin allowed:', isAllowed); // Debug log

    // Set CORS headers if origin is allowed OR for non-browser requests (no origin)
    if (isAllowed || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, x-access-token');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        console.log('CORS headers set for origin:', origin); // Debug log
    } else {
        console.log('CORS headers NOT set - origin not allowed:', origin); // Debug log
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request'); // Debug log
        return res.status(200).end();
    }

    next();
});

// Alternative: Use the cors package instead (recommended)
// Uncomment this and comment out the custom CORS middleware above if you prefer
/*
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
            return normalizedOrigin === normalizedAllowed || 
                   normalizedOrigin === `https://www.${normalizedAllowed.replace('https://', '')}` ||
                   normalizedOrigin.startsWith(normalizedAllowed);
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-access-token'],
    exposedHeaders: ['Content-Range', 'X-Total-Count']
}));
*/

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
