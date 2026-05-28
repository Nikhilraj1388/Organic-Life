import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function listAllDatabases() {
  const url = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
  if (!url) {
    console.error('❌ No MongoDB connection string found');
    process.exit(1);
  }

  const sanitized = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`\n🔍 Connecting to: ${sanitized}\n`);

  const client = new MongoClient(url);
  await client.connect();

  // List all databases
  const adminDb = client.db().admin();
  const { databases } = await adminDb.listDatabases();

  console.log('═'.repeat(60));
  console.log('📂 ALL DATABASES ON THIS CLUSTER');
  console.log('═'.repeat(60));

  for (const dbInfo of databases) {
    console.log(`\n📁 Database: ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024).toFixed(1)} KB)`);

    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('   (no collections)');
      continue;
    }

    for (const col of collections) {
      const coll = db.collection(col.name);
      const count = await coll.countDocuments();
      console.log(`   📦 ${col.name.padEnd(25)} → ${count} documents`);

      // Show a sample if there are documents
      if (count > 0 && (col.name === 'products' || col.name === 'categories')) {
        const sample = await coll.findOne();
        console.log(`      Sample: ${JSON.stringify(sample, null, 2).split('\n').slice(0, 6).join('\n      ')}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(60));
  await client.close();
  console.log('🔌 Done.\n');
}

listAllDatabases().catch((err) => {
  console.error('💥 Error:', err);
  process.exit(1);
});
