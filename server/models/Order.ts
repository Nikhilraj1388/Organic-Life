import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const models = mongoose.models;

const OrderItemSchema = new Schema({
  productId: String,
  name: String,
  qty: Number,
  price: Number,
  farmerId: String,
});

const OrderSchema = new Schema({
  // Accept string auth IDs (e.g. 'google-...') or ObjectId strings.
  // Using String here avoids CastError when user identifiers are external provider ids.
  userId: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  total: Number,
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  items: [OrderItemSchema],
});

export const Order = models.Order || model('Order', OrderSchema);
