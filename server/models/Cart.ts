import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const models = mongoose.models;

const CartItemSchema = new Schema({
  productId: String,
  name: String,
  qty: Number,
  price: Number,
});

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

export const Cart = models.Cart || model('Cart', CartSchema);
