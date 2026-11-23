import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  createSignedSessionToken,
  isRequestAuthenticated,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/auth -> Check session status
export async function GET(req: NextRequest) {
  const authenticated = await isRequestAuthenticated(req);
  return NextResponse.json({ authenticated });
}

// POST /api/auth -> Login with ADMIN_PASSWORD
export async function POST(req: NextRequest) {
  try {
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();

    const body = await req.json().catch(() => ({}));
    const password = (body.password || '').trim();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password !== adminPassword.trim()) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Access denied.' },
        { status: 401 }
      );
    }

    const token = createSignedSessionToken();
    const response = NextResponse.json({
      success: true,
      authorized: true,
      message: 'Authenticated successfully',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server authentication error' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth -> Logout & clear cookie
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
