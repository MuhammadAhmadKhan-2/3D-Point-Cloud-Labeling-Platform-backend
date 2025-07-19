import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import {
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  deleteUser,
  getUserStats,
  getPendingUsers
} from '../controllers/userController.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/users/pending
// @desc    Get all pending user registrations
// @access  Private (Admin only)
router.get('/users/pending', getPendingUsers);

// @route   GET /api/admin/users
// @desc    Get all users with optional status filter
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:userId/approve
// @desc    Approve a pending user
// @access  Private (Admin only)
router.put('/users/:userId/approve', approveUser);
// @route   PUT /api/admin/users/:userId/reject
// @desc    Reject a pending user
// @access  Private (Admin only)
router.put('/users/:userId/reject', rejectUser);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', getUserStats);
// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user (soft delete by setting status to 'deleted')
// @access  Private (Admin only)
router.delete('/users/:userId', deleteUser);

export default router;
