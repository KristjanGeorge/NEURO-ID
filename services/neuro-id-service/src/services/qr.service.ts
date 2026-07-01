import QRCode from 'qrcode';
import { createHash } from 'crypto';

export type QRType = 'PAYMENT' | 'AUTH' | 'TRANSFER' | 'DOC_INTEROP';

export interface QRPayload {
  v: 1;
  type: QRType;
  did: string;
  walletAddress: string;
  amount?: string;
  ref?: string;
  ts: number;
  sig: string;
}

export function buildQRPayload(
  type: QRType,
  did: string,
  walletAddress: string,
  opts: { amount?: string; ref?: string } = {}
): QRPayload {
  const ts = Math.floor(Date.now() / 1000);
  const raw = `${type}:${did}:${walletAddress}:${opts.amount ?? ''}:${opts.ref ?? ''}:${ts}`;
  const sig = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  return { v: 1, type, did, walletAddress, amount: opts.amount, ref: opts.ref, ts, sig };
}

export async function generateQRPng(payload: QRPayload): Promise<Buffer> {
  const data = JSON.stringify(payload);
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#0A1628', light: '#FFFFFF' },
  });
}

export async function generateQRDataUrl(payload: QRPayload): Promise<string> {
  const data = JSON.stringify(payload);
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: { dark: '#0A1628', light: '#FFFFFF' },
  });
}
