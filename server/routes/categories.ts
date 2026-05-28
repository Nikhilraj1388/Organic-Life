import { Router, Request, Response } from "express";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { authenticateToken, authenticateAdmin } from "./auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const CategoryModel = Category as unknown as import('mongoose').Model<any>;
const ProductModel = Product as unknown as import('mongoose').Model<any>;

// Multer storage for category images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', '.data', 'category-images');
    try { fs.mkdirSync(dest, { recursive: true }); } catch (e) {}
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname);
    cb(null, 'cat-' + unique);
  }
});
const upload = multer({ storage });

// Public: list categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find().lean();
    res.json(categories.map((c: any) => ({ id: c._id?.toString(), name: c.name, key: c.key })));
  } catch (err) {
    console.error('Failed to fetch categories', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Admin: create/upsert category by name
router.post('/admin/categories', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    const key = name.trim().toLowerCase();
    // Upsert: find by key or create
    const category = await CategoryModel.findOneAndUpdate({ key }, { name: name.trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    res.json({ category });
  } catch (err) {
    console.error('Failed to create category', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: update (rename) category
router.put('/admin/categories/:id', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    const key = name.trim().toLowerCase();
    // Update category and return new doc
    const category = await CategoryModel.findByIdAndUpdate(id, { name: name.trim(), key }, { new: true }).exec();
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ category });
  } catch (err) {
    console.error('Failed to update category', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: upload category image
router.post('/admin/categories/:id/image', authenticateToken, authenticateAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'image file is required' });
    const imagePath = `/data/category-images/${file.filename}`;
    const cat = await CategoryModel.findByIdAndUpdate(id, { $set: { image: imagePath } }, { new: true }).lean().exec();
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: cat });
  } catch (err) {
    console.error('Failed to upload category image', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Admin: delete category image
router.delete('/admin/categories/:id/image', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const cat = (await CategoryModel.findById(id).lean().exec()) as any;
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    if (cat.image) {
      try {
        const imgPath = path.join(__dirname, '..', cat.image.replace(/^\//, ''));
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        console.warn('Failed to remove category image file', err);
      }
    }
    await CategoryModel.findByIdAndUpdate(id, { $unset: { image: "" } }).exec();
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete category image', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Admin: reorder categories
router.post('/admin/categories/reorder', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    // update each category with its index
    const ops = ids.map((id, idx) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: idx } } } }));
    if (ops.length > 0) await CategoryModel.bulkWrite(ops);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to reorder categories', err);
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

// Admin: delete category (only if no products reference it)
router.delete('/admin/categories/:id', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
  const category = (await CategoryModel.findById(id).lean().exec()) as any;
    if (!category) return res.status(404).json({ error: 'Category not found' });
    // If any product references this category name, prevent deletion
    const used = await ProductModel.exists({ category: category.name });
    if (used) {
      return res.status(400).json({ error: 'Category is in use by products and cannot be deleted' });
    }
    await CategoryModel.findByIdAndDelete(id).exec();
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete category', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
