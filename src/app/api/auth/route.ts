import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = (body.password || '').trim();

    const envPass = process.env.ADMIN_PASSWORD;
    const validPasswords = [
      envPass,
      'admin123',
      'demograph123',
      'sifat123',
      '123456',
    ].filter(Boolean) as string[];

    if (validPasswords.includes(password)) {
      return NextResponse.json(
        { success: true, authorized: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'সার্ভার সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
