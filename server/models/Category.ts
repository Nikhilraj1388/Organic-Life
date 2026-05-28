import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models;

// Category model stores a display `name` and a normalized `key` used for uniqueness
const CategorySchema = new Schema({
  name: { type: String, required: true },
  // normalized key (lowercase, trimmed) for uniqueness
  key: { type: String, required: true, unique: true, index: true },
  image: { type: String },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure key is derived from name if not provided
CategorySchema.pre('validate', function (next) {
  if (!this.key && this.name) {
    this.key = String(this.name).trim().toLowerCase();
  }
  next();
});

export const Category = models.Category || model('Category', CategorySchema);
