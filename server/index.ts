import "dotenv/config";
import express from "express";
import cors from "cors";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Provide a safe fallback for __dirname in both CJS and ESM environments
let dirName = '';
try {
  dirName = __dirname;
} catch (e) {
  try {
    dirName = path.dirname(fileURLToPath(import.meta.url));
  } catch (err) {
    dirName = process.cwd();
  }
}

import connectDb from './db';
import { handleDemo } from "./routes/demo";
import { register, login, verifyToken, authenticateToken, forgotPassword, resetPassword, sendOTP, verifyOTP } from "./routes/auth";
import { getCart, syncCart } from './routes/cart';
import { uploadAvatar, deleteAvatar } from './routes/profile';
import { getOrders } from './routes/orders';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import adminRouter from './routes/admin';
import farmerRouter from './routes/farmer';
import categoriesRouter from './routes/categories';

export function createServer() {
  const app = express();

  // Middleware
  // Simple request logger for product endpoints to help debug marketplace/admin API calls
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api/products') || req.path.startsWith('/api/admin/products')) {
      console.log(`[API LOG] ${req.method} ${req.path} - query:`, req.query);
    }
    next();
  });
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // Auth endpoints (register, login, token verification)
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.post('/api/auth/send-otp', sendOTP);
  app.post('/api/auth/verify-otp', verifyOTP);
  // verifyToken uses authenticateToken middleware to validate the bearer token
  app.get('/api/auth/verify', authenticateToken, verifyToken);
  // Password reset endpoints
  app.post('/api/auth/forgot-password', forgotPassword);
  app.post('/api/auth/reset-password', resetPassword);
  // Cart sync endpoints
  app.get('/api/cart/:userId', getCart);
  app.post('/api/cart/sync', syncCart);

  // Profile avatar endpoints
  app.post('/api/profile/avatar', uploadAvatar);
  app.post('/api/profile/avatar/delete', deleteAvatar);

  // Orders
  app.get('/api/orders/:userId', getOrders);
  app.use('/api/orders', ordersRouter);

  // Products
  // Mount the products router so endpoints like /api/products are available
  app.use('/api', productsRouter);

  // Categories (public)
  app.use('/api', categoriesRouter);

  // Admin routes (requires auth middleware inside the router)
  app.use('/api/admin', adminRouter);

  // Farmer routes (requires auth middleware inside the router)
  app.use('/api/farmer', farmerRouter);

  // Compute __dirname safely for both ESM and CJS environments
  const avatarsDir = path.join(dirName, '.data', 'avatars');
  // Ensure data directories exist (multer won't create them)
  const imagesDir = path.join(dirName, '.data', 'images');
  const categoryImagesDir = path.join(dirName, '.data', 'category-images');
  try {
    // recursive ensures parent directories are created
    fs.mkdirSync(avatarsDir, { recursive: true });
    fs.mkdirSync(imagesDir, { recursive: true });
    fs.mkdirSync(categoryImagesDir, { recursive: true });
  } catch (err) {
    console.warn('Failed to create data directories', err);
  }

  app.use('/data/avatars', express.static(avatarsDir));
  // Serve uploaded product images from server/.data/images at /data/images
  app.use('/data/images', express.static(imagesDir));
  app.use('/data/category-images', express.static(categoryImagesDir));

  return app;
}

async function startServer() {
  const app = createServer();
  const PORT = process.env.PORT || 5001;

  try {
    await connectDb();
    console.log("🌿 MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

// Note: we DON'T call startServer() automatically here because this module is imported
// by Vite during development (see vite.config.ts). Starting the server (and connecting
// to MongoDB) should be done explicitly via `server/start.ts` or by running this file
// directly in production. This avoids requiring DATABASE_URL when Vite imports createServer.

export { startServer };
