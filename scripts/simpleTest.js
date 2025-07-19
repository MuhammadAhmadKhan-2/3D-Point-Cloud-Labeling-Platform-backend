import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const simpleTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database');

    // Create admin if doesn't exist
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'approved'
      });
      await admin.save();
      console.log('Admin created');
    }

    // Create pending user if doesn't exist
    let pendingUser = await User.findOne({ status: 'pending' });
    if (!pendingUser) {
      pendingUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'client',
        status: 'pending'
      });
      await pendingUser.save();
      console.log('Pending user created');
    }

    // Check counts
    const totalUsers = await User.countDocuments();
    const pendingCount = await User.countDocuments({ status: 'pending' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log(`Total users: ${totalUsers}`);
    console.log(`Pending users: ${pendingCount}`);
    console.log(`Admin users: ${adminCount}`);

    // List all users
    const allUsers = await User.find({}).select('name email role status');
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
};

simpleTest();
