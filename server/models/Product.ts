import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  farmerId: { type: String, ref: 'User' },
  image: String,
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, enum: ['kg', 'unit', 'litre', 'dozen', 'gram'], default: 'kg' },
  // Status indicates approval workflow for admin
  status: { type: String, enum: ['pending', 'approved', 'removed'], default: 'pending' },
  published: { type: Boolean, default: true },
  quantityOptions: [{
    label: { type: String, required: true },
    value: { type: Number, required: true },
  }],
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const Product = models.Product || model("Product", ProductSchema);
