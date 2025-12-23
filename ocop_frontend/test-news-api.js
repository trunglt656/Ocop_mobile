// Test script để kiểm tra kết nối API từ mobile
// Chạy: node test-news-api.js

const API_BASE = 'http://192.168.1.4:5000/api'; // Thay IP này bằng IP máy tính của bạn

async function testAPI() {
  console.log('Testing News API...\n');
  
  try {
    // Test 1: Get all news
    console.log('1. Testing /news endpoint...');
    const response1 = await fetch(`${API_BASE}/news?status=published&limit=5`);
    const data1 = await response1.json();
    console.log('   Status:', response1.status);
    console.log('   Success:', data1.success);
    console.log('   News count:', data1.data?.news?.length || 0);
    console.log('   Total count:', data1.data?.totalCount || 0);
    
    // Test 2: Get featured news
    console.log('\n2. Testing /news/featured endpoint...');
    const response2 = await fetch(`${API_BASE}/news/featured`);
    const data2 = await response2.json();
    console.log('   Status:', response2.status);
    console.log('   Success:', data2.success);
    console.log('   Featured count:', data2.data?.news?.length || 0);
    
    if (data2.data?.news?.length > 0) {
      console.log('\n3. Sample news item:');
      const sample = data2.data.news[0];
      console.log('   Title:', sample.title);
      console.log('   Category:', sample.category);
      console.log('   Thumbnail:', sample.thumbnail?.substring(0, 50) + '...');
    }
    
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('   Make sure:');
    console.error('   1. Backend is running at', API_BASE);
    console.error('   2. Your mobile device can access this IP');
    console.error('   3. Both devices are on same WiFi network');
  }
}

testAPI();
