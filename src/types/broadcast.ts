// Shared TypeScript interfaces for RTB / Free Fire Esports Broadcast Overlay Suite

export interface DriveFileItem {
  id: string;
  name: string;
  modifiedTime?: string;
  version?: string;
}

export interface StandingTeam {
  rank: number;
  tag: string;
  name: string;
  booyah: number;
  elims: number;
  place: number;
  total: number;
  damage?: number;
  logoUrl?: string;
  col: string;
}

export interface MatchProgressionTeam {
  tag: string;
  name: string;
  color: string;
  pts: number[]; // Points in Match 1, 2, 3, 4, 5
}

export interface DuelPlayer {
  name: string;
  team: string;
  tag: string;
  kills: number;
  damage: number;
  hs: number;
  assist: number;
}

export interface Duel1v1 {
  p1: DuelPlayer;
  p2: DuelPlayer;
}

export interface WeaponStats {
  name: string;
  kills: number;
  damage: number;
  hs: number;
  color: string;
}

export interface MapStanding {
  rank: number;
  tag: string;
  name: string;
  surv: number;
  kill: number;
  total: number;
}

export interface H2HTeam {
  name: string;
  tag: string;
  rank: number;
  surv: number;
  kills: number;
  total: number;
  damage: number;
  hs: number;
  gloo: number;
  assist?: number;
}

export interface H2HGroupAvgTeam {
  name: string;
  tag: string;
  avgElims: number;
  avgDmg: number;
  avgSurvMin: number;
}

export interface DayTopPlayer {
  name: string;
  team: string;
  tag: string;
  kills: number;
  dmg: number;
  assist: number;
  hs: number;
}

export interface TeamFullStats {
  rank: number;
  tag: string;
  name: string;
  total: number;
  kills: number;
  surv: number;
  damage: number;
  hs: number;
  gloo: number;
  assist?: number;
  avgElims: number;
  avgDmg: number;
  avgSurvMin: number;
  logoUrl?: string;
  col: string;
}

export interface TeamKillsDmg {
  tag: string;
  name: string;
  kills: number;
  dmg: number;
  col: string;
  logoUrl?: string;
}

export interface RoleItem {
  role: string;
  tag: string;
  players: number;
  kills: number;
  damage: number;
  top: string;
  maxK: number;
  color: string;
  bgTint: string;
  borderTint: string;
}

export interface RolePolarItem {
  role: string;
  color: string;
  kills: number;
  damage: number;
}

export interface BroadcastThemeConfig {
  global: {
    textColor: string;
    boxBg: string;
    boxBorder: string;
    boxAlpha: number;
  };
  s0: { l0: string; l1: string; l2: string; l3: string; l4: string };
  s1: { p1: string; p2: string; accent: string };
  s2: { w0: string; w1: string; w2: string; w3: string; w4: string };
  s3: { teamA: string; teamB: string };
  s4: { teamA: string; teamB: string };
  s5: Record<string, string>; // c0..c11
  s6: { rank1: string; rank2: string; outerBox: string };
  s7: { kills: string; damage: string };
  s8: {
    rusher: string;
    support: string;
    sniper: string;
    bomber: string;
    a_rusher?: string;
    a_support?: string;
    a_sniper?: string;
    a_bomber?: string;
    b_rusher?: string;
    b_support?: string;
    b_sniper?: string;
    b_bomber?: string;
    [key: string]: string | undefined;
  };
  s9: { kills: string; damage: string };
  sources?: Record<number, string>;
  custom?: {
    p1Idx?: number;
    p2Idx?: number;
    tAIdx?: number;
    tBIdx?: number;
    gAIdx?: number;
    gBIdx?: number;
    rAIdx?: number;
    rBIdx?: number;
    s2Logo?: string;
    [key: string]: any;
  };
}

export interface SheetDataPayload {
  success: boolean;
  standing12: StandingTeam[];
  matchProgression: MatchProgressionTeam[];
  duel1v1: Duel1v1;
  weaponsDay: WeaponStats[];
  weaponsByMatch?: Record<number, WeaponStats[]>;
  mapStandingM5: MapStanding[];
  h2hMatch5: { a: H2HTeam; b: H2HTeam };
  h2hGroupAvg: { a: H2HGroupAvgTeam; b: H2HGroupAvgTeam };
  dayTop10Players: DayTopPlayer[];
  allTeamsFull: TeamFullStats[];
  teamKillsDmg12: TeamKillsDmg[];
  matchTotals: { kills: number[]; damage: number[] };
  roles: RoleItem[];
  rolesPolar: RolePolarItem[];
  meta: {
    isLive: boolean;
    sourceTab: string;
    cached: boolean;
    sheetId: string;
    driveFolderId?: string;
    updatedAt: string;
  };
}

export interface AdminSheetConfig {
  sheetId: string;
  apiKey?: string;
  driveFolderId?: string;
}
