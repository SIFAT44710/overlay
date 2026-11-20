const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('d:\\skill\\free-fire-projects\\.env.local', 'utf8');
  const getEnv = (key) => {
    const m = envContent.match(new RegExp(key + '="?([^"\\r\\n]+)"?'));
    return m ? m[1] : null;
  };

  const client_email = getEnv('GOOGLE_CLIENT_EMAIL');
  let private_key = getEnv('GOOGLE_PRIVATE_KEY');
  if (private_key) private_key = private_key.replace(/\\n/g, '\n');
  const spreadsheetId = getEnv('GOOGLE_SHEET_ID');

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const tabs = [
    'Vmix!A1:N20',
    'DayStanding!A1:N15',
    'PlayerRoleStats!A1:M10',
    'PlayerRoles!A1:J10',
    'UserInput!A1:J10',
    'PlayerData!A1:K10',
    'TeamStats!A1:J10',
    'Weapons!A1:J10',
    'GameStanding!A1:J10',
    'LastMatchStanding!A1:J10'
  ];

  for (const range of tabs) {
    try {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      console.log(`\n=== RANGE: ${range} ===`);
      const rows = res.data.values || [];
      console.log(`Row count: ${rows.length}`);
      if (rows.length > 0) {
        rows.slice(0, 4).forEach((r, idx) => {
          console.log(`Row ${idx}:`, JSON.stringify(r.slice(0, 10)));
        });
      }
    } catch (e) {
      console.log(`Error reading ${range}:`, e.message);
    }
  }
}

main().catch(console.error);
