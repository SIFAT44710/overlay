import { NextRequest, NextResponse } from 'next/server';
import {
  getBatchSheetRanges,
  getDriveLogos,
  resolveTeamLogo,
  safeInt,
  safeFloat,
  safeString,
} from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';

    // 1. Single batchGet call for all ranges needed by /api/sheet
    const ranges = [
      'Vmix!E2:J14',
      'PlayerData!A2:K10',
      'GameStanding!A1:J80',
      'PlayerRoleStats!A1:K120',
    ];

    const [batch, driveFiles] = await Promise.all([
      getBatchSheetRanges(ranges, fresh),
      getDriveLogos(fresh),
    ]);

    // 2. Parse Team Standings from Vmix!E2:J14
    const vmixRows = batch['Vmix!E2:J14'] || [];
    let data: any[] = [];

    if (vmixRows.length > 1) {
      const headers = vmixRows[0].map((h: any) => safeString(h));
      data = vmixRows.slice(1).map((row: any[]) => {
        const rowData: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          if (header) rowData[header] = safeString(row[index]);
        });

        const teamName = rowData['TeamName'] || '';
        const tag = rowData['Code'] || rowData['Tag'] || teamName.slice(0, 3).toUpperCase();
        rowData['LogoUrl'] = resolveTeamLogo(teamName, tag, driveFiles);
        return rowData;
      });
    }

    // 3. DUEL 1v1 & MVP from PlayerData!A2:K10 (Row 0 is headers, Row 1 is Top 1, Row 2 is Top 2)
    const pRows = batch['PlayerData!A2:K10'] || [];
    const p1Row = pRows.length > 1 ? pRows[1] : [];
    const p2Row = pRows.length > 2 ? pRows[2] : [];

    const duel1v1 = {
      p1: {
        name: safeString(p1Row[2], 'PLAYER 1'),
        team: safeString(p1Row[0], 'TEAM 1'),
        kills: safeInt(p1Row[3], 0),
        damage: safeInt(p1Row[4], 0),
        hs: safeInt(p1Row[8], 0),
        assist: safeInt(p1Row[5], 0),
      },
      p2: {
        name: safeString(p2Row[2], 'PLAYER 2'),
        team: safeString(p2Row[0], 'TEAM 2'),
        kills: safeInt(p2Row[3], 0),
        damage: safeInt(p2Row[4], 0),
        hs: safeInt(p2Row[8], 0),
        assist: safeInt(p2Row[5], 0),
      },
    };

    const mvp = {
      name: safeString(p1Row[2], 'TOP PLAYER'),
      team: safeString(p1Row[0], 'TEAM'),
      kills: safeInt(p1Row[3], 0),
      damage: safeInt(p1Row[4], 0),
      assist: safeInt(p1Row[5], 0),
      hs: safeInt(p1Row[8], 0),
      knocks: Math.round(safeInt(p1Row[3], 0) * 1.2),
      onTarget: safeFloat(p1Row[6], 0),
      dist: safeInt(p1Row[7], 0),
    };

    // 4. MATCH PROGRESSION & TOTALS from GameStanding!A1:J80
    const gRows = batch['GameStanding!A1:J80'] || [];
    const matches: Record<number, any[]> = {};
    let currentMatch = 0;

    for (const r of gRows) {
      const col0 = safeString(r[0]);
      if (col0.includes('MATCH #')) {
        const mMatch = col0.match(/MATCH #(\d+)/);
        if (mMatch) currentMatch = safeInt(mMatch[1]);
      } else if (r && r[1] && r[5] && !isNaN(parseInt(String(r[5]), 10))) {
        if (!matches[currentMatch]) matches[currentMatch] = [];
        const team = safeString(r[1]);
        const tag = safeString(r[2]) || team.slice(0, 3).toUpperCase();
        const pts = safeInt(r[5]);
        const kills = safeInt(r[6]);
        const damage = safeInt(r[8]);
        matches[currentMatch].push({ team, tag, pts, kills, damage });
      }
    }

    const teamCumulative: Record<string, { tag: string; name: string; color: string; pts: number[] }> = {};
    const defaultProgColors = ['#fbbf24', '#a78bfa', '#2dd4bf', '#f43f5e', '#38bdf8'];
    const matchTotals = {
      kills: [0, 0, 0, 0, 0],
      damage: [0, 0, 0, 0, 0],
    };

    for (let m = 1; m <= 5; m++) {
      const mList = matches[m] || [];
      let mKills = 0;
      let mDamage = 0;
      mList.forEach((t) => {
        mKills += t.kills;
        mDamage += t.damage;
        if (!teamCumulative[t.tag]) {
          teamCumulative[t.tag] = {
            tag: t.tag,
            name: t.team,
            color: '#fbbf24',
            pts: [0, 0, 0, 0, 0],
          };
        }
        const prev = m > 1 ? teamCumulative[t.tag].pts[m - 2] : 0;
        teamCumulative[t.tag].pts[m - 1] = prev + t.pts;
      });
      matchTotals.kills[m - 1] = mKills;
      matchTotals.damage[m - 1] = mDamage;
    }

    const matchProgression = Object.values(teamCumulative)
      .sort((a, b) => (b.pts[4] || 0) - (a.pts[4] || 0))
      .slice(0, 5)
      .map((t, idx) => ({
        ...t,
        color: defaultProgColors[idx] || '#fbbf24',
      }));

    // 5. ROLES from PlayerRoleStats!A1:K120 (Bugfix: initialize BOMBER with 0, no hardcoded stats!)
    const roleRows = batch['PlayerRoleStats!A1:K120'] || [];
    const rolesMap: Record<string, any> = {
      RUSHER: {
        role: 'RUSHER',
        tag: 'ASSAULT FRONTLINE',
        players: 0,
        kills: 0,
        damage: 0,
        top: '',
        maxK: 0,
        color: '#EF4444',
        bgTint: 'rgba(239, 68, 68, 0.16)',
        borderTint: 'rgba(239, 68, 68, 0.65)',
      },
      SUPPORT: {
        role: 'SUPPORT',
        tag: 'TACTICAL MEDIC',
        players: 0,
        kills: 0,
        damage: 0,
        top: '',
        maxK: 0,
        color: '#22C55E',
        bgTint: 'rgba(34, 197, 94, 0.16)',
        borderTint: 'rgba(34, 197, 94, 0.65)',
      },
      SNIPER: {
        role: 'SNIPER',
        tag: 'LONG-RANGE MARKSMAN',
        players: 0,
        kills: 0,
        damage: 0,
        top: '',
        maxK: 0,
        color: '#A855F7',
        bgTint: 'rgba(168, 85, 247, 0.16)',
        borderTint: 'rgba(168, 85, 247, 0.65)',
      },
      BOMBER: {
        role: 'BOMBER',
        tag: 'GRENADIER BLAST',
        players: 0,
        kills: 0,
        damage: 0,
        top: '',
        maxK: 0,
        color: '#FACC15',
        bgTint: 'rgba(250, 204, 21, 0.16)',
        borderTint: 'rgba(250, 204, 21, 0.65)',
      },
    };

    let currentRole: string | null = null;
    for (const r of roleRows) {
      if (!r || !r[0]) continue;
      const txt = safeString(r[0]).toUpperCase();
      if (txt.includes('SNIPER')) { currentRole = 'SNIPER'; continue; }
      if (txt.includes('RUSHER')) { currentRole = 'RUSHER'; continue; }
      if (txt.includes('SUPPORT')) { currentRole = 'SUPPORT'; continue; }
      if (txt.includes('BOMBER')) { currentRole = 'BOMBER'; continue; }

      if (currentRole && r[2] && r[3] && !isNaN(parseInt(String(r[3]), 10))) {
        const pName = safeString(r[2]);
        const k = safeInt(r[3]);
        const d = safeInt(r[4]);
        const target = rolesMap[currentRole];
        if (target) {
          target.players += 1;
          target.kills += k;
          target.damage += d;
          if (k > target.maxK) {
            target.maxK = k;
            target.top = `${pName} (${k}K)`;
          }
        }
      }
    }

    const rolesList = [rolesMap.RUSHER, rolesMap.SUPPORT, rolesMap.SNIPER, rolesMap.BOMBER];

    const rolesPolar = [
      {
        role: 'Rusher',
        color: '#EF4444',
        kills: rolesMap.RUSHER.players > 0 ? parseFloat((rolesMap.RUSHER.kills / rolesMap.RUSHER.players).toFixed(1)) : 0,
        damage: rolesMap.RUSHER.players > 0 ? Math.round(rolesMap.RUSHER.damage / rolesMap.RUSHER.players) : 0,
      },
      {
        role: 'Support',
        color: '#22C55E',
        kills: rolesMap.SUPPORT.players > 0 ? parseFloat((rolesMap.SUPPORT.kills / rolesMap.SUPPORT.players).toFixed(1)) : 0,
        damage: rolesMap.SUPPORT.players > 0 ? Math.round(rolesMap.SUPPORT.damage / rolesMap.SUPPORT.players) : 0,
      },
      {
        role: 'Sniper',
        color: '#A855F7',
        kills: rolesMap.SNIPER.players > 0 ? parseFloat((rolesMap.SNIPER.kills / rolesMap.SNIPER.players).toFixed(1)) : 0,
        damage: rolesMap.SNIPER.players > 0 ? Math.round(rolesMap.SNIPER.damage / rolesMap.SNIPER.players) : 0,
      },
      {
        role: 'Bomber',
        color: '#FACC15',
        kills: rolesMap.BOMBER.players > 0 ? parseFloat((rolesMap.BOMBER.kills / rolesMap.BOMBER.players).toFixed(1)) : 0,
        damage: rolesMap.BOMBER.players > 0 ? Math.round(rolesMap.BOMBER.damage / rolesMap.BOMBER.players) : 0,
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data,
        duel1v1,
        mvp,
        matchProgression: matchProgression.length >= 2 ? matchProgression : [],
        matchTotals,
        roles: rolesList,
        rolesPolar,
        meta: {
          isLive: true,
          sourceTab: 'GoogleSheets batchGet',
          cached: !fresh,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data from Google Sheets',
        meta: { isLive: false, error: String(error) },
      },
      { status: 500 }
    );
  }
}
