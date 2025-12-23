require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const setFeaturedProducts = async () => {
  try {
    await connectDB();

    // Get all active products
    const products = await Product.find({ status: 'active' }).sort('-createdAt');
    
    console.log(`📦 Found ${products.length} active products`);

    if (products.length === 0) {
      console.log('❌ No active products found');
      return;
    }

    // Set first 50 products as featured (or all if less than 50)
    const featuredCount = Math.min(50, products.length);
    const productsToFeature = products.slice(0, featuredCount);
    
    // Update products to be featured
    const updatePromises = productsToFeature.map(product => 
      Product.findByIdAndUpdate(product._id, { isFeatured: true })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Set ${featuredCount} products as featured`);

    // Get stats
    const totalFeatured = await Product.countDocuments({ isFeatured: true });
    console.log(`📊 Total featured products: ${totalFeatured}`);

    // Show some examples
    const featuredProducts = await Product.find({ isFeatured: true })
      .limit(5)
      .select('name isFeatured');
    
    console.log('\n📋 Sample featured products:');
    featuredProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setFeaturedProducts();
