import { describe, it, expect } from "vitest";
import connectDb from "../server/db";

// Ensure tests run in local environments where .env might be missing in CI
if (!process.env.MONGODB_URI && !process.env.DATABASE_URL && !process.env.MONGODB_URL && !process.env.MONGO_URL) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/organic-life';
}

describe("Database Connection", () => {
  it("should connect to MongoDB successfully", async () => {
    try {
      const connection = await connectDb();
      expect(connection).toBeDefined();
      expect(connection.connection.readyState).toBe(1); // 1 for connected
      await connection.disconnect();
    } catch (error) {
      console.error("MongoDB connection error in test:", error);
      throw error;
    }
  }, 30000); // 30 second timeout for the test
});
