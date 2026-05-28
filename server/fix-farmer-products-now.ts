import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * IMMEDIATE FIX: Assign farmerId to all products
 * Run this NOW to fix the empty farmer dashboard
 */

async function immediateFixProducts() {
  try {
    console.log('🔧 IMMEDIATE FIX: Assigning farmerId to products...\n');

    // Connect to MongoDB
    const dbUrl = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/organic-life';
    console.log(`Connecting to: ${dbUrl}`);
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB\n');

    // Get User model
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Get Product model
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

    // Step 1: Find all farmers
    console.log('Step 1: Finding farmers...');
    const farmers = await User.find({ role: 'farmer' }).lean();
    console.log(`Found ${farmers.length} farmer(s)\n`);

    if (farmers.length === 0) {
      console.log('❌ NO FARMERS FOUND!');
      console.log('\n🔧 CREATING A DEFAULT FARMER ACCOUNT...\n');
      
      // Create a default farmer
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('farmer123', 12);
      
      const defaultFarmer = new User({
        authId: 'email-farmer@organic.com',
        email: 'farmer@organic.com',
        name: 'Default Farmer',
        password: hashedPassword,
        role: 'farmer',
        farmName: 'Organic Farm',
        farmLocation: 'Delhi',
        profileComplete: true
      });
      
      await defaultFarmer.save();
      console.log('✅ Created default farmer account:');
      console.log('   Email: farmer@organic.com');
      console.log('   Password: farmer123');
      console.log('   Farm: Organic Farm\n');
      
      farmers.push(defaultFarmer);
    }

    // Use first farmer
    const farmer = farmers[0];
    const farmerId = farmer._id.toString();
    
    console.log('Using Farmer:');
    console.log(`  ID: ${farmerId}`);
    console.log(`  Name: ${farmer.name}`);
    console.log(`  Email: ${farmer.email}`);
    console.log(`  Farm: ${farmer.farmName || 'N/A'}\n`);

    // Step 2: Find products without farmerId
    console.log('Step 2: Finding products without farmerId...');
    const productsWithoutFarmer = await Product.find({
      $or: [
        { farmerId: { $exists: false } },
        { farmerId: null },
        { farmerId: '' }
      ]
    });

    console.log(`Found ${productsWithoutFarmer.length} products without farmerId\n`);

    if (productsWithoutFarmer.length === 0) {
      console.log('✅ All products already have farmerId!\n');
      
      // Check if farmer has products
      const farmerProducts = await Product.find({ farmerId: farmerId });
      console.log(`Farmer has ${farmerProducts.length} products assigned\n`);
      
      if (farmerProducts.length === 0) {
        console.log('⚠️  Farmer has no products!');
        console.log('   This means products belong to a different farmer.');
        console.log('\n   Checking all products...\n');
        
        const allProducts = await Product.find({}).lean();
        console.log(`Total products in database: ${allProducts.length}`);
        
        if (allProducts.length > 0) {
          console.log('\nSample products:');
          allProducts.slice(0, 3).forEach((p: any, i: number) => {
            console.log(`  ${i + 1}. ${p.name}`);
            console.log(`     FarmerID: ${p.farmerId || 'NONE'}`);
          });
          
          console.log('\n🔧 REASSIGNING ALL PRODUCTS TO THIS FARMER...\n');
          const result = await Product.updateMany(
            {},
            { $set: { farmerId: farmerId } }
          );
          console.log(`✅ Reassigned ${result.modifiedCount} products to farmer ${farmerId}\n`);
        }
      }
    } else {
      // Step 3: Assign farmerId to products
      console.log('Step 3: Assigning farmerId to products...');
      
      let updatedCount = 0;
      for (const product of productsWithoutFarmer) {
        product.farmerId = farmerId;
        await product.save();
        updatedCount++;
        console.log(`  ✓ ${updatedCount}. ${product.name} → farmerId: ${farmerId}`);
      }
      
      console.log(`\n✅ Updated ${updatedCount} products!\n`);
    }

    // Step 4: Verify
    console.log('Step 4: Verification...');
    const farmerProducts = await Product.find({ farmerId: farmerId }).lean();
    console.log(`✅ Farmer now has ${farmerProducts.length} products\n`);

    if (farmerProducts.length > 0) {
      console.log('Sample products:');
      farmerProducts.slice(0, 5).forEach((p: any, i: number) => {
        console.log(`  ${i + 1}. ${p.name} - ₹${p.price} - ${p.inStock ? 'In Stock' : 'Out of Stock'}`);
      });
    }

    console.log('\n========================================');
    console.log('✅ FIX COMPLETE!');
    console.log('========================================');
    console.log('\nNEXT STEPS:');
    console.log('1. Restart your server');
    console.log('2. Login as farmer:');
    console.log(`   Email: ${farmer.email}`);
    if (farmer.email === 'farmer@organic.com') {
      console.log('   Password: farmer123');
    }
    console.log('3. Go to Farmer Dashboard → Products');
    console.log(`4. You should see ${farmerProducts.length} products!`);
    console.log('5. Go to Orders tab');
    console.log('6. Place a test order as customer');
    console.log('7. Order will appear in farmer dashboard!\n');

  } catch (error) {
    console.error('\n❌ Fix Failed:', error);
    console.error('\nError details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run immediate fix
immediateFixProducts();
