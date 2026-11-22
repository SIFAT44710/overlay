import { NextRequest, NextResponse } from 'next/server';
import { isRequestAuthenticated } from '@/lib/authSession';
import { flushDriveCache } from '@/lib/sheetCache';
import { getDriveLogos } from '@/lib/googleClient';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isRequestAuthenticated(req);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    // Flush cache and re-fetch directly from Drive
    flushDriveCache();
    const freshLogos = await getDriveLogos(true);

    return NextResponse.json({
      success: true,
      message: `Successfully flushed logo cache. Found ${freshLogos.length} logo files in Google Drive.`,
      count: freshLogos.length,
      files: freshLogos,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[LogosSync] Error syncing drive logos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
