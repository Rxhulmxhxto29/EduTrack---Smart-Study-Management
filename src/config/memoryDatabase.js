const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectMemoryDB = async () => {
  try {
    console.log('🚀 Starting in-memory MongoDB server...');
    
    // Create MongoDB Memory Server instance  
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'edutrack',
      },
    });

    // Get the URI
    const uri = mongoServer.getUri();
    
    console.log('📦 In-memory MongoDB started successfully');
    console.log('🔗 Connection URI:', uri);

    // Connect mongoose to the in-memory server
    await mongoose.connect(uri);

    console.log('✅ Connected to in-memory MongoDB');
    console.log('💡 This is a temporary database that resets on restart');
    console.log('📝 Perfect for development and testing!\n');

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    return mongoServer;
  } catch (error) {
    console.error('❌ Error starting in-memory MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectMemoryDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('🛑 In-memory MongoDB stopped');
  } catch (error) {
    console.error('Error stopping in-memory MongoDB:', error);
  }
};

module.exports = {
  connectMemoryDB,
  disconnectMemoryDB,
};
