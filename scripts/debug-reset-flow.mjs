import connectDb, { getMongoUrl } from '../server/db.js';
import { User } from '../server/models/User.js';
import { createServer } from '../server/index.js';

const PORT = 8090;
(async function(){
  try{
    await connectDb();
    console.log('Mongo connected');
    const app = createServer();
    const server = app.listen(PORT, () => console.log(`Server listening ${PORT}`));
    const BASE = `http://localhost:${PORT}`;
    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    const email = `debugflow+${Date.now()}@example.com`;
    const password = 'TestPass123!';
    console.log('Registering', email);
    let res = await fetch(BASE + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, name: 'Debug Flow' }) });
    console.log('register', res.status, await res.text());

    console.log('Calling forgot-password');
    res = await fetch(BASE + '/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    const forgotJson = await res.json().catch(()=>null);
    console.log('forgot response', res.status, forgotJson);

    const userDoc = await User.findOne({ email }).lean();
    console.log('user doc after forgot:', userDoc);

    if (forgotJson && forgotJson.token) {
      console.log('Attempt reset using returned token:', forgotJson.token);
      res = await fetch(BASE + '/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: forgotJson.token, password: 'NewPass123!' }) });
      console.log('reset response', res.status, await res.text());

      const userAfter = await User.findOne({ email }).lean();
      console.log('user after reset:', userAfter);
    }

    server.close();
    process.exit(0);
  }catch(err){console.error(err); process.exit(1);} 
})();
