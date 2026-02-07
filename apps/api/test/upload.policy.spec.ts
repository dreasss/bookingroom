import { describe, expect, it } from 'vitest';
import { evaluateDeadline, nextVersion } from '../src/uploads/upload.policy';
import { issuePhoneToken, validatePhoneToken, usePhoneToken } from '../src/uploads/phone-token.store';
import { zipBombGuard } from '../src/uploads/zip-guard';

describe('phone token', () => {
  it('is one-time token', () => {
    const issued = issuePhoneToken('u1', 20);
    expect(validatePhoneToken(issued.token).valid).toBe(true);
    usePhoneToken(issued.token);
    expect(validatePhoneToken(issued.token).valid).toBe(false);
  });
});

describe('versioning', () => {
  it('increments version', () => {
    expect(nextVersion([{ versionInt: 1, isCurrent: false }, { versionInt: 3, isCurrent: true }])).toBe(4);
  });
});

describe('deadline policy', () => {
  it('warn mode allows late upload', () => {
    const startedInHour = new Date(Date.now() + 60 * 60 * 1000);
    const res = evaluateDeadline(startedInHour, 2, 'warn');
    expect(res.violation).toBe(true);
    expect(res.accepted).toBe(true);
  });
});

describe('zip bomb guard', () => {
  it('detects high compression ratio', () => {
    const res = zipBombGuard([{ compressedBytes: 1024, uncompressedBytes: 1024 * 1024 * 800, depth: 1 }]);
    expect(res.safe).toBe(false);
    expect(res.reasons.tooCompressed).toBe(true);
  });
});
