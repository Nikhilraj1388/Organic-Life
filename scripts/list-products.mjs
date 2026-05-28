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
  await mongoose.connect(url);
  const docs = await mongoose.connection.db.collection('products').find({}).sort({ createdAt: -1 }).limit(50).toArray();
  console.log('found', docs.length, 'products. Sample:');
  docs.forEach(d => {
    console.log({ id: d._id?.toString(), name: d.name, inStock: d.inStock, image: d.image, createdAt: d.createdAt });
  });
  await mongoose.disconnect();
})();
