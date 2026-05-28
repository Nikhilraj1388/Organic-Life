import "dotenv/config";
import { connectDb, getMongoUrl } from "../server/db";
import { Product } from "../server/models/Product";

async function run() {
  const mongoUrl = getMongoUrl();
  const mongoose = await connectDb(mongoUrl);

  await Product.deleteMany({});
  console.log("Cleared products");

  await mongoose.disconnect();
  console.log("Finished clearing products");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
