#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product as ProductModel } from '../server/models/Product';
import readline from 'readline';

async function main() {
  const mongoUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error('Missing DATABASE_URL or MONGODB_URI in env');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');

  const products = await (ProductModel as any).find().lean();

  // Find duplicates by canonical key
  const map = new Map<string, any[]>();
  for (const p of products) {
    const key = `${(p.name||'').toLowerCase().trim()}|${(p.category||'').toLowerCase().trim()}|${p.price}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }

  const duplicates: { keep: any; remove: any[] }[] = [];
  for (const [key, group] of map.entries()) {
    if (group.length > 1) {
      // keep earliest createdAt
      group.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      duplicates.push({ keep: group[0], remove: group.slice(1) });
    }
  }

  const missingImage = products.filter((p: any) => !p.image || p.image === '' || p.image === '/placeholder.svg');

  console.log('Duplicate groups found:', duplicates.length);
  console.log('Products missing images:', missingImage.length);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

  if (duplicates.length === 0 && missingImage.length === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  console.log('\nSample duplicate groups (first 5):');
  duplicates.slice(0, 5).forEach((g, i) => {
    console.log(`\nGroup ${i + 1}: keep id=${g.keep._id}, name=${g.keep.name}`);
    g.remove.forEach((r) => console.log(`  remove id=${r._id}, createdAt=${r.createdAt}`));
  });

  console.log('\nSample products missing image (first 5):');
  missingImage.slice(0, 5).forEach((p: any) => console.log(`  id=${p._id} name=${p.name}`));

  const proceed = (await ask('\nProceed to delete the listed duplicates and products missing images? (yes/no): ')).toLowerCase();
  rl.close();

  if (proceed !== 'yes') {
    console.log('Aborted by user. No changes made.');
    process.exit(0);
  }

  // Delete duplicates
  let deleted = 0;
  for (const g of duplicates) {
    const ids = g.remove.map((r) => r._id);
    const res = await (ProductModel as any).deleteMany({ _id: { $in: ids } });
    deleted += res.deletedCount || 0;
  }

  // Delete missing image products
  const missingIds = missingImage.map((p: any) => p._id);
  if (missingIds.length > 0) {
    const res = await (ProductModel as any).deleteMany({ _id: { $in: missingIds } });
    deleted += res.deletedCount || 0;
  }

  console.log(`Deleted ${deleted} product(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running cleanup:', err);
  process.exit(1);
});
