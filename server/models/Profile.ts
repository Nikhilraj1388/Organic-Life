import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const models = mongoose.models;

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  avatarUrl: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  gender: String,
  dietaryRestrictions: String,
  notifications: { type: Boolean, default: false },
  newsletter: { type: Boolean, default: false },
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
});

export const Profile = models.Profile || model('Profile', ProfileSchema);
