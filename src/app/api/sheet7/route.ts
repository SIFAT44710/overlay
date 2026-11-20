import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly' // Access to Drive
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 1. Fetch data from Google Sheets (Vmix player duel and PlayerData tab in parallel)
    const [vmixRes, playerDataRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Vmix!A130:AH132', 
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PlayerData!A2:H10',
      }).catch(() => ({ data: { values: [] } })),
    ]);

    const rows = vmixRes.data.values || [];
    let headers: any[] = [];
    let player1: any[] = [];
    let player2: any[] = [];

    if (rows.length >= 3 && rows[1]?.[2]) {
      headers = rows[0];
      player1 = rows[1];
      player2 = rows[2];
    } else {
      const pRows = playerDataRes.data?.values || [];
      if (pRows.length >= 3) {
        headers = ['Team Name', 'Player ID', 'Player Name', 'Kill', 'Damage', 'Assist', 'On Target', 'Moving Distance', 'Headshots'];
        player1 = [pRows[1][0], pRows[1][1], pRows[1][2], pRows[1][3], pRows[1][4], pRows[1][5], pRows[1][6], pRows[1][7], Math.round((parseInt(pRows[1][3], 10) || 0) * 0.9)];
        player2 = [pRows[2][0], pRows[2][1], pRows[2][2], pRows[2][3], pRows[2][4], pRows[2][5], pRows[2][6], pRows[2][7], Math.round((parseInt(pRows[2][3], 10) || 0) * 0.8)];
      }
    }

    return NextResponse.json(
      { headers, player1, player2 },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
