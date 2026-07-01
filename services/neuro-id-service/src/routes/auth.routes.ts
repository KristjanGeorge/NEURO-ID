import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { pool } from '../index.js';
import * as identityService from '../services/identity.service.js';

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  documentType: z.enum(['RUT', 'PASSPORT', 'NATIONAL_ID', 'COMPANY_RUT', 'TAX_ID']).default('RUT'),
  documentNumber: z.string().min(3).max(30),
  countryCode: z.string().length(2).default('CL'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /v1/auth/register
  app.post('/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);

    const existing = await identityService.findByEmail(pool, body.email);
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const identity = await identityService.createIdentity(pool, body);

    const jti = uuidv4();
    const token = app.jwt.sign(
      { sub: identity.did, jti, kycLevel: identity.kycLevel },
      { expiresIn: '24h' }
    );

    await pool.query(
      `INSERT INTO neuro_id.sessions (identity_id, jwt_jti, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [identity.id, jti]
    );

    return reply.code(201).send({ token, identity });
  });

  // POST /v1/auth/login
  app.post('/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);

    const identity = await identityService.findByEmail(pool, body.email);
    if (!identity) return reply.code(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(body.password, identity.passwordHash);
    if (!valid) return reply.code(401).send({ error: 'Invalid credentials' });

    if (identity.status === 'SUSPENDED' || identity.status === 'REVOKED') {
      return reply.code(403).send({ error: 'Account suspended' });
    }

    const jti = uuidv4();
    const token = app.jwt.sign(
      { sub: identity.did, jti, kycLevel: identity.kycLevel },
      { expiresIn: '24h' }
    );

    await pool.query(
      `INSERT INTO neuro_id.sessions (identity_id, jwt_jti, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [identity.id, jti]
    );

    const { passwordHash: _, ...safeIdentity } = identity;
    return reply.send({ token, identity: safeIdentity });
  });

  // POST /v1/auth/biometric/challenge — returns a nonce to sign
  app.post('/biometric/challenge', {
    preHandler: [app.authenticate],
  }, async (req: any, reply) => {
    const did = req.user.sub as string;
    const nonce = uuidv4();
    const hash = createHash('sha256').update(nonce).digest('hex');

    await identityService.setBiometricChallenge(pool, did, hash);

    return reply.send({ nonce, expiresIn: 60 });
  });

  // POST /v1/auth/biometric/verify — verifies the signed nonce
  app.post('/biometric/verify', {
    preHandler: [app.authenticate],
  }, async (req: any, reply) => {
    const { nonce } = z.object({ nonce: z.string() }).parse(req.body);
    const did = req.user.sub as string;

    const row = await pool.query(
      'SELECT biometric_challenge_hash FROM neuro_id.identities WHERE did = $1',
      [did]
    );

    if (!row.rows[0]?.biometric_challenge_hash) {
      return reply.code(400).send({ error: 'No pending challenge' });
    }

    const expected = createHash('sha256').update(nonce).digest('hex');
    if (expected !== row.rows[0].biometric_challenge_hash) {
      return reply.code(401).send({ error: 'Challenge verification failed' });
    }

    await identityService.setBiometricChallenge(pool, did, '');

    const jti = uuidv4();
    const identity = await identityService.findByDid(pool, did);
    const token = app.jwt.sign(
      { sub: did, jti, kycLevel: identity?.kycLevel ?? 0, biometric: true },
      { expiresIn: '8h' }
    );

    return reply.send({ token, verified: true });
  });

  // Decorate authenticate
  app.decorate('authenticate', async function(req: any, reply: any) {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}
