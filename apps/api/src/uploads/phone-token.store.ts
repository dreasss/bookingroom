import { createHash, randomBytes } from 'crypto';

type TokenRecord = { hash: string; uploadId: string; expiresAt: number; used: boolean };

const store = new Map<string, TokenRecord>();

export function issuePhoneToken(uploadId: string, ttlMinutes = 20) {
  const token = randomBytes(24).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  store.set(hash, { hash, uploadId, expiresAt: Date.now() + ttlMinutes * 60_000, used: false });
  return { token, expiresAt: new Date(Date.now() + ttlMinutes * 60_000).toISOString() };
}

export function validatePhoneToken(token: string) {
  const hash = createHash('sha256').update(token).digest('hex');
  const record = store.get(hash);
  if (!record) return { valid: false, reason: 'not_found' };
  if (record.used) return { valid: false, reason: 'already_used' };
  if (record.expiresAt < Date.now()) return { valid: false, reason: 'expired' };
  return { valid: true, uploadId: record.uploadId };
}

export function usePhoneToken(token: string) {
  const hash = createHash('sha256').update(token).digest('hex');
  const record = store.get(hash);
  if (!record) return false;
  record.used = true;
  return true;
}
