'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_FFWS_COLORS = {
  accentGold: '#FFB800',
  accentRed: '#FF2A4D',
  accentCyan: '#00F0FF',
  bgCarbon: '#0B0E14',
  cardBg: '#131722',
  borderColor: '#262D40',
  textColor: '#FFFFFF',
  textMuted: '#8E9AA8',
};

export default function FFWSDemo({ overrideColors }: { overrideColors?: any } = {}) {
  const [colors, setColors] = useState(overrideColors || DEFAULT_FFWS_COLORS);
  const [viewMode, setViewMode] = useState<'leaderboard' | 'momentum'>('leaderboard');

  useEffect(() => {
    if (overrideColors) {
      setColors({ ...DEFAULT_FFWS_COLORS, ...overrideColors });
      return;
    }
    const load = () => {
      try {
        const saved = localStorage.getItem('rtb_colors_ffws');
        if (saved) setColors({ ...DEFAULT_FFWS_COLORS, ...JSON.parse(saved) });
      } catch (e) {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [overrideColors]);

  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-transparent">
        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#0B0E14]/90 border border-[#FFB800]/40 backdrop-blur-md">
          <div className="w-8 h-8 border-3 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
          <div>
            <div className="text-sm font-black text-[#FFB800] uppercase tracking-widest">
              FFWS TELEMETRY SYSTEM
            </div>
            <div className="text-xs text-white/70">Syncing live tournament feed...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-bold">
        Error loading FFWS match telemetry.
      </div>
    );
  }

  const rawTeams: any[] = data.data || [];
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

  return (
    <div className="w-full min-h-screen p-6 sm:p-10 flex flex-col justify-center items-center bg-transparent font-sans overflow-hidden select-none">
      
      {/* 1920x1080 Native Broadcast HUD Container */}
      <div className="w-full max-w-[1780px] relative">
        
        {/* Top FFWS Official Header Bar */}
        <div className="flex items-end justify-between mb-4 pb-3 border-b-2 border-[#262D40] relative">
          
          {/* Left Brand Identity */}
          <div className="flex items-center gap-4">
            <div 
              className="px-4 py-2 font-black text-xl italic tracking-tighter text-black uppercase shadow-lg"
              style={{
                backgroundColor: colors.accentGold,
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }}
            >
              FFWS 2026
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: colors.accentRed }} />
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                  MATCH STANDINGS &amp; FRAG MOMENTUM
                </h1>
              </div>
              <p className="text-xs font-bold tracking-widest text-[#8E9AA8] uppercase mt-0.5">
                OFFICIAL BROADCAST TELEMETRY • BERMUDA STAGE
              </p>
            </div>
          </div>

          {/* Right Mode Switch & Match Meta */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-[#131722]/90 border border-[#262D40] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('leaderboard')}
                className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition ${
                  viewMode === 'leaderboard'
                    ? 'bg-[#FFB800] text-black shadow'
                    : 'text-[#8E9AA8] hover:text-white'
                }`}
              >
                12-Team HUD
              </button>
              <button
                type="button"
                onClick={() => setViewMode('momentum')}
                className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition ${
                  viewMode === 'momentum'
                    ? 'bg-[#FFB800] text-black shadow'
                    : 'text-[#8E9AA8] hover:text-white'
                }`}
              >
                Top Momentum Bars
              </button>
            </div>

            <div className="px-3.5 py-1.5 rounded-lg bg-[#131722] border border-[#262D40] text-right">
              <div className="text-[10px] font-bold text-[#8E9AA8] uppercase">LIVE SYNC</div>
              <div className="text-xs font-mono font-bold text-emerald-400">100% ACTIVE</div>
            </div>
          </div>
        </div>

        {/* VIEW 1: FFWS 12-TEAM DUAL-COLUMN ESPORTS GRID */}
        {viewMode === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-2">
            {teams.slice(0, 12).map((team, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop3 = rank <= 3;
              const isKillLeader = team.kills === maxKills && team.kills > 0;

              return (
                <div
                  key={team.name}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border relative overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: isTop1 ? 'rgba(255, 184, 0, 0.08)' : colors.cardBg,
                    borderColor: isTop1 ? colors.accentGold : isTop3 ? colors.accentCyan : colors.borderColor,
                    boxShadow: isTop1 ? `0 0 25px rgba(255, 184, 0, 0.2)` : 'none',
                  }}
                >
                  {/* Left Chamfer Accent Line */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{
                      backgroundColor: isTop1 ? colors.accentGold : isTop3 ? colors.accentCyan : 'transparent',
                    }}
                  />

                  {/* Rank & Team Identity */}
                  <div className="flex items-center gap-3.5 z-10 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm italic shadow"
                      style={{
                        backgroundColor: isTop1
                          ? colors.accentGold
                          : isTop3
                          ? colors.accentCyan
                          : '#1A202C',
                        color: isTop1 || isTop3 ? '#000000' : '#FFFFFF',
                      }}
                    >
                      #{rank}
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-black/50 p-1 flex items-center justify-center border border-white/10 shrink-0">
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base sm:text-lg uppercase tracking-wide text-white truncate">
                          {team.name}
                        </span>
                        {team.booyah > 0 && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1 shadow-sm"
                            style={{ backgroundColor: colors.accentGold }}
                          >
                            🏆 Booyah x{team.booyah}
                          </span>
                        )}
                        {isKillLeader && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-sm"
                            style={{ backgroundColor: colors.accentRed }}
                          >
                            🔥 Kill Leader
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#8E9AA8] mt-0.5">
                        DMG: <span className="text-white font-bold">{team.damage.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Telemetry Split: Survival Pts + Kill Pts = TOTAL */}
                  <div className="flex items-center gap-4 z-10 shrink-0">
                    <div className="text-center px-3 py-1 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] font-black tracking-widest text-[#8E9AA8] uppercase">
                        SURVIVAL
                      </div>
                      <div className="text-sm font-black font-mono text-cyan-400">
                        {team.survival}
                      </div>
                    </div>

                    <div className="text-center px-3 py-1 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-[9px] font-black tracking-widest text-[#8E9AA8] uppercase">
                        KILLS
                      </div>
                      <div 
                        className="text-sm font-black font-mono"
                        style={{ color: colors.accentRed }}
                      >
                        {team.kills}
                      </div>
                    </div>

                    <div 
                      className="text-center px-4 py-1.5 rounded-xl border min-w-[65px]"
                      style={{
                        backgroundColor: isTop1 ? colors.accentGold : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isTop1 ? colors.accentGold : colors.borderColor,
                      }}
                    >
                      <div 
                        className="text-[9px] font-black tracking-widest uppercase"
                        style={{ color: isTop1 ? '#000000' : '#8E9AA8' }}
                      >
                        TOTAL
                      </div>
                      <div 
                        className="text-xl font-black font-mono"
                        style={{ color: isTop1 ? '#000000' : '#FFFFFF' }}
                      >
                        {team.total}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: FFWS FRAG & MOMENTUM PROGRESSION BARS */}
        {viewMode === 'momentum' && (
          <div className="space-y-3 pt-2">
            {teams.slice(0, 8).map((team, idx) => {
              const killWidth = (team.kills / maxKills) * 100;
              const totalWidth = (team.total / maxTotal) * 100;

              return (
                <div
                  key={team.name}
                  className="p-3 rounded-xl border relative overflow-hidden"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: idx === 0 ? colors.accentGold : colors.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-[#FFB800]">#{idx + 1}</span>
                      <span className="font-black text-base uppercase text-white">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono font-bold">
                      <span className="text-cyan-400">SURV: {team.survival}</span>
                      <span style={{ color: colors.accentRed }}>KILLS: {team.kills}</span>
                      <span className="text-white text-sm bg-white/10 px-2 py-0.5 rounded">
                        TOTAL: {team.total} PTS
                      </span>
                    </div>
                  </div>

                  {/* Dual Energy Progress Bar */}
                  <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-l-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${totalWidth}%`,
                        backgroundColor: colors.accentGold,
                      }}
                      title={`Total Points: ${team.total}`}
                    />
                    <div
                      className="h-full rounded-r-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${killWidth}%`,
                        backgroundColor: colors.accentRed,
                      }}
                      title={`Kills: ${team.kills}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Stream Broadcast Bar */}
        <div className="mt-5 flex items-center justify-between text-xs font-mono text-[#8E9AA8] pt-3 border-t border-[#262D40]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OBS BROWSER RESOLUTION: 1920 x 1080 (30/60 FPS)</span>
          </div>
          <div>GARENA FREE FIRE ESPORTS • TOURNAMENT TELEMETRY</div>
        </div>

      </div>
    </div>
  );
}
