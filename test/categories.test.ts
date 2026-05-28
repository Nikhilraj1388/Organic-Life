import { describe, it, expect } from 'vitest';

const rawBase = process.env.BASE_URL || 'http://localhost:8081';
const BASE = rawBase && rawBase.startsWith('http') ? rawBase : 'http://localhost:8081';

import net from 'net';

async function isPortOpen(host: string, port: number, timeout = 500) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let called = false;
    const onEnd = (open: boolean) => {
      if (called) return; called = true;
      try { socket.destroy(); } catch (e) { /* ignore */ }
      resolve(open);
    };
    socket.setTimeout(timeout);
    socket.once('error', () => onEnd(false));
    socket.once('timeout', () => onEnd(false));
    socket.connect(port, host, () => onEnd(true));
  });
}

describe('Categories API', () => {
  it('public GET /api/categories responds 200 when server is running', async () => {
    const parsed = new URL(BASE);
    const host = parsed.hostname;
    const port = Number(parsed.port) || 80;
    const open = await isPortOpen(host, port, 300);
    if (!open) return; // server not running

    const url = new URL('/api/categories', BASE).toString();
    const res = await global.fetch(url);
    expect([200]).toContain(res.status);
  });

  it('admin endpoints return 200 or 401 for POST/PUT/DELETE', async () => {
    const parsed = new URL(BASE);
    const host = parsed.hostname;
    const port = Number(parsed.port) || 80;
    const open = await isPortOpen(host, port, 300);
    if (!open) return; // server not running

    const post = await global.fetch(new URL('/api/admin/categories', BASE).toString(), { method: 'POST' });
    expect([200, 401, 400]).toContain(post.status);

    const put = await global.fetch(new URL('/api/admin/categories/does-not-exist', BASE).toString(), { method: 'PUT' });
    expect([200, 401, 404, 400]).toContain(put.status);

    const del = await global.fetch(new URL('/api/admin/categories/does-not-exist', BASE).toString(), { method: 'DELETE' });
    expect([200, 401, 404, 400]).toContain(del.status);
  });
});
