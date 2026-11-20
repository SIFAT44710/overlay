import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch Top 5 weapons from Vmix!A93:F97 and Weapons tab in parallel
    const [vmixRes, weaponsTabRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Vmix!A93:F97',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Weapons!A3:F100',
      }).catch(() => ({ data: { values: [] } })),
    ]);

    const vmixRows = vmixRes.data.values || [];
    const defaultColors = ['#6225A6', '#EC008C', '#F5B700', '#00DF82', '#111827'];

    let weapons: any[] = [];

    if (vmixRows.length > 0 && vmixRows[0][0]) {
      weapons = vmixRows.map((r: any[], idx: number) => ({
        name: (r[0] || `WEAPON ${idx + 1}`).toUpperCase(),
        kills: parseInt(r[1], 10) || 0,
        damage: parseInt(r[2], 10) || 0,
        hs: parseInt(r[4], 10) || 0,
        color: defaultColors[idx] || '#6225A6',
      }));
    } else {
      const tabRows = weaponsTabRes.data?.values || [];
      const agg: Record<string, { kills: number; damage: number }> = {};
      tabRows.forEach((row: any[]) => {
        const weapon = (row[3] || '').trim().toUpperCase();
        if (weapon) {
          if (!agg[weapon]) agg[weapon] = { kills: 0, damage: 0 };
          agg[weapon].kills += parseInt(row[4], 10) || 0;
          agg[weapon].damage += parseInt(row[5], 10) || 0;
        }
      });
      weapons = Object.entries(agg)
        .map(([name, stats], idx) => ({
          name,
          kills: stats.kills,
          damage: stats.damage,
          hs: Math.round(stats.kills * 0.45),
          color: defaultColors[idx % defaultColors.length],
        }))
        .sort((a, b) => b.kills - a.kills)
        .slice(0, 5);
    }

    return NextResponse.json(
      { success: true, weapons },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching weapons from sheet:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch weapons' }, { status: 500 });
  }
}
