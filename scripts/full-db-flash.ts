import 'dotenv/config';
import connectDb, { getMongoUrl } from '../server/db';
import mongoose from 'mongoose';

async function fullFlash() {
  console.log('\n🔦 FULL DATABASE FLASH — Organic Life\n');
  console.log('═'.repeat(70));

  // ── 1. Connection ──────────────────────────────────────────────────
  console.log('\n📡  Step 1 · Connecting to MongoDB...');
  const url = getMongoUrl();
  const sanitized = url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`   URL : ${sanitized}`);

  let conn: typeof mongoose;
  try {
    conn = await connectDb();
  } catch (err: any) {
    console.error(`\n❌  Connection FAILED: ${err.message}`);
    process.exit(1);
  }

  const readyState = conn.connection.readyState;
  if (readyState !== 1) {
    console.error(`❌  Unexpected readyState: ${readyState}`);
    process.exit(1);
  }
  console.log('   ✅  Connected & ready');

  const db = conn.connection.db!;
  console.log(`   📂  Database: ${db.databaseName}`);

  // ── 2. List all collections ────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('📦  Step 2 · Collections overview');
  const collections = await db.listCollections().toArray();
  console.log(`   Total collections: ${collections.length}\n`);

  if (collections.length === 0) {
    console.log('   ⚠️  Database is empty — no collections found.');
    await conn.disconnect();
    process.exit(0);
  }

  // Table header
  console.log('   ' + 'Collection'.padEnd(25) + 'Documents'.padEnd(12) + 'Size (approx)');
  console.log('   ' + '─'.repeat(50));

  const collectionStats: { name: string; count: number }[] = [];

  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const coll = db.collection(col.name);
    const count = await coll.countDocuments();
    // Try to get a rough size via stats
    let sizeStr = '—';
    try {
      const stats = await coll.aggregate([
        { $collStats: { storageStats: {} } },
      ]).toArray();
      if (stats.length > 0 && stats[0].storageStats) {
        const bytes = stats[0].storageStats.size ?? 0;
        sizeStr = formatBytes(bytes);
      }
    } catch {
      // some collection types don't support $collStats
    }
    console.log(`   ${col.name.padEnd(25)}${String(count).padEnd(12)}${sizeStr}`);
    collectionStats.push({ name: col.name, count });
  }

  const totalDocs = collectionStats.reduce((s, c) => s + c.count, 0);
  console.log('   ' + '─'.repeat(50));
  console.log(`   ${'TOTAL'.padEnd(25)}${totalDocs}`);

  // ── 3. Dump every document from every collection ───────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('📋  Step 3 · Full data dump (all documents)\n');

  for (const { name, count } of collectionStats) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📁  ${name}  (${count} document${count !== 1 ? 's' : ''})`);
    console.log('─'.repeat(70));

    if (count === 0) {
      console.log('   (empty)\n');
      continue;
    }

    const coll = db.collection(name);
    const docs = await coll.find({}).toArray();

    docs.forEach((doc, i) => {
      console.log(`\n  ┌─ #${i + 1} ──────────────────────────`);
      const pretty = JSON.stringify(doc, null, 4);
      // indent each line
      pretty.split('\n').forEach((line) => {
        console.log(`  │ ${line}`);
      });
      console.log('  └──────────────────────────────────');
    });
  }

  // ── 4. Summary ────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('✅  Flash complete');
  console.log(`   Collections : ${collections.length}`);
  console.log(`   Documents   : ${totalDocs}`);
  console.log('═'.repeat(70) + '\n');

  await conn.disconnect();
  console.log('🔌  Disconnected.\n');
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

fullFlash().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
