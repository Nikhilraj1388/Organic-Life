import mongoose from 'mongoose';

export function getMongoUrl() {
  // Support multiple common environment variable names so developers
  // can use either DATABASE_URL or MONGODB_URI (or MONGODB_URL).
  // This same connection string can be used in MongoDB Compass
  const candidates = [process.env.DATABASE_URL, process.env.MONGODB_URI, process.env.MONGODB_URL, process.env.MONGO_URL];
  const url = candidates.find((u) => typeof u === 'string' && u.length > 0);
  if (!url) {
    throw new Error(
      'Missing MongoDB connection URL. Please set one of: DATABASE_URL, MONGODB_URI, MONGODB_URL, or MONGO_URL in your .env\n' +
      'Example: MONGODB_URI=mongodb://localhost:27017/organic-life\n' +
      'Use the same connection string in MongoDB Compass to view your database.'
    );
  }
  return url;
}

export async function connectDb(mongoUrl?: string) {
  const url = mongoUrl ?? getMongoUrl();
  
  // Connection options compatible with MongoDB Compass and standard MongoDB connections
  const connectionOptions: mongoose.ConnectOptions = {
    // Use these options for better compatibility with MongoDB Compass
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // Note: Removing family: 4 to allow both IPv4 and IPv6
    // If you need to force IPv4, you can uncomment: family: 4
  };

  try {
    await mongoose.connect(url, connectionOptions);
    const sanitizedUrl = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'); // Hide credentials in logs
    console.log(`✅ Connected to MongoDB: ${sanitizedUrl}`);
    console.log(`   Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    return mongoose;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('❌ MongoDB connection error:');
    console.error(`   URL: ${url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.error(`   Error: ${errorMessage}`);
    
    // Provide helpful error messages for common issues
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Make sure MongoDB is installed and running');
      console.error('   2. Check if MongoDB service is running: Get-Service "*mongo*"');
      console.error('   3. Verify the connection string in your .env file');
      console.error('   4. Try connecting with MongoDB Compass using the same connection string');
      console.error('   5. If using MongoDB Atlas, check your IP whitelist and credentials');
    } else if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
      console.error('\n💡 Authentication issue:');
      console.error('   Check your username and password in the connection string');
      console.error('   Format: mongodb://username:password@host:port/database?authSource=admin');
    } else if (errorMessage.includes('timeout')) {
      console.error('\n💡 Timeout issue:');
      console.error('   MongoDB might be taking too long to respond');
      console.error('   Check if MongoDB is running and accessible');
    }
    
    throw error;
  }
}

export default connectDb;
