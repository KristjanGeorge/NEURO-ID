import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../index.js';
import * as identityService from '../services/identity.service.js';
import * as pocketService from '../services/pocket.service.js';

export async function pocketRoutes(app: FastifyInstance) {
  const authenticate = async (req: any, reply: any) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  };

  // GET /v1/pocket/:did/documents
  app.get('/:did/documents', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const documents = await pocketService.listDocuments(pool, identity.id);
    return reply.send({ documents });
  });

  // POST /v1/pocket/:did/documents — multipart upload
  app.post('/:did/documents', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did } = z.object({ did: z.string() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const parts = req.parts();
    let fileBuffer: Buffer | null = null;
    let filename = 'document';
    let mimeType = 'application/octet-stream';
    const fields: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) chunks.push(chunk);
        fileBuffer = Buffer.concat(chunks);
        filename = part.filename ?? 'document';
        mimeType = part.mimetype ?? 'application/octet-stream';
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (!fileBuffer) return reply.code(400).send({ error: 'No file uploaded' });

    const meta = z.object({
      type: z.enum(['DRIVER_LICENSE', 'PASSPORT', 'MEDICAL', 'INSURANCE', 'PROPERTY', 'CUSTOM']),
      title: z.string().min(1).max(200),
      issuedBy: z.string().optional(),
      validFrom: z.string().datetime().optional(),
      expiresAt: z.string().datetime().optional(),
    }).parse(fields);

    const doc = await pocketService.uploadDocument(pool, {
      identityId: identity.id,
      did,
      walletAddress: identity.walletAddress,
      buffer: fileBuffer,
      filename,
      mimeType,
      ...meta,
    });

    return reply.code(201).send({ document: doc });
  });

  // GET /v1/pocket/:did/documents/:id
  app.get('/:did/documents/:id', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did, id } = z.object({ did: z.string(), id: z.string().uuid() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const doc = await pocketService.getDocument(pool, id, identity.id);
    if (!doc) return reply.code(404).send({ error: 'Document not found' });

    return reply.send({ document: doc });
  });

  // GET /v1/pocket/:did/documents/:id/download — redirect to presigned URL
  app.get('/:did/documents/:id/download', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did, id } = z.object({ did: z.string(), id: z.string().uuid() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    const doc = await pocketService.getDocument(pool, id, identity.id);
    if (!doc?.downloadUrl) return reply.code(404).send({ error: 'Document not found' });

    return reply.redirect(302, doc.downloadUrl);
  });

  // DELETE /v1/pocket/:did/documents/:id
  app.delete('/:did/documents/:id', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { did, id } = z.object({ did: z.string(), id: z.string().uuid() }).parse(req.params);
    if (req.user.sub !== did) return reply.code(403).send({ error: 'Forbidden' });

    const identity = await identityService.findByDid(pool, did);
    if (!identity) return reply.code(404).send({ error: 'Identity not found' });

    await pocketService.deleteDocument(pool, id, identity.id);
    return reply.code(204).send();
  });
}
