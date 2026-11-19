import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory global store for live broadcast themes
// This allows OBS/vMix browser sources on one machine to update when an admin on another machine changes colors.
let broadcastThemes: Record<string, any> = {
  dashboard1: {
    bgColor: '#18191a',
    barFill: '#ffffff',
    lineStroke: '#ffc600',
    lineLabel: '#000000',
    barLabel: '#000000',
    axisText: '#ffffff',
  },
  dashboard2: {
    bgColor: '#18191a',
    primaryBar: '#000000',
    secondaryBar: '#692fb2',
    barText: '#ffffff',
    axisText: '#000000',
    axisLine: '#000000',
  },
  dashboard3: {
    bgColor: '#18191a',
    killPoints: '#00ffa3',
    survivalScore: '#ffea00',
    damage: '#ff00a0',
    axisTextLeft: '#ffffff80',
    axisTextRight: '#ff00a0',
  },
  dashboard4: {
    bgColor: '#18191a',
    team1: '#1f2937',
    team2: '#692fb2',
    radarTick: '#692fb2',
    radarGrid: '#1f2937',
  },
  dashboard5: {
    team1: '#000000',
    team2: '#692fb2',
    lineStroke: '#6b7280',
    textColor: '#ffffff',
  },
  dashboard6: {
    radarFill: '#692fb2',
    badgeBg: '#000000',
    badgeBorder: '#692fb2',
    badgeText: '#ffffff',
    gridStroke: '#333333',
  },
  dashboard7: {
    player1Color: '#000000',
    player2Color: '#692fb2',
    borderColor: '#004b87',
    textColor: '#ffffff',
    labelColor: '#ffffff',
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    themes: broadcastThemes,
    updatedAt: Date.now(),
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
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
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
