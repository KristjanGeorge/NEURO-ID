import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface Identity {
  id: string;
  did: string;
  fullName: string;
  email: string;
  selfieUrl: string | null;
  selfieHash: string | null;
  documentType: string;
  documentNumber: string;
  documentHash: string | null;
  countryCode: string;
  kycLevel: number;
  kycContractId: string | null;
  walletAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIdentityInput {
  fullName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  countryCode?: string;
}

export async function createIdentity(pool: Pool, input: CreateIdentityInput): Promise<Identity> {
  const id = uuidv4();
  const did = `did:neuron:cl:${id}`;
  const walletAddress = `ncn:${id.replace(/-/g, '')}`;
  const passwordHash = await bcrypt.hash(input.password, 12);

  const row = await pool.query(
    `INSERT INTO neuro_id.identities
       (id, did, full_name, email, password_hash, document_type, document_number, country_code, wallet_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [id, did, input.fullName, input.email, passwordHash,
     input.documentType, input.documentNumber, input.countryCode ?? 'CL', walletAddress]
  );
  return mapRow(row.rows[0]);
}

export async function findByEmail(pool: Pool, email: string): Promise<(Identity & { passwordHash: string }) | null> {
  const row = await pool.query(
    'SELECT * FROM neuro_id.identities WHERE email = $1', [email]
  );
  if (!row.rows[0]) return null;
  return { ...mapRow(row.rows[0]), passwordHash: row.rows[0].password_hash };
}

export async function findByDid(pool: Pool, did: string): Promise<Identity | null> {
  const row = await pool.query(
    'SELECT * FROM neuro_id.identities WHERE did = $1', [did]
  );
  if (!row.rows[0]) return null;
  return mapRow(row.rows[0]);
}

export async function updateKycLevel(pool: Pool, did: string, kycLevel: number, kycContractId: string): Promise<Identity> {
  const row = await pool.query(
    `UPDATE neuro_id.identities
     SET kyc_level = $1, kyc_contract_id = $2, status = 'ACTIVE', updated_at = NOW()
     WHERE did = $3 RETURNING *`,
    [kycLevel, kycContractId, did]
  );
  return mapRow(row.rows[0]);
}

export async function updateSelfie(pool: Pool, did: string, selfieUrl: string, selfieHash: string): Promise<Identity> {
  const row = await pool.query(
    `UPDATE neuro_id.identities SET selfie_url = $1, selfie_hash = $2, updated_at = NOW()
     WHERE did = $3 RETURNING *`,
    [selfieUrl, selfieHash, did]
  );
  return mapRow(row.rows[0]);
}

export async function setBiometricChallenge(pool: Pool, did: string, hash: string): Promise<void> {
  await pool.query(
    'UPDATE neuro_id.identities SET biometric_challenge_hash = $1 WHERE did = $2',
    [hash, did]
  );
}

function mapRow(r: Record<string, unknown>): Identity {
  return {
    id: r.id as string,
    did: r.did as string,
    fullName: r.full_name as string,
    email: r.email as string,
    selfieUrl: r.selfie_url as string | null,
    selfieHash: r.selfie_hash as string | null,
    documentType: r.document_type as string,
    documentNumber: r.document_number as string,
    documentHash: r.document_hash as string | null,
    countryCode: r.country_code as string,
    kycLevel: r.kyc_level as number,
    kycContractId: r.kyc_contract_id as string | null,
    walletAddress: r.wallet_address as string,
    status: r.status as string,
    createdAt: (r.created_at as Date).toISOString(),
    updatedAt: (r.updated_at as Date).toISOString(),
  };
}
