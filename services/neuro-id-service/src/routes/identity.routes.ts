import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../index.js';
import * as identityService from '../services/identity.service.js';
import * as kycService from '../services/kyc.service.js';
import * as qrService from '../services/qr.service.js';

export async function identityRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/identity/:did
  app.get('/:did', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    return reply.send({ identity });
  });

  // PUT /v1/identity/:did/kyc — submit KYC documents
  app.put('/:did/kyc', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const body = z.object({
      kycLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      documentType: z.enum(['RUT', 'PASSPORT', 'NATIONAL_ID', 'COMPANY_RUT', 'TAX_ID']),
      documentHash: z.string().length(64),
      countryCode: z.string().length(2).default('CL'),
      validUntil: z.string().datetime(),
    }).parse(req.body);

    const result = await kycService.submitKycVerification(pool, {
      subjectDid: did,
      ...body,
    });

    return reply.send({ result });
  });

  // GET /v1/identity/:did/qr — wallet QR code
  app.get('/:did/qr', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const { type } = z.object({
      type: z.enum(['PAYMENT', 'AUTH', 'TRANSFER']).default('AUTH'),
    }).parse(req.query);

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const payload = qrService.buildQRPayload(type as qrService.QRType, did, identity.walletAddress);
    const dataUrl = await qrService.generateQRDataUrl(payload);

    return reply.send({ qr: dataUrl, payload });
  });

  // GET /v1/identity/:did/qr/png — raw PNG
  app.get('/:did/qr/png', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const payload = qrService.buildQRPayload('AUTH', did, identity.walletAddress);
    const png = await qrService.generateQRPng(payload);

    return reply.header('Content-Type', 'image/png').send(png);
  });
}
