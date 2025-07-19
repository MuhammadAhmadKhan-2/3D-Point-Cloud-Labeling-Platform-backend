import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register a new user (pending approval)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user with pending status
    const user = new User({
      name,
      email,
      password,
      role,
      status: 'pending'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration request sent. Please wait for admin approval.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user (only approved users)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    // Step 1: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Step 2: Check if user exists in database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Step 3: Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Step 4: Validate role selection matches database role
    if (!selectedRole) {
      return res.status(400).json({
        success: false,
        message: 'Role selection is required'
      });
    }

    if (selectedRole !== user.role) {
      return res.status(400).json({
        success: false,
        message: 'Role mismatch. Please select the correct role for your account'
      });
    }

    // Step 5: Check account approval status
    if (user.status === 'pending') {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please contact administrator'
      });
    }

    if (user.status === 'rejected') {
      return res.status(401).json({
        success: false,
        message: 'Your account has been rejected. Please contact administrator'
      });
    }

    if (user.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please contact administrator'
      });
    }

    // Step 6: Generate authentication token for successful login
    const token = generateToken(user._id);

    // Step 7: Return success response with user data and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
