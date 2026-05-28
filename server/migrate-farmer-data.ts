import mongoose from 'mongoose';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { User } from './models/User';

const ProductModel = Product as unknown as mongoose.Model<any>;
const OrderModel = Order as unknown as mongoose.Model<any>;
const UserModel = User as unknown as mongoose.Model<any>;

/**
 * Migration Script: Add farmerId to existing products and orders
 * 
 * This script:
 * 1. Finds all farmer users
 * 2. Assigns products without farmerId to farmers
 * 3. Updates existing orders to include farmerId in items
 */

async function migrateData() {
  try {
    console.log('Starting migration...');

    // Connect to MongoDB
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/organic-life';
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    // Step 1: Find all farmers
    const farmers = await UserModel.find({ role: 'farmer' }).lean();
    console.log(`Found ${farmers.length} farmers`);

    if (farmers.length === 0) {
      console.log('No farmers found. Please create a farmer account first.');
      return;
    }

    // Step 2: Find products without farmerId
    const productsWithoutFarmer = await ProductModel.find({
      $or: [
        { farmerId: { $exists: false } },
        { farmerId: null }
      ]
    });

    console.log(`Found ${productsWithoutFarmer.length} products without farmerId`);

    if (productsWithoutFarmer.length > 0) {
      // Distribute products among farmers (or assign all to first farmer)
      const firstFarmer = farmers[0];
      const farmerId = firstFarmer._id.toString();

      console.log(`Assigning products to farmer: ${firstFarmer.name} (${farmerId})`);

      for (const product of productsWithoutFarmer) {
        product.farmerId = farmerId;
        await product.save();
        console.log(`  ✓ Updated product: ${product.name}`);
      }

      console.log(`✅ Updated ${productsWithoutFarmer.length} products`);
    }

    // Step 3: Update existing orders to include farmerId in items
    const orders = await OrderModel.find({});
    console.log(`Found ${orders.length} orders to check`);

    let updatedOrderCount = 0;

    for (const order of orders) {
      let orderUpdated = false;

      for (const item of order.items) {
        // If item doesn't have farmerId, fetch it from product
        if (!item.farmerId) {
          try {
            const product = await ProductModel.findById(item.productId).lean();
            if (product && product.farmerId) {
              item.farmerId = product.farmerId;
              orderUpdated = true;
              console.log(`  ✓ Added farmerId to item "${item.name}" in order ${order._id}`);
            } else {
              console.log(`  ⚠ Product ${item.productId} not found or has no farmerId`);
            }
          } catch (err) {
            console.error(`  ✗ Error fetching product ${item.productId}:`, err);
          }
        }
      }

      if (orderUpdated) {
        await order.save();
        updatedOrderCount++;
      }
    }

    console.log(`✅ Updated ${updatedOrderCount} orders`);

    // Step 4: Verification
    console.log('\n=== VERIFICATION ===');

    const productsWithFarmer = await ProductModel.countDocuments({ farmerId: { $exists: true, $ne: null } });
    const totalProducts = await ProductModel.countDocuments({});
    console.log(`Products with farmerId: ${productsWithFarmer}/${totalProducts}`);

    const ordersWithFarmerItems = await OrderModel.countDocuments({ 'items.farmerId': { $exists: true, $ne: null } });
    const totalOrders = await OrderModel.countDocuments({});
    console.log(`Orders with farmerId in items: ${ordersWithFarmerItems}/${totalOrders}`);

    // Show sample data
    console.log('\n=== SAMPLE DATA ===');
    const sampleProduct = await ProductModel.findOne({ farmerId: { $exists: true } }).lean();
    if (sampleProduct) {
      console.log('Sample Product:', {
        id: sampleProduct._id,
        name: sampleProduct.name,
        farmerId: sampleProduct.farmerId
      });
    }

    const sampleOrder = await OrderModel.findOne({ 'items.farmerId': { $exists: true } }).lean();
    if (sampleOrder) {
      console.log('Sample Order:', {
        id: sampleOrder._id,
        itemCount: sampleOrder.items.length,
        firstItem: {
          name: sampleOrder.items[0].name,
          farmerId: sampleOrder.items[0].farmerId
        }
      });
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateData();
