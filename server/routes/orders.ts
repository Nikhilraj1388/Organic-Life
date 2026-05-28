import { RequestHandler, Router } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { authenticateToken } from './auth';

const OrderModel = Order as unknown as import('mongoose').Model<any>;
const ProductModel = Product as unknown as import('mongoose').Model<any>;
const router = Router();

export const getOrders: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
  const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    console.error('Failed to fetch orders', err);
    res.status(500).json({ error: 'server_error' });
  }
};

// Create Razorpay order
router.post('/create-razorpay-order', authenticateToken, async (req: any, res) => {
  try {
    const { total } = req.body;
    // Mock Razorpay order creation - replace with actual Razorpay SDK in production
    const order = {
      id: `order_${Date.now()}`,
      amount: total * 100, // Razorpay expects amount in paise
      currency: 'INR',
    };
    res.json(order);
  } catch (error) {
    console.error('Failed to create Razorpay order', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Create order
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { items, total, paymentMethod, paymentId, razorpayOrderId } = req.body;
    const userId = req.user._id?.toString() || req.user.id;

    console.log('========== ORDER CREATION START ==========');
    console.log('Creating order for user:', userId);
    console.log('User object:', { id: req.user._id, role: req.user.role, email: req.user.email });
    console.log('Order items received:', JSON.stringify(items, null, 2));
    console.log('Payment method:', paymentMethod);

    // Fetch product details to get farmerId for each item
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        try {
          console.log(`Fetching product ${item.productId}...`);
          const product = await ProductModel.findById(item.productId).lean();
          
          if (!product) {
            console.error(`Product ${item.productId} NOT FOUND in database`);
          } else {
            console.log(`Product ${item.productId} found:`, {
              name: product.name,
              farmerId: product.farmerId,
              hasFarmerId: !!product.farmerId
            });
          }
          
          return {
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            price: item.price,
            farmerId: product?.farmerId || null
          };
        } catch (err) {
          console.error(`ERROR fetching product ${item.productId}:`, err);
          return {
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            price: item.price,
            farmerId: null
          };
        }
      })
    );

    console.log('Enriched items with farmerId:', JSON.stringify(enrichedItems, null, 2));

    const newOrder = new OrderModel({
      userId,
      items: enrichedItems,
      total,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'pending',
    });

    await newOrder.save();
    console.log('Order saved successfully with ID:', newOrder._id);
    console.log('Order items in DB:', JSON.stringify(newOrder.items, null, 2));
    console.log('========== ORDER CREATION END ==========');
    
    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('========== ORDER CREATION FAILED ==========');
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Debug endpoint to check products
router.get('/debug/products', authenticateToken, async (req: any, res) => {
  try {
    const products = await ProductModel.find().limit(10).lean();
    const productsWithFarmer = products.map((p: any) => ({
      id: p._id,
      name: p.name,
      farmerId: p.farmerId,
      hasFarmerId: !!p.farmerId
    }));
    res.json({ products: productsWithFarmer });
  } catch (error) {
    console.error('Failed to fetch products', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Debug endpoint to check orders
router.get('/debug/orders', authenticateToken, async (req: any, res) => {
  try {
    const orders = await OrderModel.find().limit(10).sort({ createdAt: -1 }).lean();
    const ordersDebug = orders.map((o: any) => ({
      id: o._id,
      userId: o.userId,
      itemCount: o.items?.length || 0,
      items: o.items?.map((item: any) => ({
        name: item.name,
        farmerId: item.farmerId,
        hasFarmerId: !!item.farmerId
      }))
    }));
    res.json({ orders: ordersDebug });
  } catch (error) {
    console.error('Failed to fetch orders', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
