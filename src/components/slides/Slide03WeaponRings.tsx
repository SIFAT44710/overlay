'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SheetDataPayload, BroadcastThemeConfig } from '@/types/broadcast';
import { formatNumber } from '@/lib/sheetParsers';

interface SlideProps {
  sheetData?: SheetDataPayload;
  theme?: BroadcastThemeConfig;
  replayKey?: number;
  onElementClick?: (e: React.MouseEvent, group: string, key: string, label: string) => void;
  onSaveLogo?: (logoUrl: string) => void;
}

export default function Slide03WeaponRings({
  sheetData,
  theme,
  replayKey = 0,
  onElementClick,
  onSaveLogo,
}: SlideProps) {
  const [animated, setAnimated] = useState(false);
  const [prevKey, setPrevKey] = useState(replayKey);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [customLogoInput, setCustomLogoInput] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const centerLogo = theme?.custom?.s2Logo || (theme?.s2 as any)?.logoUrl || '';

  useEffect(() => {
    setPreviewLogo(centerLogo);
    setCustomLogoInput(centerLogo.startsWith('data:') ? '' : centerLogo);
  }, [centerLogo]);

  if (replayKey !== prevKey) {
    setPrevKey(replayKey);
    setAnimated(false);
  }

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 120);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(rafId);
  }, [replayKey]);

  const source = theme?.sources?.[2] || 'day_guns';
  const matchMatch = source.match(/match_(\d+)_guns/i);
  const matchNum = matchMatch ? parseInt(matchMatch[1], 10) : 0;

  let activeWeapons = sheetData?.weaponsDay;
  if (matchNum >= 1 && matchNum <= 6 && sheetData?.weaponsByMatch?.[matchNum]?.length) {
    activeWeapons = sheetData.weaponsByMatch[matchNum];
  }

  const weapons =
    activeWeapons && activeWeapons.length > 0
      ? activeWeapons
      : [
          { name: 'EVO3', kills: 256, damage: 115964, hs: 283, color: '#8b5cf6' },
          { name: 'M7', kills: 61, damage: 35086, hs: 79, color: '#2dd4bf' },
          { name: 'AWM', kills: 37, damage: 36446, hs: 11, color: '#fbbf24' },
          { name: 'UZI', kills: 24, damage: 11059, hs: 66, color: '#f43f5e' },
          { name: 'WOODPECKER', kills: 17, damage: 14844, hs: 29, color: '#38bdf8' },
        ];

  const matchBadgeLabel = matchNum >= 1
    ? `MATCH 0${matchNum} • WEAPON META RINGS`
    : 'OVERALL DAY • WEAPON META RINGS';

  const matchSubtitle = matchNum >= 1
    ? `Match 0${matchNum} Lethal Arsenal`
    : 'All Matches Most Used Guns';

  const themeS2 = theme?.s2 || {
    w0: '#8b5cf6',
    w1: '#2dd4bf',
    w2: '#fbbf24',
    w3: '#f43f5e',
    w4: '#38bdf8',
  };
  const maxK = Math.max(...weapons.map((w) => w.kills), 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPreviewLogo(base64);
        setCustomLogoInput('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveModal = () => {
    const finalUrl = customLogoInput.trim() || previewLogo;
    onSaveLogo?.(finalUrl);
    setIsLogoModalOpen(false);
  };

  const handleResetToCrown = () => {
    setPreviewLogo('');
    setCustomLogoInput('');
    onSaveLogo?.('');
    setIsLogoModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[1340px] font-hud select-none relative">
      {/* Top Header Bar: Active Match Badge & Upload Button */}
      <div className="w-full flex items-center justify-between mb-3 z-20">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-900/90 to-slate-900/90 border border-purple-500/50 text-amber-300 font-hud text-xs sm:text-sm font-extrabold tracking-wider shadow-lg">
            {matchBadgeLabel}
          </span>
          <span className="text-xs text-slate-300 font-hud tracking-wider hidden sm:inline-block">
            {matchSubtitle}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsLogoModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-purple-400/60 hover:border-amber-400 text-amber-300 hover:text-white font-hud text-xs sm:text-sm font-bold shadow-lg cursor-pointer transition-all active:scale-95"
          title="Click to upload or change center tournament logo"
        >
          <span>📷</span>
          <span>{centerLogo ? 'সেন্টার লোগো পরিবর্তন (Change Logo)' : 'সেন্টার লোগো আপলোড (Upload Logo)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full">
        {/* Concentric Target Rings with Centered Emblem or Custom Logo */}
        <div className="flex flex-col items-center justify-center">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[480px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)] overflow-visible"
          >
            <defs>
              <clipPath id="s2CenterLogoClip">
                <circle cx="160" cy="160" r="28" />
              </clipPath>
            </defs>

            {weapons.map((w, i) => {
              const r = 132 - i * 22;
              const circ = 2 * Math.PI * r;
              const frac = Math.max(0.14, (w.kills / maxK) * 0.78);
              const colKey = `w${i}` as keyof typeof themeS2;
              const col = (themeS2 as any)[colKey] || w.color;
              const targetOffset = circ * (1 - frac);

              return (
                <g key={w.name}>
                  {/* Background Ring Track */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="rgba(168,85,247,0.16)"
                    strokeWidth="14"
                  />
                  {/* Active Glowing Laser Ring */}
                  <circle
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke={col}
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(-90 160 160)"
                    className="arc-sweep neon-pulse"
                    style={{
                      color: col,
                      strokeDasharray: circ,
                      strokeDashoffset: animated ? targetOffset : circ,
                      transition: `stroke-dashoffset 1.8s cubic-bezier(0.22, 1.08, 0.36, 1) ${i * 0.15}s`,
                      animationDelay: `${(i * 0.3).toFixed(2)}s`,
                    }}
                    data-edit-group="s2"
                    data-edit-key={colKey}
                    onClick={(e) => onElementClick?.(e, 's2', colKey, `${w.name} Ring`)}
                  />
                </g>
              );
            })}

            {/* Centered Area: Either Uploaded Custom Logo or Crown Emblem */}
            <g
              onClick={() => setIsLogoModalOpen(true)}
              className="cursor-pointer group"
            >
              <title>Click to change center logo</title>
              <circle
                cx="160"
                cy="160"
                r="28"
                fill="#0b0f1d"
                stroke="#F5B700"
                strokeWidth="2.8"
                className="group-hover:stroke-amber-300 transition-all"
              />
              {centerLogo ? (
                <>
                  <image
                    href={centerLogo}
                    x="132"
                    y="132"
                    width="56"
                    height="56"
                    clipPath="url(#s2CenterLogoClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="28"
                    fill="none"
                    stroke="#F5B700"
                    strokeWidth="2.2"
                  />
                </>
              ) : (
                <g transform="translate(160,160)">
                  <polygon points="-13,7 -16,-7 -7,-1 0,-11 7,-1 16,-7 13,7" fill="#F5B700" />
                  <rect x="-13" y="9" width="26" height="3.5" rx="1.5" fill="#EC008C" />
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* Right-Side Weapon Metric Cards with Full Numbers (Zero 'K') */}
        <div className="space-y-3">
          {weapons.map((w, i) => {
            const colKey = `w${i}` as keyof typeof themeS2;
            const col = (themeS2 as any)[colKey] || w.color;
            const barW = Math.max(12, Math.round((w.kills / maxK) * 100));
            const isTopWeapon = i === 0;

            return (
              <div
                key={w.name}
                className="pop-card hud-card rounded-xl p-4 transition-all relative cursor-pointer hover:border-white/50"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated
                    ? isTopWeapon
                      ? 'translateX(0) scale(1.03)'
                      : 'translateX(0)'
                    : 'translateX(28px)',
                  transition: `transform 0.85s cubic-bezier(0.22, 1.15, 0.36, 1) ${i * 0.12}s, opacity 0.65s ease ${i * 0.12}s`,
                }}
                onClick={(e) => onElementClick?.(e, 's2', colKey, `${w.name} Color`)}
                title={`Click to change ${w.name} ring and bar color`}
              >
                <div className="flex justify-between items-center mb-1.5 relative z-10">
                  <span className="font-hud text-xl font-bold text-white flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: col }}
                    />
                    {w.name}
                  </span>
                  <span className="font-hud text-xl font-extrabold" style={{ color: col }}>
                    {formatNumber(w.kills)} KILLS
                  </span>
                </div>

                {/* Glowing Bar */}
                <div className="w-full h-4 bg-purple-950/30 rounded-full overflow-hidden relative z-10">
                  <div
                    className="bar-grow-x bar-live h-full rounded-full"
                    style={{
                      backgroundColor: col,
                      width: animated ? `${barW}%` : '0%',
                      transition: `width 1.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + i * 0.12}s`,
                    }}
                  />
                </div>

                {/* Full Damage & Headshot Exact Numbers */}
                <div className="flex justify-between text-base text-slate-200 mt-1.5 font-extrabold relative z-10">
                  <span>DMG: {formatNumber(w.damage)}</span>
                  <span>HEADSHOTS: {formatNumber(w.hs)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Logo Upload / Management Modal */}
      {isLogoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setIsLogoModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-950 border border-purple-400/70 rounded-2xl p-5 shadow-2xl space-y-4 font-hud"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-xs text-purple-300 font-bold tracking-wider">
                  SLIDE 03 CUSTOM LOGO
                </div>
                <div className="text-lg font-bold text-white">সেন্টার লোগো পরিবর্তন / আপলোড</div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current / Preview Image Display */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="w-20 h-20 rounded-full border-2 border-amber-400 bg-slate-950 overflow-hidden flex items-center justify-center shadow-lg relative">
                {previewLogo ? (
                  <img
                    src={previewLogo}
                    alt="Center Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-amber-400 text-3xl">👑</div>
                )}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {previewLogo ? 'লাইভ প্রিভিউ (Active Preview)' : 'ডিফল্ট ক্রাউন অ্যাম্ব্লেম (Default Crown)'}
              </span>
            </div>

            {/* Option 1: File Upload */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">
                ১. কম্পিউটার থেকে লোগো আপলোড করুন (.PNG / .JPG):
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />
            </div>

            {/* Option 2: Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">
                ২. অথবা Google Drive / Web ইমেজ লিংক দিন:
              </label>
              <input
                type="text"
                placeholder="https://drive.google.com/... বা https://..."
                value={customLogoInput}
                onChange={(e) => {
                  setCustomLogoInput(e.target.value);
                  setPreviewLogo(e.target.value);
                }}
                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveModal}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg cursor-pointer transition-all"
              >
                ✓ লোগো সেভ করুন (Save)
              </button>
              {centerLogo && (
                <button
                  type="button"
                  onClick={handleResetToCrown}
                  className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold text-xs cursor-pointer transition-all"
                  title="Revert back to default crown"
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
