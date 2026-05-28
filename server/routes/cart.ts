import { RequestHandler } from 'express';
import { Cart } from '../models/Cart';

const CartModel = Cart as unknown as import('mongoose').Model<any>;

export const getCart: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
  const cart = await CartModel.findOne({ userId }).lean();
    if (!cart) return res.json({ items: [], isOpen: false });
    return res.json(cart);
  } catch (e) {
    console.error('Failed to read cart', e);
    return res.status(500).json({ error: 'Failed to read cart' });
  }
};

export const syncCart: RequestHandler = async (req, res) => {
  const { userId, cart } = req.body as { userId?: string; cart?: any };
  if (!userId || !cart) {
    return res.status(400).json({ error: 'userId and cart are required' });
  }
  try {
  await CartModel.findOneAndUpdate({ userId }, { ...cart, userId }, { upsert: true });
    return res.json({ ok: true });
  } catch (e) {
    console.error('Failed to save cart', e);
    return res.status(500).json({ error: 'Failed to save cart' });
  }
};
