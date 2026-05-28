import { createServer } from '../server/index.js';
import connectDb, { getMongoUrl } from '../server/db.js';

const PORT = 8081;
(async function(){
  try {
    const mongoUrl = getMongoUrl();
    await connectDb(mongoUrl);
    console.log('Mongo connected');
    const app = createServer();
    const server = app.listen(PORT, () => console.log(`Standalone server listening on ${PORT}`));

    // simple test sequence
    const BASE = `http://localhost:${PORT}`;
    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    const email = `standalone+${Date.now()}@example.com`;
    const password = 'TestPass123!';
    const newPassword = 'NewPass123!';

    console.log('\n=== Register ===');
    let res = await fetch(BASE + '/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name: 'Standalone Test' })
    });
    console.log('register status', res.status, await res.text());

    console.log('\n=== Login ===');
    res = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    console.log('login status', res.status, await res.text());

    console.log('\n=== Forgot password ===');
    res = await fetch(BASE + '/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const forgotJson = await res.json().catch(()=>null);
    console.log('forgot status', res.status, forgotJson);

    if (forgotJson && forgotJson.token) {
      console.log('\n=== Reset password ===');
      res = await fetch(BASE + '/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: forgotJson.token, password: newPassword }) });
      console.log('reset status', res.status, await res.text());

      console.log('\n=== Login with new password ===');
      res = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: newPassword }) });
      console.log('login new status', res.status, await res.text());
    } else {
      console.log('No token returned; cannot test reset');
    }

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
