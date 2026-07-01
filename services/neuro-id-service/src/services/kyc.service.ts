import axios from 'axios';
import { Pool } from 'pg';
import { config } from '../config.js';
import { updateKycLevel } from './identity.service.js';

export interface KycInput {
  subjectDid: string;
  kycLevel: 1 | 2 | 3;
  documentType: string;
  documentHash: string;
  countryCode: string;
  validUntil: string;
}

export interface KycResult {
  contractId: string;
  kycLevel: number;
  status: string;
}

export async function submitKycVerification(pool: Pool, input: KycInput): Promise<KycResult> {
  const res = await axios.post(`${config.smartlabServiceUrl}/v1/compliance/kyc`, {
    subjectDid: input.subjectDid,
    kycLevel: input.kycLevel,
    documentType: input.documentType,
    documentHash: input.documentHash,
    countryCode: input.countryCode,
    validUntil: input.validUntil,
  }, { timeout: 10000 });

  const contractId: string = res.data?.contractId;
  if (!contractId) throw new Error('SmartLab did not return contractId');

  await updateKycLevel(pool, input.subjectDid, input.kycLevel, contractId);

  return { contractId, kycLevel: input.kycLevel, status: 'VERIFIED' };
}

export async function assertKycLevel(did: string, minLevel: number): Promise<void> {
  const res = await axios.post(`${config.smartlabServiceUrl}/v1/compliance/kyc/assert`, {
    subjectDid: did,
    minLevel,
  }, { timeout: 5000 });

  if (res.data?.allowed !== true) {
    const err = new Error(`KYC level ${minLevel} required`);
    (err as NodeJS.ErrnoException).code = 'KYC_INSUFFICIENT';
    throw err;
  }
}
