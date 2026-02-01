const mongoose = require('mongoose');

// Simple database setup with automatic fallback
const setupDatabase = async () => {
  console.log('\n🔧 Setting up database...\n');

  // Try MongoDB Atlas first (if configured)
  const mongoUri = process.env.MONGODB_URI;
  
  if (mongoUri && !mongoUri.includes('YOUR_PASSWORD_HERE') && !mongoUri.includes('localhost')) {
    try {
      console.log('🌐 Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB Atlas successfully!\n');
      return true;
    } catch (error) {
      console.log('⚠️  MongoDB Atlas connection failed:', error.message);
      console.log('📝 Continuing with setup...\n');
    }
  }

  // Try local MongoDB
  if (mongoUri && mongoUri.includes('localhost')) {
    try {
      console.log('💻 Connecting to local MongoDB...');
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to local MongoDB successfully!\n');
      return true;
    } catch (error) {
      console.log('⚠️  Local MongoDB not available:', error.message);
    }
  }

  // Show setup instructions
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  QUICK DATABASE SETUP                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Option 1: MongoDB Atlas (Recommended - FREE & Easy)\n');
  console.log('   1. Visit: https://mongodb.com/cloud/atlas/register');
  console.log('   2. Create FREE account (no credit card)');
  console.log('   3. Create FREE cluster (M0 tier)');
  console.log('   4. Create database user');
  console.log('   5. Get connection string');
  console.log('   6. Update MONGODB_URI in .env file');
  console.log('   7. Restart server\n');
  
  console.log('📋 Option 2: Local MongoDB\n');
  console.log('   1. Download: https://mongodb.com/try/download/community');
  console.log('   2. Install MongoDB Community Server');
  console.log('   3. Start MongoDB service');
  console.log('   4. Update .env: MONGODB_URI=mongodb://localhost:27017/edutrack');
  console.log('   5. Restart server\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⏱️  Setup takes 5 minutes | Server will wait here...\n');
  console.log('💡 See MONGODB_SETUP.md for detailed instructions\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Keep trying to connect every 10 seconds
  return new Promise((resolve) => {
    const checkConnection = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(checkConnection);
        console.log('✅ Database connected! Server starting...\n');
        resolve(true);
        return;
      }

      // Try to reconnect
      try {
        const uri = process.env.MONGODB_URI;
        if (uri && !uri.includes('YOUR_PASSWORD_HERE')) {
          await mongoose.connect(uri);
          clearInterval(checkConnection);
          console.log('✅ Database connected! Server starting...\n');
          resolve(true);
        }
      } catch (error) {
        // Silent retry
      }
    }, 10000);
  });
};

module.exports = setupDatabase;
