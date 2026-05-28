import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { authenticateToken, authenticateAdmin } from "./auth";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Promotion } from "../models/Promotion";
import { Category } from "../models/Category";
import { User } from "../models/User";

// Helper typed model wrappers to satisfy TypeScript callable signatures
const ProductModel = Product as unknown as import('mongoose').Model<any>;
const OrderModel = Order as unknown as import('mongoose').Model<any>;
const PromotionModel = Promotion as unknown as import('mongoose').Model<any>;
const UserModel = User as unknown as import('mongoose').Model<any>;

const router = Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../.data/images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware chain for admin routes
const adminAuth = [authenticateToken, authenticateAdmin];

// Get all products (admin) - supports filtering by published status via ?published=all|published|unpublished
router.get("/products", adminAuth, async (req, res) => {
  try {
    const publishedFilter = (req.query.published as string) || "all";
    let query: any = {};
    if (publishedFilter === "published") {
      query = { published: { $ne: false } };
    } else if (publishedFilter === "unpublished") {
      query = { published: false };
    }

  const products = await ProductModel.find(query).lean();
  const CategoryModel = Category as unknown as import('mongoose').Model<any>;
  const mapped = await Promise.all(products.map(async (p: any) => {
    const id = p._id?.toString() ?? p.id;
    let categoryKey: string | undefined;
    if (p.category) {
      try {
        const key = String(p.category).trim().toLowerCase();
  const cat = (await CategoryModel.findOne({ key }).lean().exec()) as any;
  categoryKey = (cat && cat.key) || key;
      } catch (err) {
        categoryKey = String(p.category).trim().toLowerCase();
      }
    }
    return { ...p, id, published: p.published ?? true, categoryKey };
  }));
    res.json(mapped);
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Add new product
router.post("/products", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, inStock, description, published } = req.body;
    // If a category string is provided, ensure it exists in Category collection (normalize key)
    if (category && typeof category === 'string') {
      try {
        const key = category.trim().toLowerCase();
        const CategoryModel = Category as unknown as import('mongoose').Model<any>;
        await CategoryModel.findOneAndUpdate({ key }, { name: category.trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
      } catch (err) {
        console.warn('Failed to upsert category for product create', err);
      }
    }
    const image = req.file ? `/data/images/${req.file.filename}` : undefined;
    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      inStock: inStock === "true",
      description,
      image,
      published: published === undefined ? true : published === "true",
    });
    await product.save();
    res.json({ product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Update product by id
router.put("/products/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, category, inStock, description, published } = req.body;
    // Build updateData only from fields provided to avoid setting undefined/NaN values
    const updateData: any = {};
    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof price !== 'undefined' && price !== '') {
      const p = parseFloat(price as any);
      if (!Number.isNaN(p)) updateData.price = p;
    }
    if (typeof category !== 'undefined') updateData.category = category;
    if (typeof inStock !== 'undefined') updateData.inStock = inStock === "true";
    if (typeof description !== 'undefined') updateData.description = description;
    if (typeof published !== 'undefined') updateData.published = published === "true";

    // Build update document allowing $set and $unset depending on inputs
    const updateOps: any = {};
    if (Object.keys(updateData).length > 0) updateOps.$set = updateData;

    if (req.file) {
      updateOps.$set = updateOps.$set || {};
      updateOps.$set.image = `/data/images/${req.file.filename}`;
    }

    // If client requested to remove image, unset the image field
    if (req.body && req.body.removeImage === 'true') {
      updateOps.$unset = updateOps.$unset || {};
      updateOps.$unset.image = "";
    }

    // If no update operations were provided (no fields, no image, no removeImage), return a 400
    if (!updateOps || Object.keys(updateOps).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    // Debug: log update operations
    console.debug('admin: updateOps=', JSON.stringify(updateOps));

    // If replacing/removing image, attempt to delete the old file
  const existing = await ProductModel.findById(productId).lean() as any;
    if (existing && existing.image) {
      const shouldRemoveOld = req.file || (req.body && req.body.removeImage === 'true');
      if (shouldRemoveOld) {
        try {
          const oldPath = path.join(__dirname, '..', existing.image.replace(/^\//, ''));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Failed to remove old image file', err);
        }
      }
    }

    const product = await ProductModel.findByIdAndUpdate(productId, updateOps, { new: true }).exec();
    // If category changed, ensure category exists
    if (updateData.category && typeof updateData.category === 'string') {
      try {
        const key = updateData.category.trim().toLowerCase();
        const CategoryModel = Category as unknown as import('mongoose').Model<any>;
        await CategoryModel.findOneAndUpdate({ key }, { name: updateData.category.trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
      } catch (err) {
        console.warn('Failed to upsert category for product update', err);
      }
    }
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Approve or change status of a product
router.put("/products/:id/approve", adminAuth, async (req, res) => {
  try {
    const { status } = req.body as { status?: string };
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const product = await ProductModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.error("Failed to update product status", error);
    res.status(500).json({ error: "Failed to update product status" });
  }
});

// Delete product by id
router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;
  const product = await ProductModel.findByIdAndDelete(productId).exec();
    if (!product) return res.status(404).json({ error: "Product not found" });
    // remove associated image file if any
    if (product.image) {
      try {
        const oldPath = path.join(__dirname, '..', product.image.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn('Failed to remove image file for deleted product', err);
      }
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Bulk update products (e.g., publish/unpublish)
router.put("/products/bulk", adminAuth, async (req, res) => {
  try {
    const { ids, published } = req.body as { ids?: string[]; published?: boolean };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const update: any = {};
    if (published !== undefined) update.published = published;

    const result = await ProductModel.updateMany({ _id: { $in: ids } }, { $set: update }).exec();
    // result.modifiedCount for modern mongodb driver, fallback to nModified
    const modified = (result as any).modifiedCount ?? (result as any).nModified ?? 0;
    res.json({ ok: true, modified });
  } catch (error) {
    console.error('Error bulk updating products:', error);
    res.status(500).json({ error: 'Failed to bulk update products' });
  }
});

// User management
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = "1", limit = "20", role, status, search } = req.query as any;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const total = await UserModel.countDocuments(query).exec();
    const users = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({ users, total, page: pageNum, limit: pageSize });
  } catch (error) {
    console.error("Failed to fetch users", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Failed to fetch user", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/users", adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer', status = 'active', farmName, farmLocation } = req.body;
    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] }).exec();
    if (existing) {
      return res.status(400).json({ error: "User with that email or phone already exists" });
    }
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    const user = new UserModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status,
      farmName,
      farmLocation,
      profileComplete: true,
    });
    await user.save();
    res.json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password, role, status, farmName, farmLocation } = req.body;
    const update: any = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;
    if (role) update.role = role;
    if (status) update.status = status;
    if (typeof farmName !== 'undefined') update.farmName = farmName;
    if (typeof farmLocation !== 'undefined') update.farmLocation = farmLocation;
    if (password) update.password = await bcrypt.hash(password, 12);

    const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Failed to update user", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id).exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Failed to delete user", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.put("/users/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ error: "Status is required" });
    const user = await UserModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Failed to update user status", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Inventory management
router.get("/inventory", adminAuth, async (req, res) => {
  try {
    const lowStockThreshold = parseInt((req.query.lowStock as string) || "10", 10);
    const products = (await ProductModel.find().lean()) as any[];
    const results = products.map((p: any) => ({
      productId: p._id,
      name: p.name,
      quantity: p.quantity ?? 0,
      inStock: p.inStock,
      lowStock: (p.quantity ?? 0) <= lowStockThreshold,
    }));
    res.json(results);
  } catch (error) {
    console.error("Failed to fetch inventory", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

router.get("/inventory/:productId", adminAuth, async (req, res) => {
  try {
    const product = (await ProductModel.findById(req.params.productId).lean()) as any;
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({
      productId: product._id,
      name: product.name,
      quantity: product.quantity ?? 0,
      inStock: product.inStock,
    });
  } catch (error) {
    console.error("Failed to fetch inventory item", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});

router.put("/inventory/:productId", adminAuth, async (req, res) => {
  try {
    const { quantity, inStock } = req.body as { quantity?: number; inStock?: boolean };
    const update: any = {};
    if (typeof quantity !== "undefined") update.quantity = quantity;
    if (typeof inStock !== "undefined") update.inStock = inStock;
    const product = await ProductModel.findByIdAndUpdate(req.params.productId, update, { new: true }).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (error) {
    console.error("Failed to update inventory", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// Reports
router.get("/reports/sales", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query as any;
    const match: any = {};
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) match.createdAt = { ...(match.createdAt || {}), $lte: new Date(endDate) };

    const sales = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ sales });
  } catch (error) {
    console.error("Failed to generate sales report", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
});

router.get("/reports/orders", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query as any;
    const filter: any = {};
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...(filter.createdAt || {}), $lte: new Date(endDate) };
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (error) {
    console.error("Failed to generate order report", error);
    res.status(500).json({ error: "Failed to generate order report" });
  }
});

router.get("/reports/products", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query as any;
    const match: any = {};
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) match.createdAt = { ...(match.createdAt || {}), $lte: new Date(endDate) };

    const products = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 50 },
    ]);

    res.json({ products });
  } catch (error) {
    console.error("Failed to generate product report", error);
    res.status(500).json({ error: "Failed to generate product report" });
  }
});

router.get("/reports/users", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query as any;
    const match: any = {};
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) match.createdAt = { ...(match.createdAt || {}), $lte: new Date(endDate) };

    const users = await UserModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ users });
  } catch (error) {
    console.error("Failed to generate user report", error);
    res.status(500).json({ error: "Failed to generate user report" });
  }
});

// Combined analytics
router.get("/analytics", adminAuth, async (req, res) => {
  try {
    const { type = "sales", year, month } = req.query as { type?: string; year?: string; month?: string };
    let match = {};
    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${parseInt(year) + 1}-01-01`);
      match = { createdAt: { $gte: start, $lt: end } };
    }
    if (month && year) {
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(`${year}-${parseInt(month) + 1}-01`);
      match = { createdAt: { $gte: start, $lt: end } };
    }

    let data;
    if (type === "sales") {
      data = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalEarnings: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: "$_id",
            earnings: "$totalEarnings",
          },
        },
      ]);
    } else if (type === "popular") {
      data = await Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalOrdered: { $sum: "$items.qty" },
            name: { $first: "$items.name" },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: 1,
            orders: "$totalOrdered",
          },
        },
      ]);
    } else if (type === "users") {
      data = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $month: "$createdAt" },
            customers: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            month: "$_id",
            customers: { $size: "$customers" },
          },
        },
        { $sort: { month: 1 } },
      ]);
    }

    const totalEarnings = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      data,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get all orders
router.get("/orders", adminAuth, async (req, res) => {
  try {
  const orders = await OrderModel.find().populate("userId", "name email").lean();
    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status
router.put("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
  const order = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (error) {
    console.error("Failed to update order status", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get all promotions
router.get("/promotions", adminAuth, async (req, res) => {
  try {
  const promotions = await PromotionModel.find().lean();
  res.json(promotions.map((p: any) => ({ ...p, id: p._id?.toString() ?? p.id })));
  } catch (error) {
    console.error("Failed to fetch promotions", error);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

// Add new promotion
router.post("/promotions", adminAuth, async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.json({ promotion });
  } catch (error) {
    console.error("Error adding promotion:", error);
    res.status(500).json({ error: "Failed to add promotion" });
  }
});

export default router;