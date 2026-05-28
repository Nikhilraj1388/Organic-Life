import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models;

const PromotionSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  productId: { type: String, ref: 'Product' },
  farmerId: { type: String, ref: 'User' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const Promotion = models.Promotion || model("Promotion", PromotionSchema);
