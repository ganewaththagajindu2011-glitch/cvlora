import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { readServerEnv } from '@cvlora/shared';
import { createServer } from './server';
async function main() {
  const env = readServerEnv(process.env);
  const prisma = new PrismaClient();
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false,
    lazyConnect: true,
  });
  redis.on('error', () => {});
  await redis.connect();
  await prisma.$connect();
  const app = await createServer({
    origin: env.WEB_ORIGIN,
    logging: true,
    rateLimitRedis: redis,
    database: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
    redis: async () => {
      const pong = await redis.ping();
      if (pong !== 'PONG') throw new Error('Redis unavailable');
    },
  });
  const close = async () => {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
  };
  process.once('SIGTERM', () => {
    void close();
  });
  process.once('SIGINT', () => {
    void close();
  });
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}
main().catch(() => {
  console.error(
    'API startup failed. Check required environment variables and service availability.',
  );
  process.exit(1);
});
