import { describe, expect, it } from 'vitest';
import { createSessionToken, parseUserAgent, safeEqual, safeReferrer, verifySessionToken, visitorHash } from '../api/lib/security';

describe('server security helpers', () => {
  it('signs sessions and rejects tampered or wrongly signed tokens', () => {
    const token = createSessionToken('a-secret-used-for-tests');
    expect(verifySessionToken(token, 'a-secret-used-for-tests')).toBe(true);
    expect(verifySessionToken(`${token}tampered`, 'a-secret-used-for-tests')).toBe(false);
    expect(verifySessionToken(token, 'another-secret')).toBe(false);
  });

  it('compares credentials without exposing their length', () => {
    expect(safeEqual('correct password', 'correct password')).toBe(true);
    expect(safeEqual('correct password', 'wrong')).toBe(false);
  });

  it('stores a stable pseudonymous hash rather than the visitor id', () => {
    const hash = visitorHash('random-visitor-id', 'analytics-secret');
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain('random-visitor-id');
  });

  it('reduces user agent and referrer to non-identifying categories', () => {
    expect(parseUserAgent('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1')).toEqual({ browser: 'Safari', os: 'iOS', device: 'Mobile' });
    expect(safeReferrer('https://www.linkedin.com/feed/?tracking=private')).toBe('www.linkedin.com');
    expect(safeReferrer(undefined)).toBe('Direct');
  });
});
