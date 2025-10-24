// Simple test to verify API connection
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api'
};

async function testAPI() {
  try {
    console.log('🧪 Testing API connection...');

    // Test health endpoint
    const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test products endpoint
    const productsResponse = await fetch(`${API_CONFIG.BASE_URL}/products`);
    const productsData = await productsResponse.json();
    console.log('✅ Products:', productsData);

    // Test categories endpoint
    const categoriesResponse = await fetch(`${API_CONFIG.BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories:', categoriesData);

    console.log('🎉 All API endpoints working!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

testAPI();
