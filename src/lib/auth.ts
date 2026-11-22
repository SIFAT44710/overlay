import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const AUTH_COOKIE_NAME = 'dg_session';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecretKey(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD or ADMIN_SECRET must be configured in environment');
  }
  return secret;
}

export function createSignedSessionToken(): string {
  const secret = getSecretKey();
  const expiresAt = Date.now() + AUTH_COOKIE_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ auth: true, exp: expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || !token.includes('.')) return false;
  try {
    const secret = getSecretKey();
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    // Constant time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    const jsonStr = Buffer.from(payload, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);
    if (!data.auth || typeof data.exp !== 'number') return false;
    return Date.now() < data.exp;
  } catch {
    return false;
  }
}

export async function isRequestAuthenticated(req?: NextRequest | Request): Promise<boolean> {
  // 1. Try reading from NextRequest cookies
  if (req && 'cookies' in req && typeof req.cookies?.get === 'function') {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (verifySessionToken(token)) return true;
  }

  // 2. Try parsing Cookie header from standard Request
  if (req && 'headers' in req) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    if (match && match[1] && verifySessionToken(match[1])) {
      return true;
    }
  }

  // 3. Fallback to Next.js cookies() helper if available in server context
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}
