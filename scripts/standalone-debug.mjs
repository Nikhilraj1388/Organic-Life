import connectDb, { getMongoUrl } from '../server/db.js';
import { User } from '../server/models/User.js';
import { createServer } from '../server/index.js';

const PORT = 8082;
(async function(){
  try {
    await connectDb();
    console.log('Mongo connected debug');
    const app = createServer();
    const server = app.listen(PORT, () => console.log(`Server listening ${PORT}`));

    const BASE = `http://localhost:${PORT}`;
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const email = `debug+${Date.now()}@example.com`;
    const password = 'TestPass123!';

    console.log('Registering', email);
    let res = await fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name: 'Debug Test' }) });
    console.log('register status', res.status, await res.text());

    const doc = await User.findOne({ email }).lean();
    console.log('DB user document:', doc);

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
