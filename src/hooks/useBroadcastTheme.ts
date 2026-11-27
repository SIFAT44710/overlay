// SWR Client Hook for Live Theme Sync & CSS Variables Application
// Polls /api/theme with snapshot memoization to eliminate flickering in vMix/OBS

'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { BroadcastThemeConfig } from '@/types/broadcast';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch theme`);
  return res.json();
};

export const DEFAULT_THEMES: BroadcastThemeConfig = {
  global: { textColor: '#ffffff', boxBg: '#0a0c16', boxBorder: '#8b5cf6', boxAlpha: 0.94 },
  s0: { l0: '#fbbf24', l1: '#a78bfa', l2: '#2dd4bf', l3: '#f43f5e', l4: '#38bdf8' },
  s1: { p1: '#8b5cf6', p2: '#2dd4bf', accent: '#fbbf24' },
  s2: { w0: '#8b5cf6', w1: '#2dd4bf', w2: '#fbbf24', w3: '#f43f5e', w4: '#38bdf8' },
  s3: { teamA: '#8b5cf6', teamB: '#2dd4bf' },
  s4: { teamA: '#8b5cf6', teamB: '#2dd4bf' },
  s5: {
    c0: '#F5B700', c1: '#E11D48', c2: '#8B5CF6', c3: '#2DD4BF', c4: '#38BDF8', c5: '#6366F1',
    c6: '#A78BFA', c7: '#F43F5E', c8: '#14B8A6', c9: '#60A5FA', c10: '#94A3B8', c11: '#64748B',
  },
  s6: { rank1: '#E11D48', rank2: '#A78BFA', outerBox: '#090b12' },
  s7: { kills: '#F5B700', damage: '#38BDF8' },
  s8: {
    rusher: '#EF4444', support: '#22C55E', sniper: '#A855F7', bomber: '#FACC15',
    a_rusher: '#EF4444', a_support: '#22C55E', a_sniper: '#A855F7', a_bomber: '#FACC15',
    b_rusher: '#38BDF8', b_support: '#2DD4BF', b_sniper: '#F5B700', b_bomber: '#E11D48',
  },
  s9: { kills: '#F5B700', damage: '#38BDF8' },
  sources: {
    0: 'top5_m1_m5',
    1: 'latest_h2h',
    2: 'day_guns',
    3: 'group_avg_h2h',
    4: 'day_pts',
    5: 'latest_h2h',
    6: 'm1_m5_kd',
    7: 'sheet_h2h_polar',
    8: 'day_kd_12',
    9: 'latest_h2h',
  },
  disabledSlides: {},
  custom: { p1Idx: 0, p2Idx: 1, tAIdx: 0, tBIdx: 1, gAIdx: 0, gBIdx: 1, rAIdx: 0, rBIdx: 1, pAIdx: 0, pBIdx: 1, s2Logo: '' },
};

const STORAGE_KEY = 'dg_broadcast_themes_v3';

function getInitialThemes(): BroadcastThemeConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_THEMES, ...parsed };
      }
    } catch {}
  }
  return DEFAULT_THEMES;
}

export function useBroadcastTheme() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    themes: BroadcastThemeConfig;
    meta?: any;
  }>('/api/theme', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
    keepPreviousData: true,
  });

  const [stableThemes, setStableThemes] = useState<BroadcastThemeConfig>(getInitialThemes);
  const lastSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (!data?.themes) return;
    let localOverrides: Record<string, any> = {};
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) localOverrides = JSON.parse(stored);
      } catch {}
    }

    // Deep merge data.themes with local overrides
    const merged: Record<string, any> = { ...DEFAULT_THEMES, ...data.themes };
    Object.entries(localOverrides).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v) && typeof merged[k] === 'object') {
        merged[k] = { ...merged[k], ...v };
      } else {
        merged[k] = v;
      }
    });

    const snap = JSON.stringify(merged);
    if (snap !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snap;
      setStableThemes(merged as BroadcastThemeConfig);
    }
  }, [data?.themes]);

  // Apply CSS custom properties to root document ONLY when global tokens actually change
  const lastGlobalTokensRef = useRef<string>('');
  useEffect(() => {
    if (typeof document !== 'undefined' && stableThemes?.global) {
      const g = stableThemes.global;
      const tokenSignature = `${g.textColor}_${g.boxBg}_${g.boxBorder}_${g.boxAlpha}`;
      if (tokenSignature !== lastGlobalTokensRef.current) {
        lastGlobalTokensRef.current = tokenSignature;
        const root = document.documentElement;
        root.style.setProperty('--ui-text', g.textColor || '#ffffff');
        root.style.setProperty('--ui-box-bg', g.boxBg || '#0a0c16');
        root.style.setProperty('--ui-box-border', g.boxBorder || '#8b5cf6');
        root.style.setProperty('--ui-box-alpha', String(g.boxAlpha ?? 0.94));
      }
    }
  }, [stableThemes?.global]);

  const saveThemeUpdates = async (payload: Record<string, any>): Promise<boolean> => {
    // 1. Immediately persist to localStorage for instant persistence across reloads & SWR polls
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const prev = stored ? JSON.parse(stored) : {};
        const next = { ...prev };
        Object.entries(payload).forEach(([k, v]) => {
          if (typeof v === 'object' && v !== null && !Array.isArray(v) && typeof next[k] === 'object') {
            next[k] = { ...next[k], ...v };
          } else {
            next[k] = v;
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
    }

    // 2. Update local state immediately
    setStableThemes((prev) => {
      const next = { ...prev };
      Object.entries(payload).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null && !Array.isArray(v) && typeof (next as any)[k] === 'object') {
          (next as any)[k] = { ...(next as any)[k], ...v };
        } else {
          (next as any)[k] = v;
        }
      });
      return next;
    });

    // 3. Post to API to persist to server memory & Google Sheet
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: payload, ...payload }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.themes) {
          mutate(json, false);
        } else {
          mutate();
        }
        return true;
      }
      return true; // Still true because localStorage & in-memory updated
    } catch {
      return true; // Still true because localStorage updated
    }
  };

  return {
    themes: stableThemes,
    isLoading: isLoading && !data,
    isError: !!error,
    saveThemeUpdates,
    mutateTheme: () => mutate(),
  };
}
