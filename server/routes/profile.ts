import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Profile } from '../models/Profile';

const ProfileModel = Profile as unknown as import('mongoose').Model<any>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '.data', 'avatars');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const uploadAvatar: RequestHandler = async (req, res) => {
  try {
    const { userId, filename, data } = req.body as { userId: string; filename: string; data: string };
    if (!userId || !data) return res.status(400).json({ error: 'missing' });

    // data is expected to be a data URL: data:image/png;base64,....
    const match = data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'invalid_data' });
    const ext = match[1].split('/')[1] || 'png';
    const b64 = match[2];
    const buffer = Buffer.from(b64, 'base64');

    const targetName = `${userId}-${Date.now()}.${ext}`;
    const targetPath = path.join(DATA_DIR, targetName);
    fs.writeFileSync(targetPath, buffer);

    // return a URL that the client can fetch from the dev server
    const url = `/data/avatars/${targetName}`;

    // persist avatar url to Profile
  await ProfileModel.findOneAndUpdate({ userId }, { avatarUrl: url }, { upsert: true });

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

export const deleteAvatar: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body as { userId: string };
    if (!userId) return res.status(400).json({ error: 'missing' });
    // delete all files that start with userId-
    const files = fs.readdirSync(DATA_DIR);
    for (const f of files) {
      if (f.startsWith(`${userId}-`)) {
        try { fs.unlinkSync(path.join(DATA_DIR, f)); } catch (e) { /* ignore */ }
      }
    }

    // remove avatarUrl from profile
  await ProfileModel.findOneAndUpdate({ userId }, { $unset: { avatarUrl: 1 } }, { upsert: false });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};
