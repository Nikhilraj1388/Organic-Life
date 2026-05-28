import 'dotenv/config';
import connectDb, { getMongoUrl } from '../server/db';
import mongoose from 'mongoose';

async function checkConnection() {
  console.log('🔍 MongoDB Connection Diagnostic Tool\n');
  console.log('='.repeat(60));

  // Step 1: Check environment variables
  console.log('\n1️⃣  Checking Environment Variables...');
  const candidates = [
    process.env.DATABASE_URL,
    process.env.MONGODB_URI,
    process.env.MONGODB_URL,
    process.env.MONGO_URL,
  ];
  
  const foundEnvVar = candidates.find((u) => typeof u === 'string' && u.length > 0);
  if (foundEnvVar) {
    const sanitized = foundEnvVar.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`   ✅ Found connection string: ${sanitized}`);
  } else {
    console.log('   ❌ No MongoDB connection string found in environment variables');
    console.log('   📝 Set one of: DATABASE_URL, MONGODB_URI, MONGODB_URL, or MONGO_URL in your .env file');
    process.exit(1);
  }

  // Step 2: Try to get the connection URL
  console.log('\n2️⃣  Parsing Connection URL...');
  try {
    const url = getMongoUrl();
    const sanitized = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`   ✅ Connection URL parsed: ${sanitized}`);
    
    // Extract connection details
    try {
      const urlObj = new URL(url);
      console.log(`   📍 Host: ${urlObj.hostname}`);
      console.log(`   📍 Port: ${urlObj.port || '27017 (default)'}`);
      console.log(`   📍 Database: ${urlObj.pathname.slice(1) || 'default'}`);
    } catch (e) {
      console.log('   ⚠️  Could not parse URL details');
    }
  } catch (error: any) {
    console.log(`   ❌ Error parsing URL: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Attempt connection
  console.log('\n3️⃣  Attempting Connection...');
  try {
    const connection = await connectDb();
    
    // Step 4: Check connection state
    console.log('\n4️⃣  Checking Connection State...');
    const readyState = connection.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    console.log(`   📊 Ready State: ${readyState} (${states[readyState as keyof typeof states] || 'unknown'})`);
    
    if (readyState === 1) {
      console.log('   ✅ Connection is active and ready');
      
      // Step 5: Test database operations
      console.log('\n5️⃣  Testing Database Access...');
      try {
        const db = connection.connection.db;
        if (db) {
          console.log(`   ✅ Database accessible: ${db.databaseName}`);
          
          // List collections
          const collections = await db.listCollections().toArray();
          console.log(`   📦 Collections found: ${collections.length}`);
          if (collections.length > 0) {
            console.log('   Collections:');
            collections.forEach((col) => {
              console.log(`      - ${col.name}`);
            });
          } else {
            console.log('   ℹ️  No collections found (database is empty)');
          }
        }
      } catch (dbError: any) {
        console.log(`   ⚠️  Database access error: ${dbError.message}`);
      }
    } else {
      console.log('   ⚠️  Connection state is not "connected"');
    }

    // Step 6: Disconnect
    console.log('\n6️⃣  Cleaning Up...');
    await connection.disconnect();
    console.log('   ✅ Disconnected successfully');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Connection test completed successfully!');
    console.log('\n💡 You can use this same connection string in MongoDB Compass:');
    const url = getMongoUrl();
    const sanitized = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`   ${sanitized}`);
    
  } catch (error: any) {
    console.log('\n❌ Connection Failed!');
    console.log('\nError Details:');
    console.log(`   Message: ${error.message || String(error)}`);
    console.log(`   Name: ${error.name || 'Unknown'}`);
    
    if (error.message) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - MongoDB server is not running');
        console.log('   - Check if MongoDB service is started');
        console.log('   - Verify the host and port are correct');
      } else if (error.message.includes('timeout')) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - MongoDB server is not responding');
        console.log('   - Check firewall settings');
        console.log('   - Verify network connectivity');
      } else if (error.message.includes('authentication')) {
        console.log('\n💡 Troubleshooting:');
        console.log('   - Check username and password');
        console.log('   - Verify authSource parameter');
      }
    }

    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

checkConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

