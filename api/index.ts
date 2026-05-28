import { createServer } from '../server/index';
import connectDb from '../server/db';

const app = createServer();

// Connect to MongoDB on cold start
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDb();
      isConnected = true;
      console.log('✅ MongoDB connected (Vercel Serverless)');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
    }
  }
  next();
});

// Export the Express app for Vercel
export default app;
