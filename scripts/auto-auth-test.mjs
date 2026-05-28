// scripts/auto-auth-test.mjs
// Simple test runner for auth endpoints against http://localhost:8080
// Usage: node scripts/auto-auth-test.mjs

const BASE = process.env.API_BASE || 'http://localhost:8080';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(BASE + '/api/ping');
      if (r.ok) {
        const j = await r.json().catch(() => null);
        console.log('[ping] ok', j);
        return true;
      }
    } catch (e) {
      // ignore
    }
    await sleep(1000);
    process.stdout.write('.');
  }
  console.error('\nTimed out waiting for server');
  return false;
}

async function run() {
  console.log('Base URL:', BASE);
  const up = await waitForServer(30000);
  if (!up) process.exit(2);

  const email = `autotest+${Date.now()}@example.com`;
  const password = 'TestPass123!';
  const newPassword = 'NewPass123!';

  console.log('\n=== Register ===');
  try {
    const res = await fetch(BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Auto Test' }),
    });
    const body = await res.text();
    console.log('register status', res.status, body);
  } catch (e) {
    console.error('register error', e);
  }

  console.log('\n=== Login (old password) ===');
  try {
    const res = await fetch(BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    console.log('login status', res.status, text);
  } catch (e) {
    console.error('login error', e);
  }

  console.log('\n=== Forgot password ===');
  let token = null;
  try {
    const res = await fetch(BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => null);
    console.log('forgot status', res.status, json);
    token = json?.token;
  } catch (e) {
    console.error('forgot error', e);
  }

  if (token) {
    console.log('\n=== Reset password using token ===');
    try {
      const res = await fetch(BASE + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });
      const json = await res.json().catch(() => null);
      console.log('reset status', res.status, json);
    } catch (e) {
      console.error('reset error', e);
    }

    console.log('\n=== Login (new password) ===');
    try {
      const res = await fetch(BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const text = await res.text();
      console.log('login status', res.status, text);
    } catch (e) {
      console.error('login new error', e);
    }
  } else {
    console.log('No reset token returned (cannot test reset flow)');
  }

  console.log('\nDone');
}

run().catch((err) => { console.error(err); process.exit(99); });
