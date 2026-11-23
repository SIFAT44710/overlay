'use client';

import React, { useState } from 'react';
import { SheetDataPayload } from '@/types/broadcast';

interface SheetDataDrawerProps {
  currentSlide: number;
  slideTitle: string;
  activeSourceId: string;
  customSettings: any;
  sheetData?: SheetDataPayload;
  onSelectSource: (sourceId: string) => void;
  onUpdateCustom: (custom: any) => void;
}

const DEFAULT_ALL_TEAMS = [
  { rank: 1, name: 'NOCTRYX ESPORTS', tag: 'NTX' },
  { rank: 2, name: 'iQ LESS', tag: 'iQL' },
  { rank: 3, name: 'UNKNOWN BLOOD', tag: 'UB' },
  { rank: 4, name: 'ALCHEMIST', tag: 'ALC' },
  { rank: 5, name: 'NEXO BLIND', tag: 'NXB' },
  { rank: 6, name: 'AURA SMT', tag: 'AURA' },
  { rank: 7, name: 'WIDE YOUTH', tag: 'WY' },
  { rank: 8, name: 'NO SYMPATHY', tag: 'NSP' },
  { rank: 9, name: '6S BY AG', tag: '6S' },
  { rank: 10, name: 'POWER OF BGX', tag: 'BGX' },
  { rank: 11, name: 'DRAKEBORN', tag: 'DRK' },
  { rank: 12, name: 'EXTREME EX', tag: 'EXE' },
];

const SLIDE_DATA_OPTIONS: Array<Array<{ id: string; name: string; tab: string; pickerType?: string }>> = [
  [{ id: 'top5_m1_m5', name: 'GameStanding: Top 5 Teams (M1–M5)', tab: 'GameStanding' }],
  [
    { id: 'custom_h2h', name: 'Team H2H: Pick Any 2 Teams', tab: 'TeamStats', pickerType: 'teams_s2' },
    { id: 'latest_h2h', name: 'Team H2H: Latest Match (Match 5)', tab: 'Vmix R43' },
    { id: 'day_top2_h2h', name: 'Team H2H: Day Top 2 Teams', tab: 'DayStanding' },
    { id: 'day_top2_duel', name: 'Player 1v1: Day Top 2 (SHOVO vs SEJAN)', tab: 'Vmix R91' },
    { id: 'custom_duel', name: 'Player 1v1: Pick Any 2 Players', tab: 'PlayerData', pickerType: 'players' },
  ],
  [
    { id: 'day_guns', name: 'Weapon Meta: All Matches (Day Total)', tab: 'Vmix R91' },
    { id: 'match_1_guns', name: 'Weapon Meta: Match 1', tab: 'GameStanding / M1' },
    { id: 'match_2_guns', name: 'Weapon Meta: Match 2', tab: 'GameStanding / M2' },
    { id: 'match_3_guns', name: 'Weapon Meta: Match 3', tab: 'GameStanding / M3' },
    { id: 'match_4_guns', name: 'Weapon Meta: Match 4', tab: 'GameStanding / M4' },
    { id: 'match_5_guns', name: 'Weapon Meta: Match 5', tab: 'GameStanding / M5' },
    { id: 'match_6_guns', name: 'Weapon Meta: Match 6', tab: 'GameStanding / M6' },
  ],
  [
    { id: 'group_avg_h2h', name: 'Group Stage Avg (69 vs CME)', tab: 'Vmix R137' },
    { id: 'day_top2_avg', name: 'Day Top 2 Averages (TOP vs EXE)', tab: 'DayStanding' },
    { id: 'custom_avg_h2h', name: 'Custom: Pick Any 2 Sheet Teams', tab: 'TeamStats', pickerType: 'teams_s5' },
  ],
  [
    { id: 'day_pts', name: 'DayStanding: Total Points (12 Teams)', tab: 'DayStanding' },
    { id: 'day_kills', name: 'DayStanding: Total Kills (12 Teams)', tab: 'DayStanding' },
    { id: 'day_dmg', name: 'TeamStats: Total Damage (12 Teams)', tab: 'TeamStats' },
    { id: 'day_surv', name: 'DayStanding: Survival Points (12 Teams)', tab: 'DayStanding' },
    { id: 'day_hs', name: 'DayStanding: Total Headshots (12 Teams)', tab: 'DayStanding' },
    { id: 'latest_m5', name: 'LastMatchStanding: Match 5 Points', tab: 'LastMatchStanding' },
    { id: 'top10_plrs', name: 'Vmix: Day Top 10 Players', tab: 'Vmix R78' },
  ],
  [
    { id: 'day_top2_radar', name: 'DayStanding: Top 2 Radar (TOP vs EXE)', tab: 'DayStanding' },
    { id: 'custom_radar_h2h', name: 'Custom: Pick Any 2 Sheet Teams', tab: 'TeamStats', pickerType: 'teams_s7' },
  ],
  [{ id: 'm1_m5_kd', name: 'GameStanding: Match 1–5 Kills & Damage', tab: 'GameStanding' }],
  [
    { id: 'team_polar_h2h', name: 'Team H2H: Dual Polar (Pick 2 Teams)', tab: 'TeamStats', pickerType: 'teams_s8' },
    { id: 'day_top2_polar', name: 'Day Top 2 Teams: Dual Polar', tab: 'DayStanding' },
    { id: 'role_avg', name: 'Role Avg Kills vs. Avg Damage (Legacy)', tab: 'PlayerRoleStats' },
    { id: 'role_total', name: 'Role Total Kills vs. Total Damage', tab: 'PlayerRoleStats' },
    { id: 'top4_teams', name: 'Top 4 Teams: Kills vs. Placement Pts', tab: 'DayStanding' },
  ],
  [
    { id: 'day_kd_12', name: 'TeamStats: Kills vs. Total Damage (12 Teams)', tab: 'DayStanding / TeamStats' },
    { id: 'day_surv_kill', name: 'DayStanding: Survival Pts vs. Kill Pts', tab: 'DayStanding' },
    { id: 'day_kill_hs', name: 'DayStanding: Kills vs. Headshots', tab: 'DayStanding' },
    { id: 'm5_surv_kill', name: 'LastMatchStanding: Match 5 Survival vs. Kills', tab: 'LastMatchStanding' },
    { id: 'plrs_kd', name: 'Vmix: Top 10 Players Kills vs. Damage', tab: 'Vmix R78' },
    { id: 'plrs_k_hs', name: 'Vmix: Top 10 Players Kills vs. Headshots', tab: 'Vmix R78' },
  ],
  [
    { id: 'latest_h2h', name: 'Latest Match H2H (EXE vs 69)', tab: 'Vmix R43' },
    { id: 'day_top2_h2h', name: 'Day Top 2 H2H (TOP vs EXE)', tab: 'DayStanding' },
    { id: 'custom_h2h', name: 'Custom: Pick Any 2 Sheet Teams', tab: 'TeamStats', pickerType: 'teams_s4' },
  ],
];

export default function SheetDataDrawer({
  currentSlide,
  slideTitle,
  activeSourceId,
  customSettings = {},
  sheetData,
  onSelectSource,
  onUpdateCustom,
}: SheetDataDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = SLIDE_DATA_OPTIONS[currentSlide] || [];
  const currentOption = options.find((o) => o.id === activeSourceId) || options[0];
  const pickerType = currentOption?.pickerType;

  const playersList = sheetData?.dayTop10Players || [];
  const rawTeams = (sheetData?.allTeamsFull && sheetData.allTeamsFull.length > 0)
    ? sheetData.allTeamsFull
    : (sheetData?.standing12 && sheetData.standing12.length > 0)
    ? sheetData.standing12
    : DEFAULT_ALL_TEAMS;
  const teamsList = rawTeams.length > 0 ? rawTeams : DEFAULT_ALL_TEAMS;

  return (
    <div
      id="dataDrawerWrap"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center font-hud"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-4 rounded-l-xl bg-gradient-to-b from-purple-700 to-fuchsia-700 hover:from-purple-600 hover:to-fuchsia-600 border-y border-l border-purple-300/60 text-white font-hud text-xs font-bold tracking-widest shadow-2xl cursor-pointer"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {isOpen ? '▶ SHEET DATA' : '◀ SHEET DATA'}
      </button>

      {isOpen && (
        <aside
          id="dataDrawer"
          onClick={(e) => e.stopPropagation()}
          className="w-72 max-h-[76vh] overflow-y-auto admin-scroll bg-slate-950/95 border-y border-l border-purple-400/60 rounded-l-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-3 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="text-[10px] font-hud font-bold tracking-widest text-amber-300 uppercase">
                GOOGLE SHEET SOURCE
              </div>
              <div className="font-hud text-base font-bold text-white leading-tight">
                {slideTitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            {options.map((opt) => {
              const isActive = opt.id === activeSourceId || (!activeSourceId && opt.id === options[0]?.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectSource(opt.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl border font-hud transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-800/80 border-amber-400 text-white'
                      : 'bg-slate-900/90 border-white/10 text-slate-300 hover:border-purple-400'
                  }`}
                >
                  <div className="text-sm font-bold leading-tight">{opt.name}</div>
                  <div className={`text-[10px] ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                    Sheet: {opt.tab}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slide 2: Dedicated Team Head-to-Head Dropdowns (Always visible for Slide 2 Team Mode) */}
          {currentSlide === 1 && pickerType !== 'players' && (
            <div className="pt-2.5 border-t border-purple-500/30 space-y-2.5 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
              <div className="text-xs font-hud font-bold text-amber-300 flex items-center justify-between">
                <span>⚡ PICK ANY 2 TEAMS (যেকোনো ২ টিম):</span>
                <span className="text-[10px] text-purple-300 font-normal">{teamsList.length} Teams</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 block">
                  TEAM 01 (LEFT / CONTENDER 1):
                </label>
                <select
                  value={customSettings.tAIdx ?? 1}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, tAIdx: idx });
                    if (activeSourceId !== 'custom_h2h') {
                      onSelectSource('custom_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-purple-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-teal-300 block">
                  TEAM 02 (RIGHT / CONTENDER 2):
                </label>
                <select
                  value={customSettings.tBIdx ?? 7}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, tBIdx: idx });
                    if (activeSourceId !== 'custom_h2h') {
                      onSelectSource('custom_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-teal-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Slide 3: Quick Match Selector (Match 1–6 or Day Total) */}
          {currentSlide === 2 && (
            <div className="pt-2.5 border-t border-purple-500/30 space-y-2 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
              <div className="text-xs font-hud font-bold text-amber-300">
                ⚡ SELECT MATCH (যেকোনো ম্যাচ):
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'day_guns', label: 'DAY' },
                  { id: 'match_1_guns', label: 'M1' },
                  { id: 'match_2_guns', label: 'M2' },
                  { id: 'match_3_guns', label: 'M3' },
                  { id: 'match_4_guns', label: 'M4' },
                  { id: 'match_5_guns', label: 'M5' },
                  { id: 'match_6_guns', label: 'M6' },
                ].map((item) => {
                  const isActive = activeSourceId === item.id || (!activeSourceId && item.id === 'day_guns');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectSource(item.id)}
                      className={`py-1 rounded text-center text-xs font-bold font-hud transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-black font-extrabold shadow-md'
                          : 'bg-slate-900 text-slate-300 border border-white/10 hover:border-purple-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slide 4: Dedicated Team Head-to-Head Dropdowns (Always visible for Slide 4) */}
          {currentSlide === 3 && (
            <div className="pt-2.5 border-t border-purple-500/30 space-y-2.5 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
              <div className="text-xs font-hud font-bold text-amber-300 flex items-center justify-between">
                <span>⚡ PICK ANY 2 TEAMS (যেকোনো ২ টিম):</span>
                <span className="text-[10px] text-purple-300 font-normal">{teamsList.length} Teams</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 block">
                  TEAM 01 (LEFT / CONTENDER 1):
                </label>
                <select
                  value={customSettings.gAIdx ?? 1}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, gAIdx: idx });
                    if (activeSourceId !== 'custom_avg_h2h') {
                      onSelectSource('custom_avg_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-purple-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-teal-300 block">
                  TEAM 02 (RIGHT / CONTENDER 2):
                </label>
                <select
                  value={customSettings.gBIdx ?? 7}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, gBIdx: idx });
                    if (activeSourceId !== 'custom_avg_h2h') {
                      onSelectSource('custom_avg_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-teal-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Slide 8: Dedicated Team Head-to-Head Dropdowns (Always visible for Slide 8) */}
          {currentSlide === 7 && (
            <div className="pt-2.5 border-t border-purple-500/30 space-y-2.5 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
              <div className="text-xs font-hud font-bold text-amber-300 flex items-center justify-between">
                <span>⚡ SLIDE 8: PICK ANY 2 TEAMS (DUAL POLAR H2H):</span>
                <span className="text-[10px] text-purple-300 font-normal">{teamsList.length} Teams</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-300 block">
                  TEAM 01 (LEFT CIRCLE):
                </label>
                <select
                  value={customSettings.pAIdx ?? 1}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, pAIdx: idx });
                    if (activeSourceId !== 'team_polar_h2h') {
                      onSelectSource('team_polar_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-purple-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-teal-300 block">
                  TEAM 02 (RIGHT CIRCLE):
                </label>
                <select
                  value={customSettings.pBIdx ?? 7}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    onUpdateCustom({ ...customSettings, pBIdx: idx });
                    if (activeSourceId !== 'team_polar_h2h') {
                      onSelectSource('team_polar_h2h');
                    }
                  }}
                  className="w-full bg-slate-900 border border-teal-400/60 rounded-lg px-2 py-1.5 font-hud text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {teamsList.map((t: any, idx: number) => (
                    <option key={idx} value={idx}>
                      #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Pickers */}
          {pickerType === 'players' && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-xs font-hud font-bold text-amber-300">
                PICK ANY 2 PLAYERS:
              </div>
              <select
                value={customSettings.p1Idx ?? 0}
                onChange={(e) =>
                  onUpdateCustom({ ...customSettings, p1Idx: parseInt(e.target.value, 10) })
                }
                className="w-full bg-slate-900 border border-purple-400/50 rounded-lg px-2 py-1 font-hud text-sm text-white"
              >
                {playersList.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name} ({p.kills} Kills)
                  </option>
                ))}
              </select>
              <select
                value={customSettings.p2Idx ?? 1}
                onChange={(e) =>
                  onUpdateCustom({ ...customSettings, p2Idx: parseInt(e.target.value, 10) })
                }
                className="w-full bg-slate-900 border border-teal-400/50 rounded-lg px-2 py-1 font-hud text-sm text-white"
              >
                {playersList.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name} ({p.kills} Kills)
                  </option>
                ))}
              </select>
            </div>
          )}

          {pickerType && pickerType.startsWith('teams_') && currentSlide !== 1 && currentSlide !== 3 && currentSlide !== 7 && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-xs font-hud font-bold text-amber-300">
                PICK ANY 2 TEAMS:
              </div>
              {(() => {
                const kA = pickerType === 'teams_s4' ? 'tAIdx' : pickerType === 'teams_s5' ? 'gAIdx' : 'rAIdx';
                const kB = pickerType === 'teams_s4' ? 'tBIdx' : pickerType === 'teams_s5' ? 'gBIdx' : 'rBIdx';
                return (
                  <>
                    <select
                      value={customSettings[kA] ?? 0}
                      onChange={(e) =>
                        onUpdateCustom({ ...customSettings, [kA]: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-slate-900 border border-purple-400/50 rounded-lg px-2 py-1 font-hud text-sm text-white"
                    >
                      {teamsList.map((t: any, idx: number) => (
                        <option key={idx} value={idx}>
                          #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                        </option>
                      ))}
                    </select>
                    <select
                      value={customSettings[kB] ?? 1}
                      onChange={(e) =>
                        onUpdateCustom({ ...customSettings, [kB]: parseInt(e.target.value, 10) })
                      }
                      className="w-full bg-slate-900 border border-teal-400/50 rounded-lg px-2 py-1 font-hud text-sm text-white"
                    >
                      {teamsList.map((t: any, idx: number) => (
                        <option key={idx} value={idx}>
                          #{t.rank || idx + 1} {t.name} ({t.tag || 'TEAM'})
                        </option>
                      ))}
                    </select>
                  </>
                );
              })()}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
