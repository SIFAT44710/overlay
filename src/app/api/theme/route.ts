import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredThemes,
  saveThemeToSheet,
  saveMultipleThemesToSheet,
} from '@/lib/googleSheets';
import { isRequestAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default base themes across all 14 slides
const DEFAULT_BROADCAST_THEMES: Record<string, any> = {
  dashboard1: {
    headerGold: '#F5B700',
    headerPurple: '#6225A6',
    headerDark: '#2E0E56',
    totalPtsGold: '#F5B700',
    fireColor: '#8B5CF6',
  },
  dashboard2: {
    lineStroke: '#ffc600',
    dotFill: '#ffffff',
    fireColor: '#F5B700',
  },
  dashboard3: {
    p1Color: '#ffffff',
    p2Color: '#6225A6',
    accentGold: '#F5B700',
    fireColor: '#6225A6',
  },
  dashboard4: {
    ring1: '#8B5CF6',
    ring2: '#EC008C',
    ring3: '#F5B700',
    ring4: '#00DF82',
    ring5: '#38BDF8',
    fireColor: '#8B5CF6',
  },
  dashboard5: {
    role1: '#38BDF8',
    role2: '#E11D48',
    role3: '#F5B700',
    role4: '#A78BFA',
    fireColor: '#F5B700',
  },
  dashboard6: {
    booyahBadge: '#F5B700',
    barSurvival: '#2DD4BF',
    barKills: '#8B5CF6',
    fireColor: '#2DD4BF',
  },
  dashboard7: {
    teamA: '#6225A6',
    teamB: '#00DF82',
    accentGold: '#F5B700',
    fireColor: '#6225A6',
  },
  dashboard8: {
    team1Color: '#F5B700',
    team2Color: '#6225A6',
    fireColor: '#F5B700',
  },
  dashboard9: {
    team1: '#8B5CF6',
    team2: '#2DD4BF',
    fireColor: '#8B5CF6',
  },
  dashboard10: {
    accentColor: '#FBBF24',
    fireColor: '#F5B700',
  },
  dashboard11: {
    headerColor: '#F5B700',
    fireColor: '#F5B700',
  },
  dashboard12: {
    rank1Color: '#E11D48',
    rank2Color: '#A78BFA',
    fireColor: '#E11D48',
  },
  dashboard13: {
    killsColor: '#F5B700',
    damageColor: '#38BDF8',
    fireColor: '#8B5CF6',
  },
  dashboard14: {
    headerKills: '#2DD4BF',
    headerDamage: '#F59E0B',
    fireColor: '#8B5CF6',
  },
};

// GET /api/theme -> Public endpoint for OBS / vMix overlays (reads from Google Sheet ThemeConfig)
export async function GET(req: NextRequest) {
  try {
    const fresh = req.nextUrl?.searchParams?.get('fresh') === '1';
    const storedThemes = await getStoredThemes(fresh);

    // Merge persistent stored themes over defaults
    const mergedThemes: Record<string, any> = { ...DEFAULT_BROADCAST_THEMES };
    Object.entries(storedThemes).forEach(([key, val]) => {
      mergedThemes[key] = {
        ...(mergedThemes[key] || {}),
        ...(typeof val === 'object' ? val : {}),
      };
    });

    return NextResponse.json(
      {
        success: true,
        themes: mergedThemes,
        meta: {
          isLive: true,
          sourceTab: 'ThemeConfig!A1:B30',
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
    const { slideKey, colors, themes } = body;

    let saved = false;
    if (themes && typeof themes === 'object') {
      saved = await saveMultipleThemesToSheet(themes);
    } else if (slideKey && colors && typeof colors === 'object') {
      saved = await saveThemeToSheet(slideKey, colors);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payload. Provide slideKey + colors or themes object.' },
        { status: 400 }
      );
    }

    const updatedThemes = await getStoredThemes(true);

    return NextResponse.json({
      success: saved,
      themes: { ...DEFAULT_BROADCAST_THEMES, ...updatedThemes },
      message: saved
        ? 'Theme persistently saved to Google Sheet (ThemeConfig tab).'
        : 'Saved to memory cache (Google Sheet write warning).',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Theme API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save theme' },
      { status: 500 }
    );
  }
}
