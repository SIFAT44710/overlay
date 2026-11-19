'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Sifat's Lockdown Color Bible Tokens
// Palette E5: Light Editorial Stats (Day/Analyst Desk)
const PALETTE_E5_LIGHT = {
  id: 'E5',
  name: 'Light Editorial Stats',
  canvas: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  ink: '#0F172A',
  muted: '#475569',
  accentGold: '#D97706',
  accentRed: '#DC2626',
  accentBlue: '#0284C7',
  accentGreen: '#16A34A',
};

// Palette E6: Broadcast Overlay (Dark OBS/vMix Stage)
const PALETTE_E6_DARK = {
  id: 'E6',
  name: 'Broadcast Overlay',
  canvas: '#0B0F19',
  surface: '#141B2D',
  surfaceAlt: '#1B243B',
  border: '#232E47',
  borderHover: '#374768',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  accentGold: '#FFB800',
  accentRed: '#EF4444',
  accentBlue: '#00F0FF',
  accentGreen: '#10B981',
};

export default function FFWSDemoShowcase() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'split-bar' | 'momentum' | 'squad'>('split-bar');

  const theme = themeMode === 'light' ? PALETTE_E5_LIGHT : PALETTE_E6_DARK;

  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  const rawTeams: any[] = data?.data || [];
  const teams = rawTeams
    .filter((t) => t.TeamName && t.TeamName.trim() !== '')
    .map((t) => ({
      name: t.TeamName.trim(),
      logo: t.LogoUrl,
      survival: parseInt(t['Survival Score']) || 0,
      kills: parseInt(t.Kill) || 0,
      total: parseInt(t.Total) || 0,
      booyah: parseInt(t.Booyah) || 0,
      damage: parseInt(t.Damage) || 0,
    }))
    .sort((a, b) => b.total - a.total || b.kills - a.kills);

  const maxTotal = Math.max(...teams.map((t) => t.total), 1);
  const maxKills = Math.max(...teams.map((t) => t.kills), 1);
  const topTeam = teams[0] || { name: 'JUMA GAMING', total: 33, kills: 24, damage: 16234, booyah: 1 };

  // Simulated cumulative points progression for top 5 teams across 5 matches
  const trajectoryData = [
    { match: 'Match 1', [teams[0]?.name || 'Team 1']: 8, [teams[1]?.name || 'Team 2']: 12, [teams[2]?.name || 'Team 3']: 6, [teams[3]?.name || 'Team 4']: 4, [teams[4]?.name || 'Team 5']: 2 },
    { match: 'Match 2', [teams[0]?.name || 'Team 1']: 18, [teams[1]?.name || 'Team 2']: 16, [teams[2]?.name || 'Team 3']: 11, [teams[3]?.name || 'Team 4']: 9, [teams[4]?.name || 'Team 5']: 7 },
    { match: 'Match 3', [teams[0]?.name || 'Team 1']: 24, [teams[1]?.name || 'Team 2']: 22, [teams[2]?.name || 'Team 3']: 15, [teams[3]?.name || 'Team 4']: 13, [teams[4]?.name || 'Team 5']: 11 },
    { match: 'Match 4', [teams[0]?.name || 'Team 1']: 29, [teams[1]?.name || 'Team 2']: 25, [teams[2]?.name || 'Team 3']: 17, [teams[3]?.name || 'Team 4']: 16, [teams[4]?.name || 'Team 5']: 14 },
    { match: 'Match 5', [teams[0]?.name || 'Team 1']: teams[0]?.total || 33, [teams[1]?.name || 'Team 2']: teams[1]?.total || 30, [teams[2]?.name || 'Team 3']: teams[2]?.total || 19, [teams[3]?.name || 'Team 4']: teams[3]?.total || 18, [teams[4]?.name || 'Team 5']: teams[4]?.total || 16 },
  ];

  return (
    <main
      className="min-h-screen p-4 sm:p-8 font-sans transition-colors duration-200"
      style={{ backgroundColor: theme.canvas, color: theme.ink }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <header
          className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: theme.accentGold }}
              >
                FFWS Pro Telemetry
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: theme.muted }}>
                Tournament HUD Demo (Palette {theme.id})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Demo Graph • Free Fire Esports Broadcast Showcase
            </h1>
            <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: theme.muted }}>
              Live Google Sheet Integration • 0ms Latency • No AI Glitches
            </p>
          </div>

          {/* Theme & Link Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Toggle Button */}
            <div
              className="flex items-center p-1 rounded-xl border text-xs font-bold"
              style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}
            >
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  themeMode === 'light'
                    ? 'bg-white shadow text-[#0F172A]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                ☀️ Light Editorial (E5)
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  themeMode === 'dark'
                    ? 'bg-[#141B2D] shadow text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                🌙 Dark Broadcast (E6)
              </button>
            </div>

            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition shadow-sm"
              style={{ backgroundColor: theme.accentBlue }}
            >
              ⚙️ Admin Panel
            </Link>
          </div>
        </header>

        {/* Demo Selector Tabs */}
        <nav className="flex items-center gap-2 border-b pb-2" style={{ borderColor: theme.border }}>
          <button
            type="button"
            onClick={() => setActiveTab('split-bar')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
              activeTab === 'split-bar'
                ? 'text-white shadow'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'split-bar' ? theme.accentGold : theme.surfaceAlt,
              color: activeTab === 'split-bar' ? (themeMode === 'light' ? '#0F172A' : '#000000') : theme.ink,
            }}
          >
            📊 Graph 1: Frag Dominance (Kills vs Placement)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('momentum')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
              activeTab === 'momentum'
                ? 'text-white shadow'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'momentum' ? theme.accentGold : theme.surfaceAlt,
              color: activeTab === 'momentum' ? (themeMode === 'light' ? '#0F172A' : '#000000') : theme.ink,
            }}
          >
            📈 Graph 2: Point Trajectory &amp; Momentum
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('squad')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
              activeTab === 'squad'
                ? 'text-white shadow'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'squad' ? theme.accentGold : theme.surfaceAlt,
              color: activeTab === 'squad' ? (themeMode === 'light' ? '#0F172A' : '#000000') : theme.ink,
            }}
          >
            🛡️ Graph 3: Squad 4-Player Firepower Matrix
          </button>
        </nav>

        {isLoading && (
          <div
            className="p-12 rounded-2xl border text-center font-bold"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            Syncing tournament data from Google Sheet...
          </div>
        )}

        {/* TAB 1: FRAG DOMINANCE (SLANTED SPLIT BAR) */}
        {!isLoading && activeTab === 'split-bar' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">FFWS Frag Dominance (12-Team Energy Split)</h2>
                <p className="text-xs" style={{ color: theme.muted }}>
                  Visualizes combat aggression (red kill segment) versus tactical survival (blue placement segment).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentBlue }} />
                  Placement Pts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentRed }} />
                  Kill Pts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentGold }} />
                  Total Points
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {teams.slice(0, 12).map((team, idx) => {
                const rank = idx + 1;
                const isTop1 = rank === 1;
                const isTop3 = rank <= 3;

                const killPct = (team.kills / (team.total || 1)) * 100;
                const survPct = 100 - killPct;

                return (
                  <div
                    key={team.name}
                    className="p-4 rounded-xl border transition-all duration-150 relative overflow-hidden"
                    style={{
                      backgroundColor: isTop1 && themeMode === 'light' ? '#FEF3C7' : theme.surface,
                      borderColor: isTop1 ? theme.accentGold : theme.border,
                      boxShadow: isTop1 ? '0 4px 12px rgba(217, 119, 6, 0.1)' : 'none',
                    }}
                  >
                    {/* Top Row: Rank, Logo, Team Name & Booyah */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isTop1 ? theme.accentGold : isTop3 ? theme.accentBlue : theme.surfaceAlt,
                            color: isTop1 || isTop3 ? '#FFFFFF' : theme.ink,
                          }}
                        >
                          #{rank}
                        </span>

                        <div
                          className="w-8 h-8 rounded-lg p-1 border flex items-center justify-center shrink-0"
                          style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}
                        >
                          <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>

                        <span className="font-extrabold text-sm sm:text-base tracking-wide truncate">
                          {team.name}
                        </span>

                        {team.booyah > 0 && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shrink-0"
                            style={{ backgroundColor: theme.accentGold }}
                          >
                            🏆 Booyah x{team.booyah}
                          </span>
                        )}
                      </div>

                      {/* Total Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black font-mono" style={{ color: theme.accentGold }}>
                          {team.total}
                        </span>
                        <span className="text-[10px] font-bold ml-1 uppercase" style={{ color: theme.muted }}>
                          PTS
                        </span>
                      </div>
                    </div>

                    {/* Slanted Split Energy Bar */}
                    <div
                      className="w-full h-3 rounded-md overflow-hidden flex p-0.5 border"
                      style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}
                    >
                      <div
                        className="h-full rounded-l transition-all duration-500"
                        style={{
                          width: `${survPct}%`,
                          backgroundColor: theme.accentBlue,
                        }}
                        title={`Placement: ${team.survival} pts`}
                      />
                      <div
                        className="h-full rounded-r transition-all duration-500"
                        style={{
                          width: `${killPct}%`,
                          backgroundColor: theme.accentRed,
                        }}
                        title={`Kills: ${team.kills} pts`}
                      />
                    </div>

                    {/* Meta Numbers Row */}
                    <div className="flex items-center justify-between text-[11px] font-mono mt-2" style={{ color: theme.muted }}>
                      <span>SURVIVAL: <strong style={{ color: theme.accentBlue }}>{team.survival}</strong></span>
                      <span>KILLS: <strong style={{ color: theme.accentRed }}>{team.kills}</strong></span>
                      <span>DAMAGE: <strong>{team.damage.toLocaleString()}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: POINT TRAJECTORY & MOMENTUM (STEP LINE CHART) */}
        {!isLoading && activeTab === 'momentum' && (
          <section
            className="p-6 rounded-2xl border space-y-4"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div>
              <h2 className="text-xl font-bold">Match Trajectory (Momentum Swing)</h2>
              <p className="text-xs" style={{ color: theme.muted }}>
                Tracks match-by-match score progression across rounds. Shows which team is climbing or clutching.
              </p>
            </div>

            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectoryData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="match" stroke={theme.muted} fontSize={12} tickLine={false} />
                  <YAxis stroke={theme.muted} fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderRadius: 12,
                      color: theme.ink,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={teams[0]?.name || 'Team 1'}
                    stroke={theme.accentGold}
                    strokeWidth={3}
                    dot={{ r: 5, fill: theme.accentGold }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={teams[1]?.name || 'Team 2'}
                    stroke={theme.accentBlue}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: theme.accentBlue }}
                  />
                  <Line
                    type="monotone"
                    dataKey={teams[2]?.name || 'Team 3'}
                    stroke={theme.accentRed}
                    strokeWidth={2}
                    dot={{ r: 4, fill: theme.accentRed }}
                  />
                  <Line
                    type="monotone"
                    dataKey={teams[3]?.name || 'Team 4'}
                    stroke={theme.muted}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono font-bold pt-2 border-t" style={{ borderColor: theme.border }}>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentGold }} />
                #1 {teams[0]?.name} (Leader)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentBlue }} />
                #2 {teams[1]?.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentRed }} />
                #3 {teams[2]?.name}
              </span>
            </div>
          </section>
        )}

        {/* TAB 3: SQUAD 4-PLAYER FIREPOWER MATRIX */}
        {!isLoading && activeTab === 'squad' && (
          <section
            className="p-6 rounded-2xl border space-y-6"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b" style={{ borderColor: theme.border }}>
              <div>
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-white"
                  style={{ backgroundColor: theme.accentGold }}
                >
                  TEAM OF THE MATCH
                </span>
                <h2 className="text-2xl font-black mt-1 uppercase tracking-wide">
                  {topTeam.name} • 4-MAN SQUAD ROSTER
                </h2>
                <p className="text-xs" style={{ color: theme.muted }}>
                  Detailed player damage contribution, role breakdown &amp; MVP frag distribution.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                  <div style={{ color: theme.muted }}>TEAM KILLS</div>
                  <div className="text-xl font-black" style={{ color: theme.accentRed }}>{topTeam.kills}</div>
                </div>
                <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                  <div style={{ color: theme.muted }}>TOTAL DAMAGE</div>
                  <div className="text-xl font-black" style={{ color: theme.accentBlue }}>{topTeam.damage.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 4 Player Contribution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: `${topTeam.name}.SHOVO`, role: 'IGL / Rusher', kills: Math.ceil(topTeam.kills * 0.42), dmg: Math.ceil(topTeam.damage * 0.40), isMvp: true },
                { name: `${topTeam.name}.XTROV`, role: 'Entry Fragger', kills: Math.ceil(topTeam.kills * 0.28), dmg: Math.ceil(topTeam.damage * 0.26), isMvp: false },
                { name: `${topTeam.name}.SABBIR`, role: 'Sniper / Support', kills: Math.ceil(topTeam.kills * 0.18), dmg: Math.ceil(topTeam.damage * 0.20), isMvp: false },
                { name: `${topTeam.name}.TANVIR`, role: 'Anchor / Scout', kills: Math.max(topTeam.kills - (Math.ceil(topTeam.kills * 0.42) + Math.ceil(topTeam.kills * 0.28) + Math.ceil(topTeam.kills * 0.18)), 0), dmg: Math.ceil(topTeam.damage * 0.14), isMvp: false },
              ].map((player, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border relative flex flex-col justify-between"
                  style={{
                    backgroundColor: player.isMvp && themeMode === 'light' ? '#FEF3C7' : theme.surfaceAlt,
                    borderColor: player.isMvp ? theme.accentGold : theme.border,
                    boxShadow: player.isMvp ? '0 4px 16px rgba(217, 119, 6, 0.15)' : 'none',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
                        SLOT #{i + 1}
                      </span>
                      {player.isMvp && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-sm"
                          style={{ backgroundColor: theme.accentGold }}
                        >
                          ⭐ SQUAD MVP
                        </span>
                      )}
                    </div>

                    <div className="w-14 h-14 rounded-xl border mb-3 flex items-center justify-center font-black text-xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                      {player.name[0]}
                    </div>

                    <h3 className="font-extrabold text-base tracking-wide truncate">{player.name}</h3>
                    <p className="text-xs font-mono mb-4" style={{ color: theme.muted }}>{player.role}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between text-xs font-mono">
                      <span style={{ color: theme.muted }}>ELIMS</span>
                      <strong style={{ color: theme.accentRed }}>{player.kills} KILLS</strong>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span style={{ color: theme.muted }}>DAMAGE</span>
                      <strong style={{ color: theme.accentBlue }}>{player.dmg.toLocaleString()}</strong>
                    </div>
                    {/* Share Bar */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(player.dmg / (topTeam.damage || 1)) * 100}%`,
                          backgroundColor: player.isMvp ? theme.accentGold : theme.accentBlue,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
