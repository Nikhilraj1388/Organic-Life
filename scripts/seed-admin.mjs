import 'dotenv/config';
import connectDb, { getMongoUrl } from '../server/db.js';
import { User } from '../server/models/User.js';
import bcrypt from 'bcryptjs';

(async function () {
  try {
    const mongoUrl = getMongoUrl();
    await connectDb(mongoUrl);

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      console.log(`Admin user already exists: ${email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new User({
      name: 'Administrator',
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      profileComplete: true,
    });

    await admin.save();

    console.log(`Created admin user: ${email}`);
    console.log('Use this to login and access /admin:');
    console.log(`  email: ${email}`);
    console.log(`  password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user', error);
    process.exit(1);
  }
})();