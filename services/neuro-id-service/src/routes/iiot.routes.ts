import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../index.js';
import * as identityService from '../services/identity.service.js';
import * as iiotService from '../services/iiot.service.js';

export async function iiotRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/iiot/:did/connections
  app.get('/:did/connections', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const connections = await iiotService.getConnections(pool, identity.id);
    return reply.send({ connections });
  });

  // GET /v1/iiot/:did/asset/:assetDid
  app.get('/:did/asset/:assetDid', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did, assetDid } = z.object({ did: z.string(), assetDid: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const connection = await iiotService.getAssetStatus(pool, identity.id, decodeURIComponent(assetDid));
    if (!connection) return reply.code(404).send({ error: 'Asset connection not found' });

    return reply.send({ connection });
  });

  // POST /v1/iiot/:did/connections — register a new asset connection
  app.post('/:did/connections', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const body = z.object({
      tokenId: z.string(),
      assetDid: z.string().startsWith('did:'),
      assetName: z.string().min(1).max(200),
      assetType: z.enum(['REAL_ESTATE', 'INFRASTRUCTURE', 'EMISSION_RIGHT', 'EQUIPMENT', 'FUND_UNIT', 'OTHER']),
      protocol: z.enum(['XMPP', 'MQTT', 'HTTP']).default('XMPP'),
      endpointUrl: z.string().url(),
    }).parse(req.body);

    const connection = await iiotService.registerConnection(pool, identity.id, body);
    return reply.code(201).send({ connection });
  });
}
