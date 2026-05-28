#!/usr/bin/env tsx
import "dotenv/config";
import connectDb from "../server/db";
import { Product } from "../server/models/Product";
import { Category } from "../server/models/Category";

async function run() {
  await connectDb();
  const ProductModel = Product as unknown as import('mongoose').Model<any>;
  const CategoryModel = Category as unknown as import('mongoose').Model<any>;

  // Ensure categories exist for all unique product.category values
  const products = await ProductModel.find().lean().exec();
  const names = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
  console.log(`Found ${names.length} unique category names in products`);

  for (const name of names) {
    const key = String(name).trim().toLowerCase();
    await CategoryModel.findOneAndUpdate({ key }, { name: String(name).trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
  }

  // Build a lookup from key -> canonical name
  const cats = await CategoryModel.find().lean().exec();
  const map = new Map<string, string>();
  for (const c of cats as any[]) {
    map.set(String(c.key).trim().toLowerCase(), c.name);
  }

  // Reconcile products
  let updated = 0;
  for (const p of products) {
    if (!p.category) continue;
    const key = String(p.category).trim().toLowerCase();
    const canonical = map.get(key);
    if (canonical && canonical !== p.category) {
      await ProductModel.updateOne({ _id: p._id }, { $set: { category: canonical } }).exec();
      updated++;
      console.log(`Updated product ${p._id} category -> ${canonical}`);
    }
  }

  console.log(`Reconciliation complete. ${updated} products updated.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Reconcile failed', err);
  process.exit(1);
});
