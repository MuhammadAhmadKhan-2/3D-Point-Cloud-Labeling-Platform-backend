import axios from 'axios';

const testPendingUsersAPI = async () => {
  try {
    console.log('Testing pending users API endpoint...');
    
    // Test without authentication first
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users/pending');
      console.log('✅ API Response (without auth):', response.data);
    } catch (error) {
      console.log('❌ API Error (without auth):', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }

    // Test health endpoint
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test with mock admin token (you'll need to replace this with a real token)
    console.log('\n--- Testing with authentication ---');
    console.log('Note: You need to login as admin first to get a valid token');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testPendingUsersAPI();
