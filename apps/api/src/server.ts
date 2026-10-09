import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import type Redis from 'ioredis';
interface Dependencies {
  database: () => Promise<void>;
  redis: () => Promise<void>;
  rateLimitRedis?: Redis;
  origin: string;
  logging?: boolean;
  rateLimitMax?: number;
}
export async function createServer(deps: Dependencies) {
  const app = Fastify({
    logger: deps.logging
      ? {
          level: 'info',
          redact: [
            'req.headers.cookie',
            'req.headers.authorization',
            'req.body',
            'res.headers.set-cookie',
          ],
          serializers: {
            req: () => ({}),
            res: (r) => ({ statusCode: r.statusCode }),
          },
        }
      : false,
    bodyLimit: 65536,
    requestTimeout: 10000,
    connectionTimeout: 10000,
    trustProxy: false,
  });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
      },
    },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  });
  await app.register(cors, {
    origin: deps.origin,
    credentials: true,
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  });
  await app.register(rateLimit, {
    max: deps.rateLimitMax ?? 60,
    timeWindow: '1 minute',
    ...(deps.rateLimitRedis ? { redis: deps.rateLimitRedis } : {}),
    skipOnError: false,
  });
  app.addHook('onRequest', async (_req, reply) => {
    reply.header('Cache-Control', 'no-store');
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
  });
  app.setErrorHandler((error, _req, reply) => {
    const code =
      error && typeof error === 'object' && 'statusCode' in error
        ? error.statusCode
        : undefined;
    const status =
      typeof code === 'number' && code >= 400 && code < 500 ? code : 500;
    reply.code(status).send({
      error:
        status === 429
          ? 'Too many requests'
          : status === 400
            ? 'Invalid request'
            : 'Request failed',
    });
  });
  const query = z.strictObject({});
  app.get('/health', async (req, reply) => {
    if (!query.safeParse(req.query).success)
      return reply.code(400).send({ error: 'Invalid request' });
    return { status: 'ok' };
  });
  app.get('/ready', async (req, reply) => {
    if (!query.safeParse(req.query).success)
      return reply.code(400).send({ error: 'Invalid request' });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        Promise.all([deps.database(), deps.redis()]),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Dependency timeout')),
            2000,
          );
        }),
      ]);
      return { status: 'ready' };
    } catch {
      return reply.code(503).send({ status: 'unavailable' });
    } finally {
      if (timer) clearTimeout(timer);
    }
  });
  return app;
}
