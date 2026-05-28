import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const m = env.match(/^\s*(?:DATABASE_URL|MONGODB_URI|MONGODB_URL|MONGO_URL)\s*=\s*(.+)\s*$/m);
const url = m ? m[1].trim() : (process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL);
(async ()=>{
  if(!url){ console.error('No Mongo URL'); process.exit(1); }
  console.log('Connecting to', url);
  await mongoose.connect(url);
  const res = await mongoose.connection.db.collection('products').updateMany({ published: { $exists: false } }, { $set: { published: true } });
  console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);
  await mongoose.disconnect();
})();
