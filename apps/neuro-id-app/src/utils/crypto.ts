import * as ExpoCrypto from 'expo-crypto';

export async function sha256(data: string): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    data,
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
  );
}

export async function sha256Buffer(buffer: Uint8Array): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    Buffer.from(buffer).toString('base64'),
    { encoding: ExpoCrypto.CryptoEncoding.HEX }
  );
}
