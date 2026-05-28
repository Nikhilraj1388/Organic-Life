import { Router, Request, Response } from "express";
import { Product } from "../models/Product";

const ProductModel = Product as unknown as import('mongoose').Model<any>;

const router = Router();

// Get all products
router.get("/products", async (_req: Request, res: Response) => {
  try {
    // If mongoose isn't connected (e.g. missing DATABASE_URL in dev), return empty list
    if (!Product.db || !Product.db.readyState) {
      console.warn("Mongoose not connected - returning empty products list");
      return res.json([]);
    }
  // Only return products that are published (published !== false)
  const products = await ProductModel.find({ published: { $ne: false } }).lean();
    // Map MongoDB _id to id expected by client and include published flag
    // Also attach categoryKey computed from Category collection when available
    const Category = await import('../models/Category').then(m => m.Category).catch(() => null as any);
    const mapped = await Promise.all(products.map(async (p: any) => {
      const id = p._id?.toString() ?? p.id;
      let categoryKey: string | undefined = undefined;
      try {
        if (p.category) {
          const key = String(p.category).trim().toLowerCase();
          if (Category) {
            const cat = (await (Category as any).findOne({ key }).lean().exec()) as any;
            categoryKey = (cat && cat.key) || key;
          } else {
            categoryKey = key;
          }
        }
      } catch (err) {
        categoryKey = p.category ? String(p.category).trim().toLowerCase() : undefined;
      }
      return { ...p, id, published: p.published ?? true, categoryKey };
    }));
    console.log(`[API LOG] /api/products -> returning ${mapped.length} products (origin: ${_req.headers.origin || 'unknown'})`);
    res.json(mapped);
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/products/:id", async (req: Request, res: Response) => {
  try {
  const product = await ProductModel.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
  const p: any = product;
  const mapped = { ...p, id: p._id?.toString() ?? p.id };
    res.json(mapped);
  } catch (error) {
    console.error("Failed to fetch product", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
