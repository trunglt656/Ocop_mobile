// Test script for admin API
const http = require('http');

async function testAdminAPI() {
  console.log('🧪 Testing Admin API...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await makeRequest('GET', '/api/health');
    console.log('✅ Health:', healthResponse.success ? 'OK' : 'FAILED');
    console.log('   Message:', healthResponse.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Admin login
  console.log('\n2️⃣ Testing admin login...');
  try {
    const loginResponse = await makeRequest('POST', '/api/admin/login', {
      email: 'admin@ocop.vn',
      password: 'admin123'
    });
    console.log('✅ Login:', loginResponse.success ? 'SUCCESS' : 'FAILED');
    if (loginResponse.success) {
      console.log('   User:', loginResponse.data?.user?.name || 'UNKNOWN');
      console.log('   Token:', loginResponse.data?.token ? 'RECEIVED' : 'MISSING');
    } else {
      console.log('   Error:', loginResponse.message);
    }
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }

  // Test 3: Get current user (with token)
  console.log('\n3️⃣ Testing get current user...');
  try {
    const userResponse = await makeRequestWithToken('GET', '/api/admin/me', 'admin-jwt-token-123');
    console.log('✅ Get user:', userResponse.success ? 'SUCCESS' : 'FAILED');
    if (userResponse.success) {
      console.log('   User:', userResponse.data?.name || 'UNKNOWN');
    } else {
      console.log('   Error:', userResponse.message);
    }
  } catch (error) {
    console.log('❌ Get user failed:', error.message);
  }

  // Test 4: Dashboard stats (with token)
  console.log('\n4️⃣ Testing dashboard stats...');
  try {
    const statsResponse = await makeRequestWithToken('GET', '/api/admin/dashboard/stats', 'admin-jwt-token-123');
    console.log('✅ Dashboard:', statsResponse.success ? 'SUCCESS' : 'FAILED');
    if (statsResponse.success) {
      console.log('   Products:', statsResponse.data?.totalProducts || 0);
      console.log('   Orders:', statsResponse.data?.totalOrders || 0);
      console.log('   Revenue:', statsResponse.data?.totalRevenue || 0);
    } else {
      console.log('   Error:', statsResponse.message);
    }
  } catch (error) {
    console.log('❌ Dashboard failed:', error.message);
  }

  console.log('\n🎉 Admin API test completed!');
}

function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          resolve({ success: res.statusCode === 200, message: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function makeRequestWithToken(method, endpoint, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          resolve({ success: res.statusCode === 200, message: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Run the test
testAdminAPI();
