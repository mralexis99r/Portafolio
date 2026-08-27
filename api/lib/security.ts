import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';

export const ADMIN_COOKIE = 'qa_admin_session';
export const VISITOR_COOKIE = 'qa_visitor';

export function parseCookies(header?: string) {
  if (!header) return {};
  return Object.fromEntries(header.split(';').map((cookie) => {
    const separator = cookie.indexOf('=');
    const key = cookie.slice(0, separator).trim();
    const value = cookie.slice(separator + 1).trim();
    return [key, decodeURIComponent(value)];
  }).filter(([key]) => key));
}

export function safeEqual(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function createSessionToken(secret: string, maxAgeSeconds = 3600) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + maxAgeSeconds * 1000, nonce: randomBytes(12).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (!safeEqual(signature, expected)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number };
    return typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function visitorHash(visitorId: string, secret: string) {
  return createHmac('sha256', secret).update(visitorId).digest('hex');
}

export function setSecureCookie(response: Response, name: string, value: string, maxAgeSeconds: number, sameSite: 'Strict' | 'Lax') {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSeconds}${secure}`);
}

export function clearCookie(response: Response, name: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.append('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
}

export function clientKey(request: Request) {
  return request.ip || request.socket.remoteAddress || 'unknown';
}

export function createRateLimiter(limit: number, windowMs: number) {
  const clients = new Map<string, { count: number; resetAt: number }>();
  return (key: string) => {
    const now = Date.now();
    const current = clients.get(key);
    if (!current || current.resetAt <= now) {
      clients.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  };
}

export function parseUserAgent(userAgent = '') {
  const browser = /Edg\//.test(userAgent) ? 'Edge' : /OPR\//.test(userAgent) ? 'Opera' : /Chrome\//.test(userAgent) ? 'Chrome' : /Firefox\//.test(userAgent) ? 'Firefox' : /Safari\//.test(userAgent) ? 'Safari' : 'Other';
  const os = /Windows/.test(userAgent) ? 'Windows' : /Android/.test(userAgent) ? 'Android' : /iPhone|iPad/.test(userAgent) ? 'iOS' : /Mac OS/.test(userAgent) ? 'macOS' : /Linux/.test(userAgent) ? 'Linux' : 'Other';
  const device = /iPad|Tablet/.test(userAgent) ? 'Tablet' : /Mobi|Android|iPhone/.test(userAgent) ? 'Mobile' : 'Desktop';
  return { browser, os, device };
}

export function safeReferrer(value: string | undefined) {
  if (!value) return 'Direct';
  try {
    return new URL(value).hostname.slice(0, 120) || 'Direct';
  } catch {
    return 'Unknown';
  }
}
