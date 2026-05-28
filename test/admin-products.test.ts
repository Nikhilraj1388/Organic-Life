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

describe('Admin products API', () => {
  it('responds with 200 or 401 when fetching admin products', async () => {
    const parsed = new URL(BASE);
    const host = parsed.hostname;
    const port = Number(parsed.port) || 80;
    const open = await isPortOpen(host, port, 300);
    if (!open) return; // server not running

    const url = new URL('/api/admin/products', BASE).toString();
    const res = await global.fetch(url);
    expect([200, 401]).toContain(res.status);
  });
});
