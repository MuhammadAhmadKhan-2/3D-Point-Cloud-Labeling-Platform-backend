import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testCompleteFlow = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to database');

    // 1. Ensure admin user exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'approved'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      // Ensure admin is approved
      if (adminUser.status !== 'approved') {
        adminUser.status = 'approved';
        await adminUser.save();
        console.log('✅ Admin user status updated to approved');
      }
    }

    console.log(`Admin user: ${adminUser.email} (Status: ${adminUser.status})`);

    // 2. Ensure there are pending users
    let pendingUsers = await User.find({ status: 'pending' });
    if (pendingUsers.length === 0) {
      console.log('Creating sample pending users...');
      const sampleUsers = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          role: 'client',
          status: 'pending'
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: 'password123',
          role: 'qa-qc-vendor',
          status: 'pending'
        }
      ];

      for (const userData of sampleUsers) {
        const user = new User(userData);
        await user.save();
      }
      console.log('✅ Sample pending users created');
      pendingUsers = await User.find({ status: 'pending' });
    }

    console.log(`Found ${pendingUsers.length} pending users:`);
    pendingUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // 3. Test login API
    console.log('\n--- Testing Login API ---');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: adminUser.email,
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        const token = loginResponse.data.data.token;
        console.log(`Token: ${token.substring(0, 20)}...`);

        // 4. Test pending users API with token
        console.log('\n--- Testing Pending Users API ---');
        try {
          const pendingResponse = await axios.get('http://localhost:5000/api/admin/users/pending', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (pendingResponse.data.success) {
            console.log('✅ Pending users API successful');
            console.log(`Found ${pendingResponse.data.data.users.length} pending users via API`);
            pendingResponse.data.data.users.forEach((user, index) => {
              console.log(`  ${index + 1}. ${user.name} (${user.email}) - Status: ${user.status}`);
            });
          } else {
            console.log('❌ Pending users API failed:', pendingResponse.data.message);
          }
        } catch (apiError) {
          console.log('❌ Pending users API error:', apiError.response?.data || apiError.message);
        }

      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  }
};

testCompleteFlow();
