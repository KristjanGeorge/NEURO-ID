import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as marketService from '../services/market.service.js';

export async function marketRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/market/listings
  app.get('/listings', { preHandler: [authenticate] }, async (req: any, reply) => {
    const filter = z.object({
      assetType: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
    }).parse(req.query);

    const listings = await marketService.getListings(filter);
    return reply.send({ listings });
  });

  // POST /v1/market/buy
  app.post('/buy', { preHandler: [authenticate] }, async (req: any, reply) => {
    const body = z.object({
      listingId: z.string().uuid(),
      quantityMicros: z.string().regex(/^\d+$/),
      grossAmountMicros: z.string().regex(/^\d+$/),
    }).parse(req.body);

    const result = await marketService.buyToken({
      buyerDid: req.user.sub,
      ...body,
    });

    return reply.code(201).send(result);
  });

  // POST /v1/market/sell
  app.post('/sell', { preHandler: [authenticate] }, async (req: any, reply) => {
    const body = z.object({
      tokenId: z.string(),
      priceMicros: z.string().regex(/^\d+$/),
      quantityMicros: z.string().regex(/^\d+$/),
    }).parse(req.body);

    const result = await marketService.listToken({
      sellerDid: req.user.sub,
      ...body,
    });

    return reply.code(201).send(result);
  });
}
