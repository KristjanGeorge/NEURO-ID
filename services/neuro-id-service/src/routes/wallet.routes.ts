import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../index.js';
import * as walletService from '../services/wallet.service.js';
import * as identityService from '../services/identity.service.js';

export async function walletRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/wallet/:did
  app.get('/:did', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const [{ balanceMicros }, usdRate] = await Promise.all([
      walletService.getBalance(did),
      walletService.getUsdRate(),
    ]);

    return reply.send({
      did,
      walletAddress: identity.walletAddress,
      balanceMicros,
      balanceNcn: walletService.formatNcn(balanceMicros),
      balanceUsd: walletService.ncnToUsd(balanceMicros, usdRate),
      usdRate,
      currency: 'CLP',
    });
  });

  // GET /v1/wallet/:did/rate — current USD/NCN rate
  app.get('/:did/rate', { preHandler: [authenticate] }, async (req: any, reply) => {
    const rate = await walletService.getUsdRate();
    return reply.send({ usdRate: rate, currency: 'CLP', updatedAt: new Date().toISOString() });
  });

  // GET /v1/wallet/:did/tokens — NEUROTOKEN holdings
  app.get('/:did/tokens', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const holdings = await walletService.getTokenHoldings(did);
    return reply.send({ holdings });
  });
}
