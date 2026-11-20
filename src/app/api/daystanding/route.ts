import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_TEAM_COLORS: Record<string, string> = {
  TOP: '#F5B700',
  EXE: '#6225A6',
  S9X: '#00DF82',
  CME: '#EC008C',
  TRX: '#38BDF8',
  UEO: '#8B5CF6',
  NK: '#F97316',
  '69': '#E11D48',
  JG: '#14B8A6',
  ITZ: '#64748B',
  EGL: '#475569',
  SG: '#334155',
};

const DEFAULT_DELTAS: Record<string, number> = {
  TOP: +1,
  EXE: +2,
  S9X: -2,
  CME: -1,
  TRX: 0,
  UEO: -1,
  NK: +2,
  '69': -1,
  JG: -1,
  ITZ: 0,
  EGL: 0,
  SG: 0,
};

function formatOrdinalRank(rankNum: number): string {
  const j = rankNum % 10;
  const k = rankNum % 100;
  if (j === 1 && k !== 11) return `${rankNum}ST`;
  if (j === 2 && k !== 12) return `${rankNum}ND`;
  if (j === 3 && k !== 13) return `${rankNum}RD`;
  return `${rankNum}TH`;
}

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // 1. Fetch DayStanding, Vmix DayStanding, and LastMatchStanding in parallel
    const [dayResponse, vmixDayResponse, lastMatchResponse, driveResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'DayStanding!A2:J15',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Vmix!A56:J68',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'LastMatchStanding!A2:J15',
      }).catch(() => ({ data: { values: [] } })),
      process.env.GOOGLE_DRIVE_FOLDER_ID
        ? drive.files
            .list({
              q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
              fields: 'files(id, name)',
            })
            .catch(() => ({ data: { files: [] } }))
        : Promise.resolve({ data: { files: [] } }),
    ]);

    const driveFiles = driveResponse.data.files || [];
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Map last match ranks for delta computation
    const lastMatchRanks: Record<string, number> = {};
    const lastRows = (lastMatchResponse as any)?.data?.values || [];
    if (lastRows.length > 1) {
      for (let i = 1; i < lastRows.length; i++) {
        const row = lastRows[i];
        const rank = parseInt(row[0], 10);
        const name = normalize(row[1] || row[2] || '');
        if (name && !isNaN(rank)) {
          lastMatchRanks[name] = rank;
        }
      }
    }

    const dayRows = dayResponse.data?.values || [];
    const vmixRows = (vmixDayResponse as any)?.data?.values || [];

    // If DayStanding tab has data, use it; otherwise parse Vmix!A56:J68
    let data: any[] = [];

    if (dayRows.length >= 2) {
      data = dayRows.slice(1).map((row, idx) => {
        const rawRank = parseInt(row[0], 10) || idx + 1;
        const teamName = (row[1] || '').trim();
        const tagName = (row[2] || teamName.slice(0, 3)).trim();
        const survPts = parseInt(row[3], 10) || 0;
        const killPts = parseInt(row[4], 10) || 0;
        const totalPts = parseInt(row[5], 10) || survPts + killPts;
        const elims = parseInt(row[6], 10) || killPts;
        const booyah = parseInt(row[7], 10) || 0;
        const damage = parseInt(row[8], 10) || 0;

        const normName = normalize(teamName);
        const normTag = normalize(tagName);

        let delta = 0;
        const upperTag = tagName.toUpperCase();
        if (lastMatchRanks[normName] !== undefined) {
          delta = lastMatchRanks[normName] - rawRank;
        } else if (DEFAULT_DELTAS[upperTag] !== undefined) {
          delta = DEFAULT_DELTAS[upperTag];
        }

        let logoUrl: string | null = null;
        for (const file of driveFiles) {
          if (file.name) {
            const fn = normalize(file.name.replace(/\.[^/.]+$/, ''));
            if (fn.includes(normName) || normName.includes(fn) || fn.includes(normTag)) {
              logoUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w150`;
              break;
            }
          }
        }

        const teamColor =
          DEFAULT_TEAM_COLORS[upperTag] ||
          (idx === 0 ? '#F5B700' : idx % 2 === 0 ? '#111827' : '#6225A6');

        return {
          rank: formatOrdinalRank(rawRank),
          rankNum: rawRank,
          delta,
          tag: tagName.toUpperCase(),
          name: teamName,
          booyah,
          elims,
          place: survPts,
          total: totalPts,
          damage,
          logoUrl,
          col: teamColor,
        };
      });
    } else if (vmixRows.length > 0) {
      data = vmixRows.filter((r: any) => r[4] && r[4].trim() !== '').map((row: any, idx: number) => {
        const rawRank = parseInt(row[2], 10) || idx + 1;
        const teamName = (row[4] || '').trim();
        const tagName = (row[3] || teamName.slice(0, 3)).trim();
        const survPts = parseInt(row[5], 10) || 0;
        const killPts = parseInt(row[6], 10) || 0;
        const totalPts = parseInt(row[7], 10) || survPts + killPts;
        const booyah = parseInt(row[8], 10) || 0;
        const damage = parseInt(row[9], 10) || 0;

        const normName = normalize(teamName);
        const normTag = normalize(tagName);

        let logoUrl: string | null = null;
        for (const file of driveFiles) {
          if (file.name) {
            const fn = normalize(file.name.replace(/\.[^/.]+$/, ''));
            if (fn.includes(normName) || normName.includes(fn) || fn.includes(normTag)) {
              logoUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w150`;
              break;
            }
          }
        }

        const upperTag = tagName.toUpperCase();
        const teamColor =
          DEFAULT_TEAM_COLORS[upperTag] ||
          (idx === 0 ? '#F5B700' : idx % 2 === 0 ? '#111827' : '#6225A6');

        return {
          rank: formatOrdinalRank(rawRank),
          rankNum: rawRank,
          delta: 0,
          tag: upperTag,
          name: teamName,
          booyah,
          elims: killPts,
          place: survPts,
          total: totalPts,
          damage,
          logoUrl,
          col: teamColor,
        };
      });
    }

    if (!data.length) {
      return NextResponse.json({ success: false, data: [], standing: [] }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: Date.now(),
        data,
        standing: data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error in /api/daystanding:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daystanding' },
      { status: 500 }
    );
  }
}
