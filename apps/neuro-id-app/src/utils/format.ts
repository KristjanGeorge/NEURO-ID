export function formatNcn(micros: string | bigint): string {
  const n = typeof micros === 'bigint' ? micros : BigInt(micros);
  const whole = n / 1_000_000n;
  const frac = n % 1_000_000n;
  const fracStr = frac.toString().padStart(6, '0').slice(0, 2);
  return `${whole.toLocaleString('en-US')}.${fracStr} NCN`;
}

export function formatNcnShort(micros: string | bigint): string {
  const n = typeof micros === 'bigint' ? micros : BigInt(micros);
  const ncn = Number(n) / 1_000_000;
  if (ncn >= 1_000_000) return `${(ncn / 1_000_000).toFixed(2)}M NCN`;
  if (ncn >= 1_000) return `${(ncn / 1_000).toFixed(2)}K NCN`;
  return `${ncn.toFixed(2)} NCN`;
}

export function ncnToUsd(micros: string | bigint, usdRate: number): string {
  const n = typeof micros === 'bigint' ? micros : BigInt(micros);
  const ncn = Number(n) / 1_000_000;
  return `$${(ncn / usdRate).toFixed(2)}`;
}

export function formatDid(did: string): string {
  if (did.length <= 20) return did;
  return `${did.slice(0, 14)}...${did.slice(-8)}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
