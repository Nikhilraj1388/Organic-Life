import connectDb, { getMongoUrl } from '../server/db.js';
import mongoose from 'mongoose';
import { User } from '../server/models/User.js';

(async()=>{
  try{
    const mongoUrl = getMongoUrl();
    await connectDb(mongoUrl);
    const u = await User.findOne({ email: /standalone\+/ }).lean();
    console.log('found', u);
    process.exit(0);
  }catch(err){console.error(err);process.exit(1)}
})();
