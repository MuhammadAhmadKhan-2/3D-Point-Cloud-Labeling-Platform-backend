import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Status: ${existingAdmin.status}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      // Update admin status to approved if it's not
      if (existingAdmin.status !== 'approved') {
        existingAdmin.status = 'approved';
        await existingAdmin.save();
        console.log('✅ Admin user status updated to approved');
      }
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      const adminUser = new User({
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'approved' // Admin should be pre-approved
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    }

    // List all users for verification
    const allUsers = await User.find({});
    console.log('\n=== ALL USERS ===');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
};

createAdminUser();
