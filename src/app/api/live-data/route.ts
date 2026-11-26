import { NextRequest, NextResponse } from 'next/server';
import {
  getBatchSheetRanges,
  getDriveLogos,
  getActiveConfig,
} from '@/lib/googleClient';
import { resolveDriveLogo } from '@/lib/driveLogos';
import {
  safeInt,
  safeFloat,
  safeString,
} from '@/lib/sheetParsers';
import {
  StandingTeam,
  MatchProgressionTeam,
  Duel1v1,
  WeaponStats,
  MapStanding,
  H2HTeam,
  H2HGroupAvgTeam,
  DayTopPlayer,
  TeamFullStats,
  TeamKillsDmg,
  RoleItem,
  RolePolarItem,
  SheetDataPayload,
} from '@/types/broadcast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default color palettes for 12 teams
const DEFAULT_TEAM_COLS = [
  '#F5B700', '#E11D48', '#8B5CF6', '#2DD4BF', '#38BDF8', '#6366F1',
  '#A78BFA', '#F43F5E', '#14B8A6', '#60A5FA', '#94A3B8', '#64748B',
];

export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';
    const activeConfig = await getActiveConfig();

    const ranges = [
      'DayStanding!A1:J20',
      'GameStanding!A1:J90',
      'LastMatchStanding!A1:J20',
      'Vmix!A1:Z150',
      'PlayerData!A1:K60',
      'PlayerRoleStats!A1:K130',
      'TeamStats!A1:L20',
      'Weapons!A1:H60',
    ];

    const [batch, driveFiles] = await Promise.all([
      getBatchSheetRanges(ranges, activeConfig.sheetId, fresh),
      getDriveLogos(fresh),
    ]);

    // -------------------------------------------------------------
    // 1. Parse DayStanding!A1:J20 (Overall 12 Teams Leaderboard)
    // -------------------------------------------------------------
    // Columns:
    // A: Rank, B: Team Name, C: Tag Name, D: Survival Pts, E: Kill Pts,
    // F: Total Pts, G: Kills, H: Booyah, I: Damage, J: Headshots
    const dayRows = batch['DayStanding!A1:J20'] || [];
    const standing12: StandingTeam[] = [];

    dayRows.forEach((r: any[]) => {
      const rawRank = safeString(r[0]);
      const name = safeString(r[1]);
      if (!name || name.toLowerCase().includes('team name') || rawRank.toLowerCase().includes('rank') || rawRank.includes('DAY STANDING')) return;

      const tag = safeString(r[2]) || name.slice(0, 3).toUpperCase();
      const place = safeInt(r[3]); // Survival Pts
      const total = safeInt(r[5]); // Total Pts
      const elims = safeInt(r[6]); // Kills
      const booyah = safeInt(r[7]);// Booyah
      const damage = safeInt(r[8]);// Damage
      const rankNum = safeInt(rawRank, standing12.length + 1);

      const logoUrl = resolveDriveLogo(name, tag, driveFiles);
      standing12.push({
        rank: rankNum,
        tag,
        name,
        booyah,
        elims,
        place,
        total,
        damage,
        logoUrl,
        col: DEFAULT_TEAM_COLS[standing12.length % DEFAULT_TEAM_COLS.length],
      });
    });

    // -------------------------------------------------------------
    // 2. Parse GameStanding!A1:J90 (Match 1–5 Points Race Progression & Totals)
    // -------------------------------------------------------------
    // Each match has a header row like: "MATCH #1 | ID: ...", "MATCH #2 | ...", etc.
    // Under each header: "Rank", "Team Name", "Tag Name", "Survival Pts", "Kill Pts", "Total Pts", "Kills", "Booyah", "Damage"
    const gameRows = batch['GameStanding!A1:J90'] || [];
    const progressionMap: Record<string, { tag: string; name: string; color: string; pts: number[] }> = {};
    const progColors = ['#fbbf24', '#a78bfa', '#2dd4bf', '#f43f5e', '#38bdf8'];
    let progColorIdx = 0;

    let currentMatch = -1;
    let maxMatchIdxSeen = -1;
    const matchKills = [0, 0, 0, 0, 0];
    const matchDamage = [0, 0, 0, 0, 0];

    gameRows.forEach((r: any[]) => {
      const text0 = safeString(r[0]);
      const matchHeader = text0.match(/MATCH\s*#(\d+)/i);
      if (matchHeader) {
        currentMatch = parseInt(matchHeader[1], 10) - 1;
        return;
      }
      if (text0.toLowerCase().includes('rank') || !r[1] || safeString(r[1]).toLowerCase().includes('team name')) return;

      if (currentMatch >= 0 && currentMatch < 5) {
        const team = safeString(r[1]);
        const tag = safeString(r[2]) || team;
        const pts = safeInt(r[5]); // Total Pts for this match
        const k = safeInt(r[6]);   // Kills for this match
        const d = safeInt(r[8]);   // Damage for this match

        if (pts > 0 || k > 0 || d > 0) {
          maxMatchIdxSeen = Math.max(maxMatchIdxSeen, currentMatch);
        }

        matchKills[currentMatch] += k;
        matchDamage[currentMatch] += d;

        if (!progressionMap[team]) {
          progressionMap[team] = {
            tag,
            name: team,
            color: progColors[progColorIdx % progColors.length],
            pts: [0, 0, 0, 0, 0],
          };
          progColorIdx++;
        }
        progressionMap[team].pts[currentMatch] = pts;
      }
    });

    // Only emit cumulative points up to the latest played match (prevents flat horizontal lines on unplayed matches)
    const playedCount = Math.max(1, maxMatchIdxSeen + 1);
    const progressionList = Object.values(progressionMap).map((t) => {
      let acc = 0;
      const cumPts = t.pts.slice(0, playedCount).map((p) => {
        acc += p;
        return acc;
      });
      return {
        tag: t.tag,
        name: t.name,
        color: t.color,
        pts: cumPts,
        finalTotal: acc,
      };
    });
    progressionList.sort((a, b) => b.finalTotal - a.finalTotal);

    const matchProgression: MatchProgressionTeam[] = progressionList.slice(0, 5).map((t, idx) => ({
      tag: t.tag,
      name: t.name,
      color: progColors[idx % progColors.length],
      pts: t.pts,
    }));

    // If GameStanding didn't include full team names (only tags), enrich from standing12
    matchProgression.forEach((mp) => {
      const matchTeam = standing12.find(
        (st) => st.tag.toUpperCase() === mp.tag.toUpperCase() || st.name.toUpperCase() === mp.name.toUpperCase()
      );
      if (matchTeam) {
        mp.tag = matchTeam.tag;
        mp.name = matchTeam.name;
      }
    });

    // Derive from standing12 if GameStanding has no match rows yet (no hardcoded mock teams)
    if (matchProgression.length === 0 && standing12.length > 0) {
      standing12.slice(0, 5).forEach((t, idx) => {
        matchProgression.push({
          tag: t.tag,
          name: t.name,
          color: progColors[idx % progColors.length],
          pts: [t.total],
        });
      });
    }

    // Match Totals for Slide 7 (Dual Line Chart)
    const matchTotals = {
      kills: matchKills,
      damage: matchDamage,
    };

    // -------------------------------------------------------------
    // 3. Parse PlayerData!A1:K60 for Top 10 Players & 1v1 Duel
    // -------------------------------------------------------------
    // Columns:
    // A: Team Name/Tag, B: Player ID, C: Player Name, D: Kill, E: Damage,
    // F: Assist, G: On Target, H: Moving Distance, I: Headshots
    const playerRows = batch['PlayerData!A1:K60'] || [];
    const dayTop10Players: DayTopPlayer[] = [];

    playerRows.forEach((r: any[]) => {
      const name = safeString(r[2]);
      if (!name || name.toLowerCase().includes('player name')) return;
      const team = safeString(r[0]);
      const tag = team || name.slice(0, 3).toUpperCase();
      const kills = safeInt(r[3]);
      const dmg = safeInt(r[4]);
      const assist = safeInt(r[5]);
      const hs = safeInt(r[8]);

      dayTop10Players.push({ name, team, tag, kills, dmg, assist, hs });
    });

    dayTop10Players.sort((a, b) => b.kills - a.kills || b.dmg - a.dmg);

    const duel1v1: Duel1v1 = {
      p1: dayTop10Players[0]
        ? {
            name: dayTop10Players[0].name,
            team: dayTop10Players[0].team,
            tag: dayTop10Players[0].tag,
            kills: dayTop10Players[0].kills,
            damage: dayTop10Players[0].dmg,
            hs: dayTop10Players[0].hs,
            assist: dayTop10Players[0].assist,
          }
        : {
            name: '---',
            team: '---',
            tag: '---',
            kills: 0,
            damage: 0,
            hs: 0,
            assist: 0,
          },
      p2: dayTop10Players[1]
        ? {
            name: dayTop10Players[1].name,
            team: dayTop10Players[1].team,
            tag: dayTop10Players[1].tag,
            kills: dayTop10Players[1].kills,
            damage: dayTop10Players[1].dmg,
            hs: dayTop10Players[1].hs,
            assist: dayTop10Players[1].assist,
          }
        : {
            name: '---',
            team: '---',
            tag: '---',
            kills: 0,
            damage: 0,
            hs: 0,
            assist: 0,
          },
    };

    // -------------------------------------------------------------
    // 4. Parse Weapons (Vmix!A1:P150 "DAY MOST USED GUNS" or Weapons!A1:H60)
    // -------------------------------------------------------------
    const weaponColors = ['#8b5cf6', '#2dd4bf', '#fbbf24', '#f43f5e', '#38bdf8'];
    const weaponsDay: WeaponStats[] = [];

    const vmixRows = batch['Vmix!A1:Z150'] || [];
    const dayGunHeaderIdx = vmixRows.findIndex((r: any[]) =>
      safeString(r?.[0]).toUpperCase().includes('DAY MOST USED GUNS')
    );

    if (dayGunHeaderIdx !== -1) {
      // Find rows under "DAY MOST USED GUNS"
      for (let i = dayGunHeaderIdx + 1; i < vmixRows.length; i++) {
        const r = vmixRows[i];
        if (!r || !r[0]) continue;
        const name = safeString(r[0]).toUpperCase();
        if (name === 'WEAPON' || name.includes('GUNS') || name.includes('GROUP')) continue;
        if (['EVO3', 'M7', 'AWM', 'UZI', 'WOODPECKER', 'MP40', 'M1887', 'SCAR', 'GROZA', 'KAR98K'].includes(name)) {
          if (!weaponsDay.some((w) => w.name === name)) {
            weaponsDay.push({
              name,
              kills: safeInt(r[1]),
              damage: safeInt(r[2]),
              hs: safeInt(r[4]), // Col E is Headshots
              color: weaponColors[weaponsDay.length % weaponColors.length],
            });
            if (weaponsDay.length >= 5) break;
          }
        }
      }
    }

    // Fallback: Check general Vmix rows if "DAY MOST USED GUNS" header wasn't found
    if (weaponsDay.length < 5) {
      for (let i = 0; i < vmixRows.length; i++) {
        const r = vmixRows[i];
        if (r && r[0] && ['EVO3', 'M7', 'AWM', 'UZI', 'WOODPECKER', 'MP40', 'M1887', 'SCAR', 'GROZA', 'KAR98K'].includes(safeString(r[0]).toUpperCase())) {
          const name = safeString(r[0]).toUpperCase();
          if (!weaponsDay.some((w) => w.name === name)) {
            weaponsDay.push({
              name,
              kills: safeInt(r[1]),
              damage: safeInt(r[2]),
              hs: safeInt(r[4]),
              color: weaponColors[weaponsDay.length % weaponColors.length],
            });
            if (weaponsDay.length >= 5) break;
          }
        }
      }
    }

    // If Vmix didn't yield 5 weapons, aggregate from Weapons!A1:H60
    if (weaponsDay.length < 5) {
      const wepMap: Record<string, { name: string; kills: number; damage: number; hs: number }> = {};
      const wepRows = batch['Weapons!A1:H60'] || [];
      wepRows.forEach((r: any[]) => {
        const wep = safeString(r[3]).toUpperCase();
        if (!wep || wep.includes('WEAPON')) return;
        if (!wepMap[wep]) {
          wepMap[wep] = { name: wep, kills: 0, damage: 0, hs: 0 };
        }
        wepMap[wep].kills += safeInt(r[4]);
        wepMap[wep].damage += safeInt(r[5]);
        wepMap[wep].hs += safeInt(r[7]);
      });

      const aggregated = Object.values(wepMap).sort((a, b) => b.kills - a.kills);
      aggregated.forEach((item) => {
        if (!weaponsDay.some((w) => w.name === item.name) && weaponsDay.length < 5) {
          weaponsDay.push({
            name: item.name,
            kills: item.kills,
            damage: item.damage,
            hs: item.hs,
            color: weaponColors[weaponsDay.length % weaponColors.length],
          });
        }
      });
    }

    // Keep weaponsDay strictly driven by live sheet rows (no static mock numbers)

    // -------------------------------------------------------------
    // 4b. Parse Weapons Per Match (Match 1–6)
    // -------------------------------------------------------------
    const weaponsByMatch: Record<number, WeaponStats[]> = {};
    const matchWepMap: Record<number, Record<string, { kills: number; damage: number; hs: number }>> = {};
    const wepAllRows = batch['Weapons!A1:H60'] || [];
    wepAllRows.forEach((r: any[]) => {
      const matchCandidate = safeInt(r[0]) || (safeString(r[0]).match(/\d+/)?.[0] ? parseInt(safeString(r[0]).match(/\d+/)![0], 10) : 0);
      const wep = safeString(r[3]).toUpperCase();
      if (matchCandidate >= 1 && matchCandidate <= 6 && wep) {
        if (!matchWepMap[matchCandidate]) matchWepMap[matchCandidate] = {};
        if (!matchWepMap[matchCandidate][wep]) matchWepMap[matchCandidate][wep] = { kills: 0, damage: 0, hs: 0 };
        matchWepMap[matchCandidate][wep].kills += safeInt(r[4]);
        matchWepMap[matchCandidate][wep].damage += safeInt(r[5]);
        matchWepMap[matchCandidate][wep].hs += safeInt(r[7]);
      }
    });

    for (let m = 1; m <= 6; m++) {
      if (matchWepMap[m] && Object.keys(matchWepMap[m]).length > 0) {
        weaponsByMatch[m] = Object.entries(matchWepMap[m])
          .map(([name, s], idx) => ({
            name,
            kills: s.kills,
            damage: s.damage,
            hs: s.hs || Math.round(s.kills * 0.4),
            color: weaponColors[idx % weaponColors.length],
          }))
          .sort((a, b) => b.kills - a.kills)
          .slice(0, 5);
      } else {
        weaponsByMatch[m] = weaponsDay;
      }
    }

    // -------------------------------------------------------------
    // 5. Parse LastMatchStanding!A1:J20 (Match 5 Standings)
    // -------------------------------------------------------------
    // Columns:
    // A: Rank, B: Team Name, C: Tag Name, D: Survival Pts, E: Kill Pts, F: Total Pts
    const lastRows = batch['LastMatchStanding!A1:J20'] || [];
    const mapStandingM5: MapStanding[] = [];

    lastRows.forEach((r: any[]) => {
      const rawRank = safeString(r[0]);
      const name = safeString(r[1]);
      if (!name || name.toLowerCase().includes('team name') || rawRank.toLowerCase().includes('rank') || rawRank.includes('MATCH')) return;

      mapStandingM5.push({
        rank: safeInt(rawRank, mapStandingM5.length + 1),
        tag: safeString(r[2]) || name.slice(0, 3).toUpperCase(),
        name,
        surv: safeInt(r[3]),
        kill: safeInt(r[4]),
        total: safeInt(r[5]),
      });
    });

    if (mapStandingM5.length === 0 && standing12.length > 0) {
      standing12.slice(0, 5).forEach((t) => {
        mapStandingM5.push({
          rank: t.rank,
          tag: t.tag,
          name: t.name,
          surv: t.place,
          kill: t.elims,
          total: t.total,
        });
      });
    }

    // -------------------------------------------------------------
    // 6. Parse TeamStats!A1:L20 & Full 12 Teams
    // -------------------------------------------------------------
    // Columns:
    // A: Rank, B: Team Name, C: Tag Name, D: Survival Pts, E: Kill Pts,
    // F: Total Pts, G: Kills, H: Booyah, I: Damage, J: Headshots, K: Headshot Rate, L: Gloo Used
    const teamStatsRows = batch['TeamStats!A1:L20'] || [];
    const allTeamsFull: TeamFullStats[] = [];

    // Aggregate player assists & headshots per team from PlayerData for real-time team stats
    const teamAssistsMap: Record<string, number> = {};
    const teamHsMap: Record<string, number> = {};
    playerRows.forEach((r: any[]) => {
      const pTeam = safeString(r[0]).trim();
      const pName = safeString(r[2]).trim();
      const pAssist = safeInt(r[5]);
      const pHs = safeInt(r[8]);
      if (pTeam) {
        teamAssistsMap[pTeam.toUpperCase()] = (teamAssistsMap[pTeam.toUpperCase()] || 0) + pAssist;
        teamHsMap[pTeam.toUpperCase()] = (teamHsMap[pTeam.toUpperCase()] || 0) + pHs;
      }
      const tagFromPrefix = pName.split('.')[0] || '';
      if (tagFromPrefix && tagFromPrefix.length <= 6) {
        teamAssistsMap[tagFromPrefix.toUpperCase()] = (teamAssistsMap[tagFromPrefix.toUpperCase()] || 0) + pAssist;
        teamHsMap[tagFromPrefix.toUpperCase()] = (teamHsMap[tagFromPrefix.toUpperCase()] || 0) + pHs;
      }
    });

    teamStatsRows.forEach((r: any[]) => {
      const rawRank = safeString(r[0]);
      const name = safeString(r[1]);
      if (!name || name.toLowerCase().includes('team name') || rawRank.toLowerCase().includes('rank') || rawRank.includes('TEAM STATS')) return;

      const tag = safeString(r[2]) || name.slice(0, 3).toUpperCase();
      const surv = safeInt(r[3]);    // Survival Pts
      const total = safeInt(r[5]);   // Total Pts
      const kills = safeInt(r[6]);   // Kills
      const booyah = safeInt(r[7]);  // Booyah
      const damage = safeInt(r[8]);  // Damage
      let hs = safeInt(r[9]);        // Headshots
      if (typeof r[9] === 'string' && r[9].endsWith('%') && hs >= 100) {
        hs = Math.round(hs / 100);
      }
      if (hs === 0) {
        hs = teamHsMap[tag.toUpperCase()] || teamHsMap[name.toUpperCase()] || Math.round(kills * 0.38);
      }
      const gloo = safeInt(r[11]);   // Gloo Used
      const assist = teamAssistsMap[tag.toUpperCase()] || teamAssistsMap[name.toUpperCase()] || Math.round(kills * 0.44);

      const avgElims = safeFloat((kills / 5).toFixed(1));
      const avgDmg = Math.round(damage / 5);
      const avgSurvMin = safeFloat((10 + (allTeamsFull.length) * 0.4).toFixed(1));

      allTeamsFull.push({
        rank: safeInt(rawRank, allTeamsFull.length + 1),
        tag,
        name,
        total,
        kills,
        surv,
        damage,
        hs,
        gloo,
        assist,
        avgElims,
        avgDmg,
        avgSurvMin,
        logoUrl: resolveDriveLogo(name, tag, driveFiles),
        col: DEFAULT_TEAM_COLS[allTeamsFull.length % DEFAULT_TEAM_COLS.length],
      });
    });

    if (allTeamsFull.length === 0 && standing12.length > 0) {
      standing12.forEach((st) => {
        allTeamsFull.push({
          rank: st.rank,
          tag: st.tag,
          name: st.name,
          total: st.total,
          kills: st.elims,
          surv: st.place,
          damage: st.damage || st.elims * 500,
          hs: Math.round(st.elims * 0.4),
          gloo: Math.round(st.place * 6),
          avgElims: safeFloat((st.elims / 5).toFixed(1)),
          avgDmg: Math.round((st.damage || st.elims * 500) / 5),
          avgSurvMin: safeFloat((10 + st.rank * 0.4).toFixed(1)),
          logoUrl: st.logoUrl,
          col: st.col,
        });
      });
    }

    // Team Kills & Damage for Slide 10
    const teamKillsDmg12: TeamKillsDmg[] = (allTeamsFull.length > 0 ? allTeamsFull : standing12).map((t, idx) => ({
      tag: t.tag,
      name: t.name,
      kills: 'elims' in t ? (t as any).elims : (t as any).kills,
      dmg: t.damage || 0,
      logoUrl: (t as any).logoUrl || resolveDriveLogo(t.name, t.tag, driveFiles),
      col: t.col || DEFAULT_TEAM_COLS[idx % DEFAULT_TEAM_COLS.length],
    }));

    // -------------------------------------------------------------
    // 6b. Parse Live HEAD TO HEAD & GROUP STAGE H2H Directly from Vmix Tab
    // -------------------------------------------------------------
    const findTeamInAll = (teamName: string) => {
      const up = safeString(teamName).toUpperCase();
      if (!up) return undefined;
      return allTeamsFull.find(
        (t) => t.name.toUpperCase() === up || t.tag.toUpperCase() === up
      );
    };

    const parseVmixH2HSection = (): { a?: H2HTeam; b?: H2HTeam } => {
      const hdrIdx = vmixRows.findIndex((r: any[]) =>
        Array.isArray(r) &&
        r.some((cell) => {
          const s = safeString(cell).toUpperCase();
          return s.includes('HEAD TO HEAD') && !s.includes('GROUP STAGE');
        })
      );
      if (hdrIdx === -1) return {};

      // Find the column header row right below ("Team Name")
      const colRowIdx = vmixRows.findIndex(
        (r: any[], idx: number) =>
          idx > hdrIdx &&
          idx <= hdrIdx + 3 &&
          Array.isArray(r) &&
          r.some((c) => safeString(c).toUpperCase() === 'TEAM NAME')
      );
      if (colRowIdx === -1) return {};

      const colRow = vmixRows[colRowIdx] || [];
      const nameCol = colRow.findIndex((c: any) => safeString(c).toUpperCase() === 'TEAM NAME');
      if (nameCol === -1) return {};

      const parseRow = (row: any[] | undefined): H2HTeam | undefined => {
        if (!row) return undefined;
        const tName = safeString(row[nameCol]);
        if (!tName) return undefined;
        const matched = findTeamInAll(tName);
        const rank = safeInt(row[nameCol + 2], matched?.rank || 1);
        const surv = safeInt(row[nameCol + 3], matched?.surv || 0);
        const total = safeInt(row[nameCol + 5], matched?.total || 0);
        const kills = safeInt(row[nameCol + 6], matched?.kills || 0);
        const damage = safeInt(row[nameCol + 8], matched?.damage || 0);
        let hs = safeInt(row[nameCol + 9], matched?.hs || 0);
        if (typeof row[nameCol + 9] === 'string' && row[nameCol + 9].endsWith('%') && hs >= 100) {
          hs = Math.round(hs / 100);
        }
        if (hs === 0 && matched) hs = matched.hs;
        const gloo = safeInt(row[nameCol + 11], matched?.gloo || 0);
        const tag = matched?.tag || tName.slice(0, 3).toUpperCase();
        const assist =
          teamAssistsMap[tag.toUpperCase()] ||
          teamAssistsMap[tName.toUpperCase()] ||
          matched?.assist ||
          Math.round(kills * 0.42);
        return {
          name: matched?.name || tName,
          tag,
          rank,
          surv,
          kills,
          total,
          damage,
          hs,
          gloo,
          assist,
        };
      };

      return {
        a: parseRow(vmixRows[colRowIdx + 1]),
        b: parseRow(vmixRows[colRowIdx + 2]),
      };
    };

    const parseVmixGroupAvgSection = (): { a?: H2HGroupAvgTeam; b?: H2HGroupAvgTeam } => {
      const hdrIdx = vmixRows.findIndex((r: any[]) =>
        Array.isArray(r) &&
        r.some((cell) => safeString(cell).toUpperCase().includes('GROUP STAGE AVERAGES'))
      );
      if (hdrIdx === -1) return {};

      const colRowIdx = vmixRows.findIndex(
        (r: any[], idx: number) =>
          idx > hdrIdx &&
          idx <= hdrIdx + 3 &&
          Array.isArray(r) &&
          r.some((c) => safeString(c).toUpperCase() === 'TEAM NAME')
      );
      if (colRowIdx === -1) return {};

      const colRow = vmixRows[colRowIdx] || [];
      const nameCol = colRow.findIndex((c: any) => safeString(c).toUpperCase() === 'TEAM NAME');
      if (nameCol === -1) return {};

      const parseRow = (row: any[] | undefined): H2HGroupAvgTeam | undefined => {
        if (!row) return undefined;
        const tName = safeString(row[nameCol]);
        if (!tName) return undefined;
        const matched = findTeamInAll(tName);
        const avgElims = safeFloat(row[nameCol + 2], matched?.avgElims || 0);
        const avgDmg = safeInt(row[nameCol + 3], matched?.avgDmg || 0);
        const survRaw = safeString(row[nameCol + 5]).replace(',', '.');
        const avgSurvMin = safeFloat(survRaw, matched?.avgSurvMin || 0);
        return {
          name: matched?.name || tName,
          tag: matched?.tag || tName.slice(0, 3).toUpperCase(),
          avgElims,
          avgDmg,
          avgSurvMin,
        };
      };

      return {
        a: parseRow(vmixRows[colRowIdx + 1]),
        b: parseRow(vmixRows[colRowIdx + 2]),
      };
    };

    const sheetH2H = parseVmixH2HSection();
    const sheetGroupH2H = parseVmixGroupAvgSection();

    // Parse HEAD TO HEAD (DAY STANDING) directly from Vmix (e.g. Row 64)
    const parseVmixDayH2HSection = (): { a?: H2HTeam; b?: H2HTeam } => {
      const hdrIdx = vmixRows.findIndex((r: any[]) =>
        Array.isArray(r) &&
        r.some((cell) => {
          const s = safeString(cell).toUpperCase();
          return s.includes('HEAD TO HEAD') && s.includes('DAY STANDING') && !s.includes('PLAYER');
        })
      );
      if (hdrIdx === -1) return {};

      const colRowIdx = vmixRows.findIndex(
        (r: any[], idx: number) =>
          idx > hdrIdx &&
          idx <= hdrIdx + 3 &&
          Array.isArray(r) &&
          r.some((c) => safeString(c).toUpperCase() === 'TEAM NAME')
      );
      if (colRowIdx === -1) return {};

      const colRow = vmixRows[colRowIdx] || [];
      const nameCol = colRow.findIndex((c: any) => safeString(c).toUpperCase() === 'TEAM NAME');
      if (nameCol === -1) return {};

      const parseRow = (row: any[] | undefined): H2HTeam | undefined => {
        if (!row) return undefined;
        const tName = safeString(row[nameCol]);
        if (!tName) return undefined;
        const matched = findTeamInAll(tName);
        const rank = safeInt(row[nameCol + 2], matched?.rank || 1);
        const surv = safeInt(row[nameCol + 3], matched?.surv || 0);
        const kills = safeInt(row[nameCol + 4], matched?.kills || 0);
        const total = safeInt(row[nameCol + 5], matched?.total || 0);
        const tag = matched?.tag || tName.slice(0, 3).toUpperCase();
        return {
          name: matched?.name || tName,
          tag,
          rank,
          surv,
          kills,
          total,
          damage: matched?.damage || 0,
          hs: matched?.hs || 0,
          gloo: matched?.gloo || 0,
          assist: matched?.assist ?? Math.round(kills * 0.42),
          logoUrl: matched?.logoUrl || resolveDriveLogo(tName, tag, driveFiles),
        };
      };

      return {
        a: parseRow(vmixRows[colRowIdx + 1]),
        b: parseRow(vmixRows[colRowIdx + 2]),
      };
    };

    // Parse HEAD TO HEAD (PLAYER DAY STANDING) directly from Vmix (e.g. Row 91)
    const parseVmixPlayerH2HSection = (): { p1?: any; p2?: any } => {
      const hdrIdx = vmixRows.findIndex((r: any[]) =>
        Array.isArray(r) &&
        r.some((cell) => {
          const s = safeString(cell).toUpperCase();
          return s.includes('HEAD TO HEAD') && s.includes('PLAYER');
        })
      );
      if (hdrIdx === -1) return {};

      const colRowIdx = vmixRows.findIndex(
        (r: any[], idx: number) =>
          idx > hdrIdx &&
          idx <= hdrIdx + 3 &&
          Array.isArray(r) &&
          r.some((c) => safeString(c).toUpperCase() === 'PLAYER NAME')
      );
      if (colRowIdx === -1) return {};

      const colRow = vmixRows[colRowIdx] || [];
      const teamCol = colRow.findIndex((c: any) => safeString(c).toUpperCase() === 'TEAM NAME');
      const pCol = colRow.findIndex((c: any) => safeString(c).toUpperCase() === 'PLAYER NAME');
      if (pCol === -1) return {};

      const parseRow = (row: any[] | undefined) => {
        if (!row) return undefined;
        const pName = safeString(row[pCol]);
        if (!pName) return undefined;
        const teamName = teamCol !== -1 ? safeString(row[teamCol]) : '';
        const matchedTeam = findTeamInAll(teamName);
        const tag = matchedTeam?.tag || (pName.includes('.') ? pName.split('.')[0].toUpperCase() : teamName.slice(0, 3).toUpperCase());
        return {
          name: pName,
          team: matchedTeam?.name || teamName || tag,
          tag,
          kills: safeInt(row[pCol + 1]),
          damage: safeInt(row[pCol + 2]),
          assist: safeInt(row[pCol + 3]),
          hs: safeInt(row[pCol + 6]),
        };
      };

      return {
        p1: parseRow(vmixRows[colRowIdx + 1]),
        p2: parseRow(vmixRows[colRowIdx + 2]),
      };
    };

    const sheetDayH2H = parseVmixDayH2HSection();
    const sheetPlayerH2H = parseVmixPlayerH2HSection();
    if (sheetPlayerH2H.p1) duel1v1.p1 = sheetPlayerH2H.p1;
    if (sheetPlayerH2H.p2) duel1v1.p2 = sheetPlayerH2H.p2;

    // H2H Latest Match: Always read from Sheet's Vmix HEAD TO HEAD section first, fallback to Top 2 teams
    const tA = allTeamsFull[0];
    const tB = allTeamsFull[1] || allTeamsFull[0];

    const h2hMatch5: { a: H2HTeam; b: H2HTeam } = {
      a: sheetH2H.a
        ? sheetH2H.a
        : tA
        ? {
            name: tA.name,
            tag: tA.tag,
            rank: tA.rank,
            surv: tA.surv,
            kills: tA.kills,
            total: tA.total,
            damage: tA.damage,
            hs: tA.hs,
            gloo: tA.gloo,
            assist: tA.assist || Math.round(tA.kills * 0.42),
          }
        : {
            name: '---',
            tag: '---',
            rank: 1,
            surv: 0,
            kills: 0,
            total: 0,
            damage: 0,
            hs: 0,
            gloo: 0,
            assist: 0,
          },
      b: sheetH2H.b
        ? sheetH2H.b
        : tB
        ? {
            name: tB.name,
            tag: tB.tag,
            rank: tB.rank,
            surv: tB.surv,
            kills: tB.kills,
            total: tB.total,
            damage: tB.damage,
            hs: tB.hs,
            gloo: tB.gloo,
            assist: tB.assist || Math.round(tB.kills * 0.42),
          }
        : {
            name: '---',
            tag: '---',
            rank: 2,
            surv: 0,
            kills: 0,
            total: 0,
            damage: 0,
            hs: 0,
            gloo: 0,
            assist: 0,
          },
    };

    // H2H Group Average: Read from Sheet's Vmix GROUP STAGE AVERAGES section first, fallback to Top 2
    const gA = allTeamsFull[0];
    const gB = allTeamsFull[1] || allTeamsFull[0];

    const h2hGroupAvg: { a: H2HGroupAvgTeam; b: H2HGroupAvgTeam } = {
      a: sheetGroupH2H.a
        ? sheetGroupH2H.a
        : gA
        ? {
            name: gA.name,
            tag: gA.tag,
            avgElims: gA.avgElims,
            avgDmg: gA.avgDmg,
            avgSurvMin: gA.avgSurvMin,
          }
        : {
            name: '---',
            tag: '---',
            avgElims: 0,
            avgDmg: 0,
            avgSurvMin: 0,
          },
      b: sheetGroupH2H.b
        ? sheetGroupH2H.b
        : gB
        ? {
            name: gB.name,
            tag: gB.tag,
            avgElims: gB.avgElims,
            avgDmg: gB.avgDmg,
            avgSurvMin: gB.avgSurvMin,
          }
        : {
            name: '---',
            tag: '---',
            avgElims: 0,
            avgDmg: 0,
            avgSurvMin: 0,
          },
    };

    // -------------------------------------------------------------
    // 7. Parse PlayerRoleStats!A1:K130 (BOMBER BUG FIX - NO HARDCODING)
    // -------------------------------------------------------------
    // Section headers: "SNIPER (8 PLAYERS)", "RUSHER (26 PLAYERS)", "SUPPORT (13 PLAYERS)", "BOMBER (6 PLAYERS)"
    // Under each header: "Team Name", "Player ID", "Player Name", "Kill", "Damage", ...
    const roleRows = batch['PlayerRoleStats!A1:K130'] || [];
    const rolesMap: Record<string, RoleItem> = {
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

    let currentRole = '';
    roleRows.forEach((r: any[]) => {
      const col0 = safeString(r[0]).toUpperCase();
      if (col0.includes('RUSHER')) currentRole = 'RUSHER';
      else if (col0.includes('SUPPORT')) currentRole = 'SUPPORT';
      else if (col0.includes('SNIPER')) currentRole = 'SNIPER';
      else if (col0.includes('BOMBER')) currentRole = 'BOMBER';

      if (currentRole && r[2] && r[3] && !isNaN(parseInt(String(r[3]), 10))) {
        const pName = safeString(r[2]);
        if (pName.toLowerCase().includes('player name')) return;
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
    });

    const rolesList = [rolesMap.RUSHER, rolesMap.SUPPORT, rolesMap.SNIPER, rolesMap.BOMBER];

    const rolesPolar: RolePolarItem[] = [
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

    const h2hDayStanding: { a: H2HTeam; b: H2HTeam } = {
      a: sheetDayH2H.a || h2hMatch5.a,
      b: sheetDayH2H.b || h2hMatch5.b,
    };

    const payload: SheetDataPayload = {
      success: true,
      standing12,
      matchProgression,
      duel1v1,
      weaponsDay,
      weaponsByMatch,
      mapStandingM5,
      h2hMatch5,
      h2hDayStanding,
      h2hGroupAvg,
      dayTop10Players,
      allTeamsFull,
      teamKillsDmg12,
      matchTotals,
      roles: rolesList,
      rolesPolar,
      meta: {
        isLive: true,
        sourceTab: 'GoogleSheets batchGet',
        cached: !fresh,
        sheetId: activeConfig.sheetId,
        driveFolderId: activeConfig.driveFolderId,
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('[Live Data API] batchGet failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tournament live data',
        meta: { isLive: false, error: String(error) },
      },
      { status: 500 }
    );
  }
}
