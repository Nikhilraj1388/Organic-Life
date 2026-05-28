import mongoose from 'mongoose';
import { connectDb } from '../server/db';
import { Product } from '../server/models/Product';
import fs from 'fs';
import path from 'path';

async function linkImages() {
  try {
    await connectDb();
    console.log('Connected to the database.');

    const imagesDir = path.join(__dirname, '../../public/Images');
    const imageFiles = fs.readdirSync(imagesDir);

    const products = await Product.find();

    for (const product of products) {
      const productName = product.name;
      const imageFile = imageFiles.find((file) => {
        const imageName = path.parse(file).name;
        return imageName.toLowerCase() === productName.toLowerCase();
      });

      if (imageFile) {
        product.image = `/Images/${imageFile}`;
        await product.save();
        console.log(`Updated image for product: ${product.name}`);
      }
    }

    console.log('Finished linking images.');
  } catch (error) {
    console.error('Error linking images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from the database.');
  }
}

linkImages();