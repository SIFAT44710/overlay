import { NextRequest, NextResponse } from 'next/server';
import {
  getBatchSheetRanges,
  safeInt,
  safeString,
} from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';

    // 1. Single batchGet call for Vmix weapons and Weapons tab
    const ranges = ['Vmix!A93:F97', 'Weapons!A3:F100'];
    const batch = await getBatchSheetRanges(ranges, fresh);

    const vmixRows = batch['Vmix!A93:F97'] || [];
    const defaultColors = ['#6225A6', '#EC008C', '#F5B700', '#00DF82', '#111827'];

    let weapons: any[] = [];
    let sourceTab = 'Vmix!A93:F97';

    if (vmixRows.length > 0 && safeString(vmixRows[0][0]) !== '') {
      weapons = vmixRows.map((r: any[], idx: number) => ({
        name: safeString(r[0], `WEAPON ${idx + 1}`).toUpperCase(),
        kills: safeInt(r[1]),
        damage: safeInt(r[2]),
        hs: safeInt(r[4]),
        color: defaultColors[idx] || '#6225A6',
      }));
    } else {
      sourceTab = 'Weapons!A3:F100';
      const tabRows = batch['Weapons!A3:F100'] || [];
      const agg: Record<string, { kills: number; damage: number }> = {};

      tabRows.forEach((row: any[]) => {
        const weapon = safeString(row[3]).toUpperCase();
        if (weapon) {
          if (!agg[weapon]) agg[weapon] = { kills: 0, damage: 0 };
          agg[weapon].kills += safeInt(row[4]);
          agg[weapon].damage += safeInt(row[5]);
        }
      });

      weapons = Object.entries(agg)
        .map(([name, stats], idx) => ({
          name,
          kills: stats.kills,
          damage: stats.damage,
          hs: Math.round(stats.kills * 0.45),
          color: defaultColors[idx] || '#6225A6',
        }))
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 5);
    }

    return NextResponse.json(
      {
        success: true,
        weapons,
        meta: {
          isLive: weapons.length > 0,
          sourceTab,
          count: weapons.length,
          cached: !fresh,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/weapons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weapons', weapons: [] },
      { status: 500 }
    );
  }
}
