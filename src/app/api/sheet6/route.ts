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

    // Row 31/32 or Row 33 has MVP data
    const headers = rows[31] || rows[30] || [];
    const mvpData = rows[32] || [];

    return NextResponse.json({ headers, mvpData });
  } catch (error) {
    console.error('Error fetching sheet6 data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
