// Test frontend API connection
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testFrontendAPI() {
  console.log('🔍 Testing frontend API connection...');

  try {
    // Test health
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData.success ? 'OK' : 'Failed');

    // Test products
    const products = await fetch(`${API_BASE}/products`);
    const productsData = await products.json();
    console.log('✅ Products:', productsData.success ? `${productsData.count} items` : 'Failed');

    if (productsData.success && productsData.data) {
      console.log('📦 Sample product:', productsData.data[0]?.name || 'No products');
    }

    // Test categories
    const categories = await fetch(`${API_BASE}/categories`);
    const categoriesData = await categories.json();
    console.log('✅ Categories:', categoriesData.success ? `${categoriesData.count} items` : 'Failed');

    // Test product detail
    if (productsData.data && productsData.data[0]) {
      const productDetail = await fetch(`${API_BASE}/products/${productsData.data[0]._id}`);
      const detailData = await productDetail.json();
      console.log('✅ Product detail:', detailData.success ? 'OK' : 'Failed');
    }

    console.log('🎉 Frontend API integration ready!');
    return true;

  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
    return false;
  }
}

testFrontendAPI();
