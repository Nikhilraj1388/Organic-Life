#!/usr/bin/env tsx
import "dotenv/config";
import connectDb from "../server/db";
import { Product } from "../server/models/Product";
import { Category } from "../server/models/Category";

async function run() {
  await connectDb();
  const products = await Product.find().lean().exec();
  const CategoryModel = Category as unknown as import('mongoose').Model<any>;
  const names = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
  console.log(`Found ${names.length} unique category names in products`);
  for (const name of names) {
    const key = String(name).trim().toLowerCase();
    await CategoryModel.findOneAndUpdate({ key }, { name: String(name).trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    console.log(`Upserted category: ${name}`);
  }
  console.log('Migration complete');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
