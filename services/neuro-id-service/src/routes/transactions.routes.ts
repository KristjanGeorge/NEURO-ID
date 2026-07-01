import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import axios from 'axios';
import { config } from '../config.js';

export async function transactionsRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/transactions/:did
  app.get('/:did', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const { page, limit } = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(req.query);

    try {
      const res = await axios.get(
        `${config.neuropayServiceUrl}/v1/transactions`,
        {
          params: { did, page, limit },
          timeout: 8000,
          headers: { Authorization: req.headers.authorization },
        }
      );
      return reply.send(res.data);
    } catch {
      return reply.send({ transactions: [], total: 0, page, limit });
    }
  });
}
