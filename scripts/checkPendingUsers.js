import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPendingUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database');

    // Check all users
    const allUsers = await User.find({});
    console.log('\n=== ALL USERS ===');
    console.log(`Total users: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Status: ${user.status}, Role: ${user.role}`);
    });

    // Check pending users specifically
    const pendingUsers = await User.find({ status: 'pending' });
    console.log('\n=== PENDING USERS ===');
    console.log(`Total pending users: ${pendingUsers.length}`);
    
    pendingUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Status: ${user.status}, Role: ${user.role}`);
    });

    // If no pending users exist, create a sample one
    if (pendingUsers.length === 0) {
      console.log('\n=== CREATING SAMPLE PENDING USER ===');
      const sampleUser = new User({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'client',
        status: 'pending'
      });
      
      await sampleUser.save();
      console.log('Sample pending user created successfully');
      
      // Verify creation
      const newPendingUsers = await User.find({ status: 'pending' });
      console.log(`New pending users count: ${newPendingUsers.length}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
};

checkPendingUsers();
