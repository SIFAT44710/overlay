import { NextResponse } from 'next/server';
import { getGoogleClients, getDriveLogos, getSheetsCacheStats } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { sheets, sheetId } = getGoogleClients();

    // Fetch spreadsheet metadata to verify connection and list tabs
    const sheetMeta = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties.title',
    });

    const tabsFound = (sheetMeta.data.sheets || [])
      .map((s: any) => s.properties?.title || '')
      .filter(Boolean);

    // Fetch drive logos (uses 10-min cache)
    const logos = await getDriveLogos();

    // Cache stats
    const cacheStats = getSheetsCacheStats();

    return NextResponse.json({
      ok: true,
      sheetConnected: true,
      sheetId,
      tabsFound,
      driveLogosCount: logos.length,
      cacheAgeMs: cacheStats.oldestCacheAgeMs,
      cacheStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[HealthCheck] Error checking Google APIs:', error);
    return NextResponse.json(
      {
        ok: false,
        sheetConnected: false,
        tabsFound: [],
        driveLogosCount: 0,
        cacheAgeMs: -1,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
