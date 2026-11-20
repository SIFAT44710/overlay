import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory global store for live broadcast themes across all 14 slides
let broadcastThemes: Record<string, any> = {
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

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      themes: broadcastThemes,
      updatedAt: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slideKey, colors } = body;

    if (slideKey && colors) {
      broadcastThemes[slideKey] = {
        ...broadcastThemes[slideKey],
        ...colors,
      };
    } else if (body.themes) {
      broadcastThemes = {
        ...broadcastThemes,
        ...body.themes,
      };
    }

    return NextResponse.json({
      success: true,
      themes: broadcastThemes,
      updatedAt: Date.now(),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
