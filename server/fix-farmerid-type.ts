import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * FIX: farmerId type mismatch - convert ObjectId to String
 */

async function fixFarmerIdType() {
  try {
    console.log('🔧 FIXING farmerId type mismatch...\n');

    const dbUrl = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/organic-life';
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB\n');

    // Import actual models
    const { Product } = await import('./models/Product.js');
    const { User } = await import('./models/User.js');

    const ProductModel = Product as unknown as mongoose.Model<any>;
    const UserModel = User as unknown as mongoose.Model<any>;

    // Find farmer
    const farmer = await UserModel.findOne({ email: 'nikhilrajput1388@gmail.com' }).lean();
    
    if (!farmer) {
      console.log('❌ Farmer not found!');
      return;
    }

    const farmerId = farmer._id.toString();
    console.log('Farmer ID:', farmerId);
    console.log('Farmer ID type:', typeof farmerId);
    console.log('Farmer _id:', farmer._id);
    console.log('Farmer _id type:', typeof farmer._id);
    console.log();

    // Check all products
    console.log('Checking all products...');
    const allProducts = await ProductModel.find({}).lean();
    console.log(`Total products: ${allProducts.length}\n`);

    allProducts.forEach((p: any, i: number) => {
      console.log(`Product ${i + 1}: ${p.name}`);
      console.log(`  farmerId: ${p.farmerId}`);
      console.log(`  farmerId type: ${typeof p.farmerId}`);
      console.log(`  farmerId is ObjectId: ${p.farmerId instanceof mongoose.Types.ObjectId}`);
      console.log(`  Match with string: ${p.farmerId?.toString() === farmerId}`);
      console.log();
    });

    // Update all products to use STRING farmerId
    console.log('🔧 Converting all farmerId to STRING type...\n');
    
    for (const product of allProducts) {
      const doc = await ProductModel.findById(product._id);
      if (doc) {
        doc.farmerId = farmerId; // Set as string
        await doc.save();
        console.log(`✓ Updated ${doc.name} - farmerId: ${doc.farmerId} (${typeof doc.farmerId})`);
      }
    }

    // Verify again
    console.log('\n========== VERIFICATION ==========');
    const farmerProducts = await ProductModel.find({ farmerId: farmerId }).lean();
    console.log(`Products with farmerId "${farmerId}": ${farmerProducts.length}`);

    if (farmerProducts.length > 0) {
      console.log('\n✅ SUCCESS! Products found:');
      farmerProducts.forEach((p: any, i: number) => {
        console.log(`  ${i + 1}. ${p.name}`);
      });
    } else {
      console.log('\n❌ STILL NO PRODUCTS FOUND!');
      console.log('Trying alternative query...\n');
      
      // Try finding with ObjectId
      const farmerObjectId = new mongoose.Types.ObjectId(farmerId);
      const productsWithObjectId = await ProductModel.find({ farmerId: farmerObjectId }).lean();
      console.log(`Products with ObjectId farmerId: ${productsWithObjectId.length}`);
      
      // Try finding any products
      const anyProducts = await ProductModel.find({}).lean();
      console.log(`Total products in DB: ${anyProducts.length}`);
      
      if (anyProducts.length > 0) {
        console.log('\nDirect MongoDB query test:');
        const db = mongoose.connection.db;
        const productsCollection = db?.collection('products');
        
        if (productsCollection) {
          const directQuery = await productsCollection.find({ farmerId: farmerId }).toArray();
          console.log(`Direct query with string: ${directQuery.length}`);
          
          const directQueryObjectId = await productsCollection.find({ farmerId: farmerObjectId }).toArray();
          console.log(`Direct query with ObjectId: ${directQueryObjectId.length}`);
          
          // Show what's actually in the database
          const sample = await productsCollection.findOne({});
          console.log('\nSample product from DB:');
          console.log(JSON.stringify(sample, null, 2));
        }
      }
    }

    console.log('\n========================================');
    console.log('Now restart server and check farmer dashboard!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixFarmerIdType();
