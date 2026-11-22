// Signed HttpOnly Cookie Session Utilities for Locked Admin Panel (/admin)
// Uses HMAC SHA-256 with timing-safe signature comparison

import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const AUTH_COOKIE_NAME = 'dg_session';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SECRET;
  if (!secret) {
    return 'ff-default-broadcast-suite-secret-key-2026';
  }
  return secret.trim();
}

/**
 * Creates a signed session token: "<timestamp>.<hmacSignature>"
 */
export function createSignedSessionToken(): string {
  const timestamp = Date.now().toString();
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Verifies that the session token is untampered and within maxAge
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (24h)
  const now = Date.now();
  if (now - timestamp > AUTH_COOKIE_MAX_AGE * 1000 || timestamp > now + 60000) {
    return false;
  }

  const secret = getSessionSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(timestampStr)
    .digest('hex');

  try {
    const providedBuf = Buffer.from(providedSig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (providedBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies if the incoming NextRequest has an active, valid signed session cookie
 */
export async function isRequestAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
