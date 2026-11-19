import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1c8ZAYnqkLaJdPXIJthoD3ub7AwkqIM1XlhPoICia8IE';

function parseCsv(t: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = '';
  let inQuotes = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '"') {
      if (inQuotes && t[i + 1] === '"') {
        val += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      cur.push(val.trim());
      val = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && t[i + 1] === '\n') i++;
      cur.push(val.trim());
      if (cur.some((x) => x !== '')) rows.push(cur);
      cur = [];
      val = '';
    } else {
      val += c;
    }
  }
  if (val || cur.length > 0) {
    cur.push(val.trim());
    if (cur.some((x) => x !== '')) rows.push(cur);
  }
  return rows;
}

function getLogoUrl(teamName: string, idx: number): string {
  const norm = (teamName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const localMap: Record<string, string> = {
    bangladeshtop1: '/BANGLADESH TOP 1.png',
    darkvortex: '/DARK VORTEX.png',
    fromthefuture: '/FROM THE FUTURE.png',
    fusionphoenix: '/FUSION PHOENIX.png',
    redcliff: '/RED CLIFF.png',
    tarnixesports: '/TARNIX ESPORTS.png',
    teamelectro: '/TEAM ELECTRO.png',
    teaminfinity: '/TEAM INFINITY.png',
    teamrage: '/TEAM RAGE.png',
    titanesportsclub: '/TITAN ESPORTS CLUB.png',
    warriorsesports: '/WARRIORS ESPORTS.png',
    x2global: '/X2 GLOBAL.png',
  };

  for (const [key, path] of Object.entries(localMap)) {
    if (norm.includes(key) || key.includes(norm)) {
      return path;
    }
  }

  // Fallback to high-contrast avatar with team initials
  const initials = teamName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'FF';

  const colors = ['1877f2', '692fb2', 'ff4500', '00ffa3', 'ffc600', '00e5ff', 'ff007f', 'e53e3e'];
  const bg = colors[idx % colors.length];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=128&bold=true`;
}

let memoryCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 2500; // 2.5s cache for ultra-low latency & 0ms overhead on live streams

export async function GET() {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(memoryCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=5',
        'X-Cache-Status': 'HIT',
      },
    });
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Vmix`;
    const res = await fetch(url, {
      next: { revalidate: 2 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      if (memoryCache) {
        return NextResponse.json(memoryCache.data, { headers: { 'X-Cache-Status': 'STALE-FALLBACK' } });
      }
      throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
    }

    const text = await res.text();
    const rows = parseCsv(text);

    if (!rows || rows.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // Rows 1 to 12 in Vmix are the 12 teams for Match Standing
    const teams = rows.slice(1, 13).map((r, idx) => {
      const teamName = r[4] || '';
      return {
        TeamName: teamName,
        'Survival Score': r[5] || '0',
        Kill: r[6] || '0',
        Total: r[7] || '0',
        Booyah: r[8] || '0',
        Damage: r[9] || '0',
        LogoUrl: getLogoUrl(teamName, idx),
      };
    });

    const responsePayload = { data: teams };
    memoryCache = { data: responsePayload, timestamp: now };

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=5',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    if (memoryCache) {
      return NextResponse.json(memoryCache.data, { headers: { 'X-Cache-Status': 'ERROR-FALLBACK' } });
    }
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
