// Standalone script to verify the MongoDB connection defined in .env.
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

async function checkConnection() {
  console.log('🔍 Starting MongoDB connection check...');

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in the environment variables.');
    process.exitCode = 1;
    return;
  }

  console.log('ℹ️  Using connection string from MONGODB_URI');

  const start = Date.now();

  try {
    const connection = await mongoose.connect(uri, {
      // Keep the timeout short so the script fails fast on misconfiguration.
      serverSelectionTimeoutMS: 5000,
    });

    const elapsed = Date.now() - start;
    console.log('✅ MongoDB connected successfully.');
    console.log(`   Database: ${connection.connection.name}`);
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Port: ${connection.connection.port}`);
    console.log(`   Connection established in ${elapsed}ms`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB.');
    console.error(`   Name: ${error.name}`);
    console.error(`   Message: ${error.message}`);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('   Tips:');
      console.error('     • Ensure the MongoDB server is reachable.');
      console.error('     • Verify username/password and network access.');
      console.error('     • Check IP whitelist rules if using MongoDB Atlas.');
    } else if (error.name === 'MongoParseError') {
      console.error('   Tips:');
      console.error('     • Review the format of the MongoDB connection string.');
      console.error('     • Confirm credentials are URL-encoded if needed.');
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {
      // Ignore disconnect errors; the primary goal is connection validation.
    });
    console.log('🔚 MongoDB connection check complete.');
  }
}

checkConnection();
