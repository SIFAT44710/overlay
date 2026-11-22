import { NextRequest, NextResponse } from 'next/server';
import {
  getBatchSheetRanges,
  getDriveLogos,
  resolveTeamLogo,
  safeInt,
  safeString,
  normalizeStr,
} from '@/lib/googleSheets';

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

export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';

    // 1. Single batchGet call for DayStanding, Vmix DayStanding, and LastMatchStanding
    const ranges = [
      'DayStanding!A2:J15',
      'Vmix!A56:J68',
      'LastMatchStanding!A2:J15',
    ];

    const [batch, driveFiles] = await Promise.all([
      getBatchSheetRanges(ranges, fresh),
      getDriveLogos(fresh),
    ]);

    const dayRows = batch['DayStanding!A2:J15'] || [];
    const vmixRows = batch['Vmix!A56:J68'] || [];
    const lastRows = batch['LastMatchStanding!A2:J15'] || [];

    // Map last match ranks for delta computation
    const lastMatchRanks: Record<string, number> = {};
    if (lastRows.length > 1) {
      for (let i = 1; i < lastRows.length; i++) {
        const row = lastRows[i];
        const rank = safeInt(row[0]);
        const name = normalizeStr(safeString(row[1]) || safeString(row[2]));
        if (name && rank > 0) {
          lastMatchRanks[name] = rank;
        }
      }
    }

    let data: any[] = [];
    let sourceTab = 'DayStanding!A2:J15';

    if (dayRows.length >= 2) {
      data = dayRows.slice(1).map((row, idx) => {
        const rawRank = safeInt(row[0], idx + 1);
        const teamName = safeString(row[1]);
        const tagName = safeString(row[2]) || teamName.slice(0, 3).toUpperCase();
        const survPts = safeInt(row[3]);
        const killPts = safeInt(row[4]);
        const totalPts = safeInt(row[5], survPts + killPts);
        const elims = safeInt(row[6], killPts);
        const booyah = safeInt(row[7]);
        const damage = safeInt(row[8]);

        const normName = normalizeStr(teamName);
        const upperTag = tagName.toUpperCase();

        let delta = 0;
        if (lastMatchRanks[normName] !== undefined) {
          delta = lastMatchRanks[normName] - rawRank;
        } else if (DEFAULT_DELTAS[upperTag] !== undefined) {
          delta = DEFAULT_DELTAS[upperTag];
        }

        const logoUrl = resolveTeamLogo(teamName, tagName, driveFiles);
        const teamColor =
          DEFAULT_TEAM_COLORS[upperTag] ||
          (idx === 0 ? '#F5B700' : idx % 2 === 0 ? '#111827' : '#6225A6');

        return {
          rank: formatOrdinalRank(rawRank),
          rankNum: rawRank,
          delta,
          tag: upperTag,
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
      sourceTab = 'Vmix!A56:J68';
      data = vmixRows
        .filter((r: any) => safeString(r[4]) !== '')
        .map((row: any, idx: number) => {
          const rawRank = safeInt(row[2], idx + 1);
          const teamName = safeString(row[4]);
          const tagName = safeString(row[3]) || teamName.slice(0, 3).toUpperCase();
          const survPts = safeInt(row[5]);
          const killPts = safeInt(row[6]);
          const totalPts = safeInt(row[7], survPts + killPts);
          const booyah = safeInt(row[8]);
          const damage = safeInt(row[9]);

          const upperTag = tagName.toUpperCase();
          const logoUrl = resolveTeamLogo(teamName, tagName, driveFiles);
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

    return NextResponse.json(
      {
        success: true,
        timestamp: Date.now(),
        data,
        standing: data,
        meta: {
          isLive: data.length > 0,
          sourceTab,
          count: data.length,
          cached: !fresh,
          updatedAt: new Date().toISOString(),
        },
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
      { success: false, error: 'Failed to fetch daystanding', data: [], standing: [] },
      { status: 500 }
    );
  }
}
