import { NextRequest, NextResponse } from 'next/server';
import { getStoredThemeConfig, saveThemeConfigToSheet } from '@/lib/googleClient';
import { isRequestAuthenticated } from '@/lib/authSession';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const DEFAULT_BROADCAST_THEMES: Record<string, any> = {
  global: {
    textColor: '#ffffff',
    boxBg: '#0a0c16',
    boxBorder: '#8b5cf6',
    boxAlpha: 0.94,
  },
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
  custom: {
    p1Idx: 0,
    p2Idx: 1,
    tAIdx: 1,
    tBIdx: 7,
    gAIdx: 7,
    gBIdx: 3,
    rAIdx: 0,
    rBIdx: 1,
    s2Logo: '',
  },
};

// GET /api/theme -> Public endpoint for OBS / vMix overlays (reads from ThemeConfig tab)
export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';
    const storedConfig = await getStoredThemeConfig(fresh);

    // Merge persistent stored themes over defaults
    const merged: Record<string, any> = { ...DEFAULT_BROADCAST_THEMES };
    Object.entries(storedConfig).forEach(([key, val]) => {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        merged[key] = { ...(merged[key] || {}), ...val };
      } else {
        merged[key] = val;
      }
    });

    return NextResponse.json(
      {
        success: true,
        themes: merged,
        meta: {
          isLive: true,
          sourceTab: 'ThemeConfig!A1:B50',
          cached: !fresh,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[Theme API] GET error:', error);
    return NextResponse.json({
      success: true,
      themes: DEFAULT_BROADCAST_THEMES,
      meta: { isLive: false, fallback: true },
    });
  }
}

// POST /api/theme -> Protected endpoint (Admin session required)
export async function POST(req: NextRequest) {
  try {
    const isAuth = await isRequestAuthenticated(req);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { updates, slideKey, colors, themes, sources, custom, config, ...rest } = body;

    const payloadToSave: Record<string, any> = {};

    if (updates && typeof updates === 'object') {
      Object.assign(payloadToSave, updates);
    }
    if (themes && typeof themes === 'object') {
      Object.assign(payloadToSave, themes);
    }
    if (slideKey && colors && typeof colors === 'object') {
      payloadToSave[slideKey] = colors;
    }
    if (sources && typeof sources === 'object') {
      payloadToSave.sources = sources;
    }
    if (custom && typeof custom === 'object') {
      payloadToSave.custom = custom;
    }
    if (config && typeof config === 'object') {
      if (config.sheetId) payloadToSave._config_sheetId = config.sheetId;
      if (config.driveFolderId !== undefined) payloadToSave._config_driveFolderId = config.driveFolderId;
      if (config.apiKey !== undefined) payloadToSave._config_apiKey = config.apiKey;
    }

    // Accept direct group keys passed at root level (e.g. { s9: { kills: '#F5B700' } } or { global: { ... } })
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v) && typeof payloadToSave[k] === 'object') {
          payloadToSave[k] = { ...payloadToSave[k], ...v };
        } else {
          payloadToSave[k] = v;
        }
      }
    }

    if (Object.keys(payloadToSave).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload. Nothing to save.' },
        { status: 400 }
      );
    }

    const saved = await saveThemeConfigToSheet(payloadToSave);
    const updated = await getStoredThemeConfig(true);

    return NextResponse.json({
      success: saved,
      themes: { ...DEFAULT_BROADCAST_THEMES, ...updated },
      message: saved
        ? 'Settings persistently saved to Google Sheet (ThemeConfig tab).'
        : 'Saved to memory cache (Google Sheet write warning).',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Theme API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save theme configuration' },
      { status: 500 }
    );
  }
}
