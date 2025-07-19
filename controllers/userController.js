import User from '../models/User.js';

// Get all pending users (admin)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      message: 'Pending users retrieved successfully',
      data: {
        users: pendingUsers,
        count: pendingUsers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending users',
      error: error.message
    });
  }
};

// Get all users (with optional filters)
export const getAllUsers = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get users', error: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user', error: error.message });
  }
};

// Approve a user (admin)
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'pending') {
      return res.status(400).json({ success: false, message: `User is already ${user.status}` });
    }
    user.status = 'approved';
    await user.save();
    res.json({ success: true, message: 'User approved', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve user', error: error.message });
  }
};

// Reject a user (admin)
export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'pending') {
      return res.status(400).json({ success: false, message: `User is already ${user.status}` });
    }
    user.status = 'rejected';
    await user.save();
    res.json({ success: true, message: 'User rejected', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject user', error: error.message });
  }
};

// Delete a user (admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// Get user stats (admin)
export const getUserStats = async (req, res) => {
  try {
    const pending = await User.countDocuments({ status: 'pending' });
    const approved = await User.countDocuments({ status: 'approved' });
    const rejected = await User.countDocuments({ status: 'rejected' });
    res.json({
      success: true,
      data: { pending, approved, rejected }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
};
