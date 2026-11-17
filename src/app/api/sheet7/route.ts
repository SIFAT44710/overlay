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

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Vmix`;
    const res = await fetch(url, {
      next: { revalidate: 3 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sheet: HTTP ${res.status}`);
    }

    const text = await res.text();
    const rows = parseCsv(text);

    // Row 81 and 82 have Top 1 and Top 2 players
    const headers = rows[79] || [];
    const player1 = rows[80]?.slice(10, 25) || [];
    const player2 = rows[81]?.slice(10, 25) || [];

    // Format for Dashboard7 expectations:
    // [2] = player name, [3] = elims, [4] = damage, [5] = assists, [8] = headshots
    const p1Formatted = [
      '', '', player1[0] || 'TOP.1SHOVO', player1[1] || '33', player1[2] || '15358', player1[3] || '20', '', '', player1[6] || '33%'
    ];
    const p2Formatted = [
      '', '', player2[0] || 'X2.XTROV22', player2[1] || '30', player2[2] || '15907', player2[3] || '12', '', '', player2[6] || '48%'
    ];

    return NextResponse.json({ headers, player1: p1Formatted, player2: p2Formatted });
  } catch (error) {
    console.error('Error fetching sheet7 data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
