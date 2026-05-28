import mongoose from 'mongoose';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { User } from './models/User';

const ProductModel = Product as unknown as mongoose.Model<any>;
const OrderModel = Order as unknown as mongoose.Model<any>;
const UserModel = User as unknown as mongoose.Model<any>;

/**
 * Complete Verification and Fix Script
 * This will diagnose and fix all issues with the farmer order system
 */

async function verifyAndFix() {
  try {
    console.log('🔍 Starting Complete Verification...\n');

    // Connect to MongoDB
    const dbUrl = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/organic-life';
    console.log(`Connecting to: ${dbUrl}`);
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB\n');

    // ========== STEP 1: Check Farmers ==========
    console.log('========== STEP 1: FARMERS ==========');
    const farmers = await UserModel.find({ role: 'farmer' }).lean();
    console.log(`Found ${farmers.length} farmer(s)`);
    
    if (farmers.length === 0) {
      console.log('❌ NO FARMERS FOUND!');
      console.log('   Please create a farmer account first:');
      console.log('   1. Go to login page');
      console.log('   2. Select "Farmer" role');
      console.log('   3. Register with farm name and location\n');
      return;
    }

    farmers.forEach((farmer: any, index: number) => {
      console.log(`\nFarmer ${index + 1}:`);
      console.log(`  ID: ${farmer._id}`);
      console.log(`  Name: ${farmer.name}`);
      console.log(`  Email: ${farmer.email}`);
      console.log(`  Farm: ${farmer.farmName || 'N/A'}`);
      console.log(`  Location: ${farmer.farmLocation || 'N/A'}`);
    });

    const firstFarmer = farmers[0];
    const farmerId = firstFarmer._id.toString();
    console.log(`\n✅ Using Farmer ID: ${farmerId}\n`);

    // ========== STEP 2: Check Products ==========
    console.log('========== STEP 2: PRODUCTS ==========');
    const totalProducts = await ProductModel.countDocuments({});
    const productsWithFarmer = await ProductModel.countDocuments({ 
      farmerId: { $exists: true, $ne: null } 
    });
    const productsWithoutFarmer = await ProductModel.countDocuments({
      $or: [
        { farmerId: { $exists: false } },
        { farmerId: null }
      ]
    });

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products WITH farmerId: ${productsWithFarmer}`);
    console.log(`Products WITHOUT farmerId: ${productsWithoutFarmer}`);

    // Fix products without farmerId
    if (productsWithoutFarmer > 0) {
      console.log(`\n🔧 Fixing ${productsWithoutFarmer} products...`);
      const result = await ProductModel.updateMany(
        {
          $or: [
            { farmerId: { $exists: false } },
            { farmerId: null }
          ]
        },
        { $set: { farmerId: farmerId } }
      );
      console.log(`✅ Updated ${result.modifiedCount} products with farmerId: ${farmerId}`);
    }

    // Show sample products
    const sampleProducts = await ProductModel.find({ farmerId: farmerId }).limit(3).lean();
    console.log(`\nSample Products for Farmer ${farmerId}:`);
    sampleProducts.forEach((product: any, index: number) => {
      console.log(`  ${index + 1}. ${product.name}`);
      console.log(`     ID: ${product._id}`);
      console.log(`     FarmerID: ${product.farmerId}`);
      console.log(`     Price: ₹${product.price}`);
      console.log(`     In Stock: ${product.inStock}`);
    });

    // ========== STEP 3: Check Orders ==========
    console.log('\n========== STEP 3: ORDERS ==========');
    const totalOrders = await OrderModel.countDocuments({});
    console.log(`Total Orders: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('⚠️  No orders found. Place a test order to verify the system.\n');
    } else {
      // Check orders with farmerId in items
      const ordersWithFarmerItems = await OrderModel.countDocuments({
        'items.farmerId': { $exists: true, $ne: null }
      });
      console.log(`Orders with farmerId in items: ${ordersWithFarmerItems}/${totalOrders}`);

      // Fix orders without farmerId
      const ordersToFix = totalOrders - ordersWithFarmerItems;
      if (ordersToFix > 0) {
        console.log(`\n🔧 Fixing ${ordersToFix} orders...`);
        const orders = await OrderModel.find({});
        let fixedCount = 0;

        for (const order of orders) {
          let updated = false;
          for (const item of order.items) {
            if (!item.farmerId) {
              const product = await ProductModel.findById(item.productId).lean();
              if (product && product.farmerId) {
                item.farmerId = product.farmerId;
                updated = true;
              }
            }
          }
          if (updated) {
            await order.save();
            fixedCount++;
          }
        }
        console.log(`✅ Fixed ${fixedCount} orders`);
      }

      // Show orders for this farmer
      const farmerOrders = await OrderModel.find({ 'items.farmerId': farmerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      console.log(`\nOrders for Farmer ${farmerId}: ${farmerOrders.length}`);
      farmerOrders.forEach((order: any, index: number) => {
        const farmerItems = order.items.filter((item: any) => item.farmerId === farmerId);
        const total = farmerItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
        console.log(`\n  Order ${index + 1}:`);
        console.log(`    ID: ${order._id}`);
        console.log(`    Date: ${new Date(order.createdAt).toLocaleString()}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Payment: ${order.paymentMethod || 'online'}`);
        console.log(`    Items: ${farmerItems.length}`);
        console.log(`    Total: ₹${total.toFixed(2)}`);
        farmerItems.forEach((item: any) => {
          console.log(`      - ${item.name} x${item.qty} (₹${item.price})`);
        });
      });
    }

    // ========== STEP 4: Verify Queries ==========
    console.log('\n========== STEP 4: QUERY VERIFICATION ==========');
    
    // Test the exact query used by farmer dashboard
    const query = { 'items.farmerId': farmerId };
    console.log(`Testing query: ${JSON.stringify(query)}`);
    
    const queryResult = await OrderModel.find(query).lean();
    console.log(`Query returned: ${queryResult.length} orders`);

    if (queryResult.length === 0 && totalOrders > 0) {
      console.log('❌ QUERY ISSUE: Orders exist but query returns nothing');
      console.log('   Checking order structure...');
      
      const sampleOrder = await OrderModel.findOne({}).lean();
      if (sampleOrder) {
        console.log('\n   Sample Order Structure:');
        console.log(`   Order ID: ${sampleOrder._id}`);
        console.log(`   Items count: ${sampleOrder.items?.length || 0}`);
        if (sampleOrder.items && sampleOrder.items.length > 0) {
          console.log(`   First item:`, {
            name: sampleOrder.items[0].name,
            farmerId: sampleOrder.items[0].farmerId,
            hasFarmerId: !!sampleOrder.items[0].farmerId
          });
        }
      }
    }

    // ========== STEP 5: Final Summary ==========
    console.log('\n========== FINAL SUMMARY ==========');
    
    const finalProductCount = await ProductModel.countDocuments({ farmerId: farmerId });
    const finalOrderCount = await OrderModel.countDocuments({ 'items.farmerId': farmerId });
    
    console.log(`✅ Farmer: ${firstFarmer.name} (${farmerId})`);
    console.log(`✅ Products: ${finalProductCount}`);
    console.log(`✅ Orders: ${finalOrderCount}`);
    
    if (finalProductCount === 0) {
      console.log('\n⚠️  No products found for this farmer.');
      console.log('   Action: Login as farmer and add products from dashboard');
    }
    
    if (finalOrderCount === 0 && totalOrders > 0) {
      console.log('\n⚠️  Orders exist but none assigned to this farmer.');
      console.log('   This means products in orders don\'t belong to this farmer.');
    }
    
    if (finalOrderCount === 0 && totalOrders === 0) {
      console.log('\n⚠️  No orders in system yet.');
      console.log('   Action: Place a test order as customer');
    }

    console.log('\n========== NEXT STEPS ==========');
    console.log('1. Restart your server');
    console.log('2. Login as farmer');
    console.log('3. Go to Farmer Dashboard → Products');
    console.log('4. Add a new product');
    console.log('5. Logout and login as customer');
    console.log('6. Place an order for that product');
    console.log('7. Login as farmer again');
    console.log('8. Check Orders tab - order should appear!');
    
    console.log('\n✅ Verification Complete!\n');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run verification
verifyAndFix();
