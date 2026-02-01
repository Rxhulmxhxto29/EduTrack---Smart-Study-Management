const mongoose = require('mongoose');
const { connectMemoryDB } = require('./memoryDatabase');

const connectDB = async () => {
  // Check if we should use in-memory database
  const useMemoryDB = process.env.USE_MEMORY_DB === 'true' || 
                      !process.env.MONGODB_URI || 
                      process.env.MONGODB_URI.includes('YOUR_PASSWORD_HERE');

  if (useMemoryDB) {
    console.log('🎯 Using in-memory MongoDB (development mode)');
    return await connectMemoryDB();
  }

  // Use regular MongoDB connection
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.log('\n💡 Falling back to in-memory database...\n');
    return await connectMemoryDB();
  }
};

module.exports = connectDB;
