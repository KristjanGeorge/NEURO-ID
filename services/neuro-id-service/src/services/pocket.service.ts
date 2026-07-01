import { Pool } from 'pg';
import { Client as MinioClient } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { config } from '../config.js';
import { buildQRPayload } from './qr.service.js';

const minio = new MinioClient({
  endPoint: config.minioEndpoint,
  port: config.minioPort,
  useSSL: false,
  accessKey: config.minioAccessKey,
  secretKey: config.minioSecretKey,
});

async function ensureBucket(): Promise<void> {
  const exists = await minio.bucketExists(config.minioBucket);
  if (!exists) {
    await minio.makeBucket(config.minioBucket, 'us-east-1');
  }
}

export interface PocketDocument {
  id: string;
  identityId: string;
  type: string;
  title: string;
  storageKey: string;
  contentHash: string;
  qrPayload: string;
  metadata: Record<string, unknown>;
  issuedBy: string | null;
  validFrom: string | null;
  expiresAt: string | null;
  createdAt: string;
  downloadUrl?: string;
}

export interface UploadDocumentInput {
  identityId: string;
  did: string;
  walletAddress: string;
  type: string;
  title: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  issuedBy?: string;
  validFrom?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export async function uploadDocument(pool: Pool, input: UploadDocumentInput): Promise<PocketDocument> {
  await ensureBucket();

  const docId = uuidv4();
  const storageKey = `pocket/${input.identityId}/${docId}/${input.filename}`;
  const contentHash = createHash('sha256').update(input.buffer).digest('hex');

  const interopUrl = `https://neuro-id.lynxnode.io/v1/pocket/${input.did}/documents/${docId}/download`;
  const qrPayload = buildQRPayload('DOC_INTEROP', input.did, input.walletAddress, { ref: docId });
  const qrPayloadJson = JSON.stringify({ ...qrPayload, interopUrl });

  await minio.putObject(config.minioBucket, storageKey, input.buffer, input.buffer.length, {
    'Content-Type': input.mimeType,
    'x-amz-meta-did': input.did,
    'x-amz-meta-doc-id': docId,
  });

  const row = await pool.query(
    `INSERT INTO neuro_id.pocket_documents
       (id, identity_id, type, title, storage_key, content_hash, qr_payload, metadata, issued_by, valid_from, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [docId, input.identityId, input.type, input.title, storageKey, contentHash, qrPayloadJson,
     JSON.stringify(input.metadata ?? {}), input.issuedBy ?? null,
     input.validFrom ?? null, input.expiresAt ?? null]
  );

  return mapDocRow(row.rows[0]);
}

export async function listDocuments(pool: Pool, identityId: string): Promise<PocketDocument[]> {
  const rows = await pool.query(
    'SELECT * FROM neuro_id.pocket_documents WHERE identity_id = $1 ORDER BY created_at DESC',
    [identityId]
  );
  return rows.rows.map(mapDocRow);
}

export async function getDocument(pool: Pool, id: string, identityId: string): Promise<PocketDocument | null> {
  const row = await pool.query(
    'SELECT * FROM neuro_id.pocket_documents WHERE id = $1 AND identity_id = $2',
    [id, identityId]
  );
  if (!row.rows[0]) return null;

  const doc = mapDocRow(row.rows[0]);
  try {
    doc.downloadUrl = await minio.presignedGetObject(config.minioBucket, doc.storageKey, 3600);
  } catch {
    doc.downloadUrl = undefined;
  }
  return doc;
}

export async function deleteDocument(pool: Pool, id: string, identityId: string): Promise<void> {
  const row = await pool.query(
    'SELECT storage_key FROM neuro_id.pocket_documents WHERE id = $1 AND identity_id = $2',
    [id, identityId]
  );
  if (!row.rows[0]) return;

  await minio.removeObject(config.minioBucket, row.rows[0].storage_key).catch(() => {});
  await pool.query('DELETE FROM neuro_id.pocket_documents WHERE id = $1', [id]);
}

function mapDocRow(r: Record<string, unknown>): PocketDocument {
  return {
    id: r.id as string,
    identityId: r.identity_id as string,
    type: r.type as string,
    title: r.title as string,
    storageKey: r.storage_key as string,
    contentHash: r.content_hash as string,
    qrPayload: r.qr_payload as string,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata as Record<string, unknown>) ?? {},
    issuedBy: r.issued_by as string | null,
    validFrom: r.valid_from ? (r.valid_from as Date).toISOString() : null,
    expiresAt: r.expires_at ? (r.expires_at as Date).toISOString() : null,
    createdAt: (r.created_at as Date).toISOString(),
  };
}
