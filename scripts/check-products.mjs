import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.join(root, 'server', 'db.ts');
let getMongoUrl;
try {
  // read .env directly
  const envPath = path.join(root, '.env');
  const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const m = env.match(/^\s*(?:DATABASE_URL|MONGODB_URI|MONGODB_URL|MONGO_URL)\s*=\s*(.+)\s*$/m);
  if (m) {
    getMongoUrl = () => m[1].trim();
  } else {
    // fallback to process.env
    getMongoUrl = () => process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL;
  }
} catch (e) {
  console.error('Failed to read .env', e);
  process.exit(1);
}

(async () => {
  const url = getMongoUrl();
  console.log('Using MongoDB URI:', url);
  if (!url) {
    console.error('No MongoDB URL found');
    process.exit(1);
  }
  await mongoose.connect(url, { dbName: undefined });
  const c = await mongoose.connection.db.collection('products').countDocuments();
  console.log('products count ->', c);
  await mongoose.disconnect();
})();
