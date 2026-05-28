#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product as ProductModel } from '../server/models/Product';

async function main() {
  const mongoUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error('Missing DATABASE_URL or MONGODB_URI in env');
    process.exit(1);
  }
  await mongoose.connect(mongoUrl);
  const products = await (ProductModel as any).find().lean();
  const map = new Map<string, any[]>();
  for (const p of products) {
    const key = `${(p.name||'').toLowerCase().trim()}|${(p.category||'').toLowerCase().trim()}|${p.price}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  const duplicates = [...map.values()].filter(g => g.length > 1);
  const missingImage = products.filter((p: any) => !p.image || p.image === '' || p.image === '/placeholder.svg');
  console.log('products total:', products.length);
  console.log('duplicate groups:', duplicates.length);
  console.log('total duplicate items (excluding keep):', duplicates.reduce((s, g) => s + (g.length - 1), 0));
  console.log('missing image count:', missingImage.length);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
