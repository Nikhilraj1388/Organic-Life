import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const models = mongoose.models;

const UserSchema = new Schema({
  authId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  name: String,
  password: String, // bcrypt hashed password
  role: { type: String, enum: ['user', 'farmer', 'admin'], default: 'user' },
  // Farmer-specific fields
  farmName: String,
  farmLocation: String,
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  profileComplete: { type: Boolean, default: false },
  resetPasswordTokenHash: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model('User', UserSchema);
