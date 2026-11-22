// SWR Client Hook for Live Theme Sync & CSS Variables Application
// Polls /api/theme every 2.0s so admin changes update live in vMix/OBS without reload

'use client';

import { useEffect } from 'react';
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
  s8: { rusher: '#EF4444', support: '#22C55E', sniper: '#A855F7', bomber: '#FACC15' },
  s9: { kills: '#F5B700', damage: '#38BDF8' },
  sources: {
    0: 'top5_m1_m5',
    1: 'day_top2_duel',
    2: 'day_guns',
    3: 'latest_h2h',
    4: 'group_avg_h2h',
    5: 'day_pts',
    6: 'day_top2_radar',
    7: 'm1_m5_kd',
    8: 'role_avg',
    9: 'day_kd_12',
  },
  custom: { p1Idx: 0, p2Idx: 1, tAIdx: 1, tBIdx: 7, gAIdx: 7, gBIdx: 3, rAIdx: 0, rBIdx: 1 },
};

export function useBroadcastTheme() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    themes: BroadcastThemeConfig;
    meta?: any;
  }>('/api/theme', fetcher, {
    refreshInterval: 2000, // Poll every 2 seconds
    revalidateOnFocus: true,
    dedupingInterval: 1500,
    keepPreviousData: true,
  });

  const themes: BroadcastThemeConfig = data?.themes || DEFAULT_THEMES;

  // Apply CSS custom properties to root document
  useEffect(() => {
    if (typeof document !== 'undefined' && themes?.global) {
      const root = document.documentElement;
      root.style.setProperty('--ui-text', themes.global.textColor || '#ffffff');
      root.style.setProperty('--ui-box-bg', themes.global.boxBg || '#0a0c16');
      root.style.setProperty('--ui-box-border', themes.global.boxBorder || '#8b5cf6');
      root.style.setProperty('--ui-box-alpha', String(themes.global.boxAlpha ?? 0.94));
    }
  }, [themes]);

  const saveThemeUpdates = async (payload: Record<string, any>): Promise<boolean> => {
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        mutate();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    themes,
    isLoading,
    isError: !!error,
    saveThemeUpdates,
    refreshTheme: () => mutate(),
  };
}
