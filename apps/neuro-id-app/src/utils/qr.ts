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

export function buildQRString(
  type: QRType,
  did: string,
  walletAddress: string,
  opts: { amount?: string; ref?: string } = {}
): string {
  const ts = Math.floor(Date.now() / 1000);
  const payload: QRPayload = {
    v: 1,
    type,
    did,
    walletAddress,
    amount: opts.amount,
    ref: opts.ref,
    ts,
    sig: `${did.slice(-8)}${ts}`,
  };
  return JSON.stringify(payload);
}

export function parseQRPayload(raw: string): QRPayload | null {
  try {
    const p = JSON.parse(raw) as QRPayload;
    if (p.v !== 1 || !p.type || !p.did) return null;
    return p;
  } catch {
    return null;
  }
}
