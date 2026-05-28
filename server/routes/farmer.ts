import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { authenticateToken } from "./auth";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Promotion } from "../models/Promotion";
import { Category } from "../models/Category";

const ProductModel = Product as unknown as import('mongoose').Model<any>;
const OrderModel = Order as unknown as import('mongoose').Model<any>;
const PromotionModel = Promotion as unknown as import('mongoose').Model<any>;
const CategoryModel = Category as unknown as import('mongoose').Model<any>;

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

// Middleware to check if user is a farmer
const authenticateFarmer = (req: any, res: Response, next: any) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: "Access denied. Farmers only." });
  }
  next();
};

const farmerAuth = [authenticateToken, authenticateFarmer];

// Dashboard stats
router.get("/dashboard", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    
    const totalProducts = await ProductModel.countDocuments({ farmerId });
    const activeProducts = await ProductModel.countDocuments({ farmerId, inStock: true, published: true });
    const pendingProducts = await ProductModel.countDocuments({ farmerId, status: 'pending' });
    
    const orders = await OrderModel.find({ 'items.farmerId': farmerId }).lean();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      const farmerItems = order.items.filter((item: any) => item.farmerId === farmerId);
      return sum + farmerItems.reduce((itemSum: number, item: any) => itemSum + (item.price * item.qty), 0);
    }, 0);
    
    const lowStockProducts = await ProductModel.countDocuments({ 
      farmerId, 
      quantity: { $lte: 10 }, 
      inStock: true 
    });

    res.json({
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Farmer: list categories (so farmers can select categories when adding products)
router.get('/categories', farmerAuth, async (_req: any, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ order: 1 }).lean();
    res.json(categories.map((c: any) => ({ id: c._id?.toString(), name: c.name, key: c.key, image: c.image, order: c.order })));
  } catch (err) {
    console.error('Failed to fetch categories for farmer', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Farmer: create or upsert a category (allows farmers to add categories)
router.post('/categories', farmerAuth, async (req: any, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    const key = name.trim().toLowerCase();
    const category = await CategoryModel.findOneAndUpdate({ key }, { name: name.trim(), key }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean().exec();
    res.json({ category });
  } catch (err) {
    console.error('Failed to create category for farmer', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get all farmer's products
router.get("/products", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { status, inStock, search } = req.query;
    
    const query: any = { farmerId };
    if (status) query.status = status;
    if (inStock !== undefined) query.inStock = inStock === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await ProductModel.find(query).sort({ createdAt: -1 }).lean();
    const mapped = products.map((p: any) => ({
      ...p,
      id: p._id?.toString() ?? p.id,
      published: p.published ?? true
    }));
    
    res.json(mapped);
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/products/:id", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const product = await ProductModel.findOne({ _id: req.params.id, farmerId }).lean();
    
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    res.json({ ...product, id: product._id?.toString() ?? product.id });
  } catch (error) {
    console.error("Failed to fetch product", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Add new product
router.post("/products", farmerAuth, upload.single("image"), async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { name, price, category, inStock, description, quantity, unit } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    // Ensure category exists
    if (category) {
      const key = category.trim().toLowerCase();
      await CategoryModel.findOneAndUpdate(
        { key }, 
        { name: category.trim(), key }, 
        { upsert: true, new: true }
      );
    }

    const image = req.file ? `/data/images/${req.file.filename}` : undefined;
    
    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      farmerId,
      inStock: inStock === "true" || inStock === true,
      description,
      quantity: quantity ? parseInt(quantity) : 0,
      unit: unit || 'kg',
      image,
      status: 'pending', // Requires admin approval
      published: false
    });
    
    await product.save();
    res.json({ product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Update product
router.put("/products/:id", farmerAuth, upload.single("image"), async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const productId = req.params.id;
    
    const existing = await ProductModel.findOne({ _id: productId, farmerId }).lean();
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const { name, price, category, inStock, description, quantity, unit } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined && price !== '') updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (inStock !== undefined) updateData.inStock = inStock === "true" || inStock === true;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (quantityOptions !== undefined) updateData.quantityOptions = JSON.parse(quantityOptions);

    const updateOps: any = {};
    if (Object.keys(updateData).length > 0) updateOps.$set = updateData;

    if (req.file) {
      updateOps.$set = updateOps.$set || {};
      updateOps.$set.image = `/data/images/${req.file.filename}`;
      
      // Remove old image
      if (existing.image) {
        try {
          const oldPath = path.join(__dirname, '..', existing.image.replace(/^\//, ''));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Failed to remove old image', err);
        }
      }
    }

    if (req.body.removeImage === 'true') {
      updateOps.$unset = { image: "" };
      if (existing.image) {
        try {
          const oldPath = path.join(__dirname, '..', existing.image.replace(/^\//, ''));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Failed to remove image', err);
        }
      }
    }

    // Update category if changed
    if (category) {
      const key = category.trim().toLowerCase();
      await CategoryModel.findOneAndUpdate(
        { key }, 
        { name: category.trim(), key }, 
        { upsert: true, new: true }
      );
    }

    const product = await ProductModel.findByIdAndUpdate(productId, updateOps, { new: true }).exec();
    res.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/products/:id", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const product = await ProductModel.findOneAndDelete({ _id: req.params.id, farmerId }).exec();
    
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    // Remove image file
    if (product.image) {
      try {
        const oldPath = path.join(__dirname, '..', product.image.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn('Failed to remove image file', err);
      }
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Toggle product availability
router.put("/products/:id/toggle-stock", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const product = await ProductModel.findOne({ _id: req.params.id, farmerId });
    
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    product.inStock = !product.inStock;
    await product.save();
    
    res.json({ product });
  } catch (error) {
    console.error("Error toggling stock:", error);
    res.status(500).json({ error: "Failed to toggle stock" });
  }
});

// Update inventory/stock
router.put("/products/:id/inventory", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { quantity, inStock } = req.body;
    
    const update: any = {};
    if (quantity !== undefined) update.quantity = parseInt(quantity);
    if (inStock !== undefined) update.inStock = inStock;
    
    const product = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, farmerId },
      update,
      { new: true }
    );
    
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    res.json({ product });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// Get farmer's orders
router.get("/orders", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { status, startDate, endDate } = req.query;
    
    console.log('Farmer orders request - farmerId:', farmerId);
    
    const query: any = { 'items.farmerId': farmerId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    console.log('Query:', JSON.stringify(query));
    
    const orders = await OrderModel.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${orders.length} orders for farmer ${farmerId}`);
    
    // Filter items to only show farmer's products
    const filteredOrders = orders.map((order: any) => ({
      ...order,
      items: order.items.filter((item: any) => item.farmerId === farmerId),
      id: order._id?.toString() ?? order.id
    }));
    
    res.json(filteredOrders);
  } catch (error) {
    console.error("Failed to fetch orders", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order
router.get("/orders/:id", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const order = await OrderModel.findById(req.params.id)
      .populate('userId', 'name email phone')
      .lean();
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Check if order contains farmer's products
    const hasFarmerProducts = order.items.some((item: any) => item.farmerId === farmerId);
    if (!hasFarmerProducts) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json({
      ...order,
      items: order.items.filter((item: any) => item.farmerId === farmerId),
      id: order._id?.toString() ?? order.id
    });
  } catch (error) {
    console.error("Failed to fetch order", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get farmer's promotions/offers
router.get("/promotions", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    
    // Get all products for this farmer
    const products = await ProductModel.find({ farmerId }).select('_id').lean();
    const productIds = products.map((p: any) => p._id.toString());
    
    const promotions = await PromotionModel.find({
      $or: [
        { productId: { $in: productIds } },
        { farmerId }
      ]
    }).lean();
    
    res.json(promotions.map((p: any) => ({ ...p, id: p._id?.toString() ?? p.id })));
  } catch (error) {
    console.error("Failed to fetch promotions", error);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

// Create promotion/offer
router.post("/promotions", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { code, discountPercent, productId, startDate, endDate, description } = req.body;
    
    if (!code || !discountPercent || !startDate || !endDate) {
      return res.status(400).json({ error: "Code, discount, start date, and end date are required" });
    }
    
    // Verify product belongs to farmer if productId is provided
    if (productId) {
      const product = await ProductModel.findOne({ _id: productId, farmerId });
      if (!product) {
        return res.status(403).json({ error: "Product not found or access denied" });
      }
    }
    
    const promotion = new Promotion({
      code,
      discountPercent: parseFloat(discountPercent),
      productId,
      farmerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      status: 'active'
    });
    
    await promotion.save();
    res.json({ promotion });
  } catch (error: any) {
    console.error("Error creating promotion:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Promotion code already exists" });
    }
    res.status(500).json({ error: "Failed to create promotion" });
  }
});

// Update promotion
router.put("/promotions/:id", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { discountPercent, startDate, endDate, description, status } = req.body;
    
    const update: any = {};
    if (discountPercent !== undefined) update.discountPercent = parseFloat(discountPercent);
    if (startDate !== undefined) update.startDate = new Date(startDate);
    if (endDate !== undefined) update.endDate = new Date(endDate);
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    
    const promotion = await PromotionModel.findOneAndUpdate(
      { _id: req.params.id, farmerId },
      update,
      { new: true }
    );
    
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });
    
    res.json({ promotion });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ error: "Failed to update promotion" });
  }
});

// Delete promotion
router.delete("/promotions/:id", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const promotion = await PromotionModel.findOneAndDelete({ _id: req.params.id, farmerId });
    
    if (!promotion) return res.status(404).json({ error: "Promotion not found" });
    
    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({ error: "Failed to delete promotion" });
  }
});

// Sales analytics
router.get("/analytics/sales", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    const { period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));
    
    const orders = await OrderModel.find({
      'items.farmerId': farmerId,
      createdAt: { $gte: daysAgo }
    }).lean();
    
    const salesByDate: any = {};
    orders.forEach((order: any) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const farmerItems = order.items.filter((item: any) => item.farmerId === farmerId);
      const revenue = farmerItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
      
      if (!salesByDate[date]) {
        salesByDate[date] = { date, revenue: 0, orders: 0 };
      }
      salesByDate[date].revenue += revenue;
      salesByDate[date].orders += 1;
    });
    
    const salesData = Object.values(salesByDate).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );
    
    res.json(salesData);
  } catch (error) {
    console.error("Failed to fetch sales analytics", error);
    res.status(500).json({ error: "Failed to fetch sales analytics" });
  }
});

// Product performance
router.get("/analytics/products", farmerAuth, async (req: any, res: Response) => {
  try {
    const farmerId = req.user._id?.toString() || req.user.id;
    
    const orders = await OrderModel.find({ 'items.farmerId': farmerId }).lean();
    
    const productStats: any = {};
    orders.forEach((order: any) => {
      order.items
        .filter((item: any) => item.farmerId === farmerId)
        .forEach((item: any) => {
          const productId = item.productId;
          if (!productStats[productId]) {
            productStats[productId] = {
              productId,
              name: item.name,
              totalSold: 0,
              revenue: 0,
              orders: 0
            };
          }
          productStats[productId].totalSold += item.qty;
          productStats[productId].revenue += item.price * item.qty;
          productStats[productId].orders += 1;
        });
    });
    
    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
    
    res.json(topProducts);
  } catch (error) {
    console.error("Failed to fetch product analytics", error);
    res.status(500).json({ error: "Failed to fetch product analytics" });
  }
});

// Get categories
router.get("/categories", farmerAuth, async (req, res) => {
  try {
    const categories = await CategoryModel.find().lean();
    res.json(categories.map((c: any) => ({ ...c, id: c._id?.toString() ?? c.id })));
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
