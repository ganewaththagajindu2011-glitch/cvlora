import { it, expect, describe } from 'vitest';
import { createServer } from './server';
const healthy = {
  origin: 'http://localhost:3000',
  database: async () => {},
  redis: async () => {},
};
describe('operational endpoints', () => {
  it('reports readiness only when required services respond', async () => {
    const app = await createServer(healthy);
    const res = await app.inject('/ready');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ready' });
    await app.close();
  });
  it('does not expose dependency errors or configuration', async () => {
    const app = await createServer({
      ...healthy,
      database: async () => {
        throw new Error('secret password');
      },
    });
    const res = await app.inject('/ready');
    expect(res.statusCode).toBe(503);
    expect(res.body).not.toContain('secret');
    await app.close();
  });
  it('rejects unexpected query parameters and sets defensive headers', async () => {
    const app = await createServer(healthy);
    expect((await app.inject('/health?ownerId=123')).statusCode).toBe(400);
    const res = await app.inject('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'none'",
    );
    expect(res.headers['cache-control']).toBe('no-store');
    await app.close();
  });
  it('rate limits repeated requests', async () => {
    const app = await createServer({ ...healthy, rateLimitMax: 2 });
    await app.inject('/health');
    await app.inject('/health');
    expect((await app.inject('/health')).statusCode).toBe(429);
    await app.close();
  });
  it('does not expose unimplemented private endpoints and rejects foreign CORS origins', async () => {
    const app = await createServer(healthy);
    expect((await app.inject('/cvs')).statusCode).toBe(404);
    const res = await app.inject({
      url: '/health',
      headers: { origin: 'https://evil.example' },
    });
    expect(res.headers['access-control-allow-origin']).not.toBe(
      'https://evil.example',
    );
    await app.close();
  });
});
