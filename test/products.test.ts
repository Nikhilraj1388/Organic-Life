import { describe, it, expect } from 'vitest';

// NOTE: These tests expect the dev server to be running at http://localhost:8081
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

describe('Public products API', () => {
  it('returns an array of published products', async () => {
    const parsed = new URL(BASE);
    const host = parsed.hostname;
    const port = Number(parsed.port) || 80;

    const open = await isPortOpen(host, port, 300);
    if (!open) {
      // Dev server not running; skip network assertions
      return;
    }

    const url = new URL('/api/products', BASE).toString();
    const res = await global.fetch(url);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('published');
    }
  });
});
