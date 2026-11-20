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
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Parallel fetch from all relevant sheets
    const [sheetResponse, driveResponse, playerRes, gameRes, roleRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Vmix!E2:J14',
      }),
      process.env.GOOGLE_DRIVE_FOLDER_ID
        ? drive.files
            .list({
              q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
              fields: 'files(id, name)',
            })
            .catch(() => ({ data: { files: [] } }))
        : Promise.resolve({ data: { files: [] } }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PlayerData!A2:K10',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'GameStanding!A1:J80',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PlayerRoleStats!A1:K120',
      }).catch(() => ({ data: { values: [] } })),
    ]);

    const driveFiles = driveResponse.data?.files || [];
    const rows = sheetResponse.data?.values || [];
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    const demoFile = driveFiles.find((file: any) => file.name && normalize(file.name) === 'demopng');
    const demoLogoUrl = demoFile
      ? `https://drive.google.com/thumbnail?id=${demoFile.id}&sz=w150`
      : null;

    let data: any[] = [];
    if (rows.length > 0) {
      const headers = rows[0];
      data = rows.slice(1).map((row: any[]) => {
        const rowData: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          if (header) rowData[header] = row[index];
        });

        const teamName = rowData['TeamName'] || '';
        const normalizedTeamName = normalize(teamName);
        let matchedLogoUrl = null;

        for (const file of driveFiles) {
          if (file.name) {
            const fileNameWithoutExt = normalize(file.name.replace(/\.[^/.]+$/, ''));
            if (
              fileNameWithoutExt.includes(normalizedTeamName) ||
              normalizedTeamName.includes(fileNameWithoutExt)
            ) {
              matchedLogoUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w150`;
              break;
            }
          }
        }

        if (!matchedLogoUrl && teamName) {
          matchedLogoUrl =
            demoLogoUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              teamName
            )}&background=random&color=fff&size=128&bold=true`;
        }

        rowData['LogoUrl'] = matchedLogoUrl;
        return rowData;
      });
    }

    // 1. DUEL 1v1 & MVP from PlayerData
    const pRows = playerRes.data?.values || [];
    const p1Row = pRows.length > 1 ? pRows[1] : (pRows[0] || []);
    const p2Row = pRows.length > 2 ? pRows[2] : (pRows[1] || []);
    const duel1v1 = {
      p1: {
        name: p1Row[2] || 'TOP.1SHOVO',
        team: p1Row[0] || 'RAAD VAI YT',
        kills: parseInt(p1Row[3], 10) || 29,
        damage: parseInt(p1Row[4], 10) || 11859,
        hs: parseInt(p1Row[8], 10) || 31,
        assist: parseInt(p1Row[5], 10) || 22,
      },
      p2: {
        name: p2Row[2] || 'EXE.SEJAN',
        team: p2Row[0] || 'EXTREME EX',
        kills: parseInt(p2Row[3], 10) || 27,
        damage: parseInt(p2Row[4], 10) || 11890,
        hs: parseInt(p2Row[8], 10) || 22,
        assist: parseInt(p2Row[5], 10) || 13,
      },
    };

    const mvp = {
      name: p1Row[2] || 'TOP.1SHOVO',
      team: p1Row[0] || 'TOP',
      kills: parseInt(p1Row[3], 10) || 29,
      damage: parseInt(p1Row[4], 10) || 11859,
      assist: parseInt(p1Row[5], 10) || 22,
      hs: parseInt(p1Row[8], 10) || 31,
      knocks: Math.round((parseInt(p1Row[3], 10) || 29) * 1.2),
      onTarget: parseFloat(p1Row[6]?.replace('%', '')) || 42.4,
      dist: parseInt(p1Row[7], 10) || 10367,
    };

    // 2. MATCH PROGRESSION & TOTALS from GameStanding
    const gRows = gameRes.data?.values || [];
    const matches: Record<number, any[]> = {};
    let currentMatch = 0;
    for (const r of gRows) {
      if (r && r[0] && r[0].includes('MATCH #')) {
        const mMatch = r[0].match(/MATCH #(\d+)/);
        if (mMatch) currentMatch = parseInt(mMatch[1], 10);
      } else if (r && r[1] && r[5] && !isNaN(parseInt(r[5], 10))) {
        if (!matches[currentMatch]) matches[currentMatch] = [];
        const team = r[1].trim();
        const tag = r[2] ? r[2].trim() : team.slice(0, 3).toUpperCase();
        const pts = parseInt(r[5], 10) || 0;
        const kills = parseInt(r[6], 10) || 0;
        const damage = parseInt(r[8], 10) || 0;
        matches[currentMatch].push({ team, tag, pts, kills, damage });
      }
    }

    const teamCumulative: Record<string, { tag: string; name: string; color: string; pts: number[] }> = {};
    const defaultProgColors = ['#fbbf24', '#a78bfa', '#2dd4bf', '#f43f5e', '#38bdf8'];
    const matchTotals = {
      kills: [114, 102, 97, 129, 114],
      damage: [74334, 67724, 60618, 75983, 71677],
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
      if (mKills > 0) matchTotals.kills[m - 1] = mKills;
      if (mDamage > 0) matchTotals.damage[m - 1] = mDamage;
    }

    const matchProgression = Object.values(teamCumulative)
      .sort((a, b) => (b.pts[4] || 0) - (a.pts[4] || 0))
      .slice(0, 5)
      .map((t, idx) => ({
        ...t,
        color: defaultProgColors[idx] || '#fbbf24',
      }));

    // 3. ROLES from PlayerRoleStats
    const roleRows = roleRes.data?.values || [];
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
        players: 6,
        kills: 70,
        damage: 39268,
        top: 'CME.YAKUZA (19K)',
        maxK: 19,
        color: '#FACC15',
        bgTint: 'rgba(250, 204, 21, 0.16)',
        borderTint: 'rgba(250, 204, 21, 0.65)',
      },
    };

    let currentRole: string | null = null;
    for (const r of roleRows) {
      if (!r || !r[0]) continue;
      const txt = r[0].toUpperCase();
      if (txt.includes('SNIPER')) { currentRole = 'SNIPER'; continue; }
      if (txt.includes('RUSHER')) { currentRole = 'RUSHER'; continue; }
      if (txt.includes('SUPPORT')) { currentRole = 'SUPPORT'; continue; }
      if (txt.includes('BOMBER')) { currentRole = 'BOMBER'; continue; }

      if (currentRole && r[2] && r[3] && !isNaN(parseInt(r[3], 10))) {
        const pName = r[2].trim();
        const k = parseInt(r[3], 10) || 0;
        const d = parseInt(r[4], 10) || 0;
        const target = rolesMap[currentRole];
        target.players += 1;
        target.kills += k;
        target.damage += d;
        if (k > target.maxK) {
          target.maxK = k;
          target.top = `${pName} (${k}K)`;
        }
      }
    }

    if (rolesMap.RUSHER.players === 0) {
      rolesMap.RUSHER = { role: 'RUSHER', tag: 'ASSAULT FRONTLINE', players: 26, kills: 269, damage: 156973, top: 'TOP.1SHOVO (29K)', color: '#EF4444', bgTint: 'rgba(239, 68, 68, 0.16)', borderTint: 'rgba(239, 68, 68, 0.65)' };
    }
    if (rolesMap.SUPPORT.players === 0) {
      rolesMap.SUPPORT = { role: 'SUPPORT', tag: 'TACTICAL MEDIC', players: 13, kills: 134, damage: 80695, top: 'S9X.JACK007 (21K)', color: '#22C55E', bgTint: 'rgba(34, 197, 94, 0.16)', borderTint: 'rgba(34, 197, 94, 0.65)' };
    }
    if (rolesMap.SNIPER.players === 0) {
      rolesMap.SNIPER = { role: 'SNIPER', tag: 'LONG-RANGE MARKSMAN', players: 8, kills: 83, damage: 73400, top: 'S9X.KARAKEN (17K)', color: '#A855F7', bgTint: 'rgba(168, 85, 247, 0.16)', borderTint: 'rgba(168, 85, 247, 0.65)' };
    }

    const rolesList = [rolesMap.RUSHER, rolesMap.SUPPORT, rolesMap.SNIPER, rolesMap.BOMBER];

    const rolesPolar = [
      {
        role: 'Rusher',
        color: '#EF4444',
        kills: parseFloat((rolesMap.RUSHER.kills / Math.max(1, rolesMap.RUSHER.players)).toFixed(1)) || 10.3,
        damage: Math.round(rolesMap.RUSHER.damage / Math.max(1, rolesMap.RUSHER.players)) || 6037,
      },
      {
        role: 'Support',
        color: '#22C55E',
        kills: parseFloat((rolesMap.SUPPORT.kills / Math.max(1, rolesMap.SUPPORT.players)).toFixed(1)) || 10.3,
        damage: Math.round(rolesMap.SUPPORT.damage / Math.max(1, rolesMap.SUPPORT.players)) || 6207,
      },
      {
        role: 'Sniper',
        color: '#A855F7',
        kills: parseFloat((rolesMap.SNIPER.kills / Math.max(1, rolesMap.SNIPER.players)).toFixed(1)) || 10.4,
        damage: Math.round(rolesMap.SNIPER.damage / Math.max(1, rolesMap.SNIPER.players)) || 9175,
      },
      {
        role: 'Bomber',
        color: '#FACC15',
        kills: parseFloat((rolesMap.BOMBER.kills / Math.max(1, rolesMap.BOMBER.players)).toFixed(1)) || 11.7,
        damage: Math.round(rolesMap.BOMBER.damage / Math.max(1, rolesMap.BOMBER.players)) || 6545,
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data,
        duel1v1,
        mvp,
        matchProgression: matchProgression.length >= 3 ? matchProgression : undefined,
        matchTotals,
        roles: rolesList,
        rolesPolar,
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
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
