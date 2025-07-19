// api/index.js
import express from "express"
import dotenv from "dotenv"
dotenv.config()

import connectDb from "../config/db.js"
import cors from "cors"
import authRoutes from "../routes/auth.js"
import adminRoutes from "../routes/admin.js"

const app = express()

// Connect to DB (only once when cold start)
connectDb()

// CORS (update origin to frontend URL when live)
app.use(cors({
    origin: "*", // or your deployed frontend
    credentials: true
}))

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
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
        message: 'Internal server error'
    })
})


export default app
