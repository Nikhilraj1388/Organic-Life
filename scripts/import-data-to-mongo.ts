import 'dotenv/config';
import { connectDb, getMongoUrl } from '../server/db';
import { User } from '../server/models/User';
import { Profile } from '../server/models/Profile';
import { Order } from '../server/models/Order';
import { Cart } from '../server/models/Cart';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function run() {
  const mongoUrl = getMongoUrl();
  const mongoose = await connectDb(mongoUrl);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dataDir = path.join(__dirname, '..', 'server', '.data');

  // Import orders
  try {
    const ordersPath = path.join(dataDir, 'orders.json');
    if (fs.existsSync(ordersPath)) {
      const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      for (const o of orders) {
        await Order.create(o);
      }
      console.log('Imported orders');
    }
  } catch (err) {
    console.error('Orders import error', err);
  }

  // Import carts
  try {
    const cartsPath = path.join(dataDir, 'carts.json');
    if (fs.existsSync(cartsPath)) {
      const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf8'));
      for (const c of carts) {
        await Cart.create(c);
      }
      console.log('Imported carts');
    }
  } catch (err) {
    console.error('Carts import error', err);
  }

  // Import profiles
  try {
    const profilesPath = path.join(dataDir, 'profiles.json');
    if (fs.existsSync(profilesPath)) {
      const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
      for (const p of profiles) {
        await Profile.create(p);
      }
      console.log('Imported profiles');
    }
  } catch (err) {
    console.error('Profiles import error', err);
  }

  await mongoose.disconnect();
  console.log('Import complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
