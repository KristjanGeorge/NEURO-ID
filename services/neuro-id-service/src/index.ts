import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { Pool } from 'pg';
import { config } from './config.js';
import { authRoutes } from './routes/auth.routes.js';
import { identityRoutes } from './routes/identity.routes.js';
import { walletRoutes } from './routes/wallet.routes.js';
import { transactionsRoutes } from './routes/transactions.routes.js';
import { pocketRoutes } from './routes/pocket.routes.js';
import { marketRoutes } from './routes/market.routes.js';
import { iiotRoutes } from './routes/iiot.routes.js';

const app = Fastify({ logger: { level: config.nodeEnv === 'production' ? 'info' : 'debug' } });

export const pool = new Pool({ connectionString: config.databaseUrl });

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
await app.register(jwt, { secret: config.jwtSecret });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/health', async () => ({
  status: 'ok',
  service: 'neuro-id-service',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

await app.register(authRoutes, { prefix: '/v1/auth' });
await app.register(identityRoutes, { prefix: '/v1/identity' });
await app.register(walletRoutes, { prefix: '/v1/wallet' });
await app.register(transactionsRoutes, { prefix: '/v1/transactions' });
await app.register(pocketRoutes, { prefix: '/v1/pocket' });
await app.register(marketRoutes, { prefix: '/v1/market' });
await app.register(iiotRoutes, { prefix: '/v1/iiot' });

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(`neuro-id-service running on port ${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
