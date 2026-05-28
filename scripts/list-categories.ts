
import 'dotenv/config';
import connectDb from '../server/db.ts';
import { Category } from '../server/models/Category.ts';

async function listCategories() {
  try {
    await connectDb();
    const categories = await (Category as any).find().lean();
    if (!categories.length) {
      console.log('No categories found');
    } else {
      console.log('Categories:');
      console.table(categories.map((c: any) => ({
        ID: c._id.toString(),
        Name: c.name,
        Key: c.key,
        Image: c.image,
        Order: c.order,
      })));
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  } finally {
    process.exit(0);
  }
}

listCategories();
