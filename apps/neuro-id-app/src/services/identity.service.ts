import { api } from './api.js';

export async function getIdentity(did: string) {
  const res = await api.get(`/v1/identity/${encodeURIComponent(did)}`);
  return res.data.identity;
}

export async function getQR(did: string, type: 'PAYMENT' | 'AUTH' | 'TRANSFER' = 'AUTH') {
  const res = await api.get(`/v1/identity/${encodeURIComponent(did)}/qr`, { params: { type } });
  return res.data as { qr: string; payload: object };
}

export async function submitKyc(did: string, input: {
  kycLevel: 1 | 2 | 3;
  documentType: string;
  documentHash: string;
  countryCode: string;
  validUntil: string;
}) {
  const res = await api.put(`/v1/identity/${encodeURIComponent(did)}/kyc`, input);
  return res.data.result;
}
