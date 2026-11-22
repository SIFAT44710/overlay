import { NextResponse } from 'next/server';
import { getGoogleClients, getActiveConfig } from '@/lib/googleClient';
import { getDriveLogos } from '@/lib/googleClient';
import { getCacheStats } from '@/lib/sheetCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { sheets } = getGoogleClients();
    const config = await getActiveConfig();

    // Fetch spreadsheet metadata to verify connection and list tabs
    const sheetMeta = await sheets.spreadsheets.get({
      spreadsheetId: config.sheetId,
      fields: 'sheets.properties.title',
    });

    const tabsFound = (sheetMeta.data.sheets || [])
      .map((s: any) => s.properties?.title || '')
      .filter(Boolean);

    // Fetch drive logos (cached 10 min)
    const logos = await getDriveLogos();

    // Cache stats
    const cacheStats = getCacheStats();

    return NextResponse.json({
      ok: true,
      sheetConnected: true,
      activeSheetId: config.sheetId,
      activeDriveFolderId: config.driveFolderId || '(none)',
      tabsFound,
      driveLogosCount: logos.length,
      cacheAgeMs: cacheStats.oldestSheetCacheAgeMs,
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
