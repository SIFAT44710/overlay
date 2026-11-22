import { google } from 'googleapis';

// --- Types ---
export interface DriveFileItem {
  id: string;
  name: string;
}

export interface SheetCacheEntry {
  values: any[][];
  timestamp: number;
}

export interface CacheStats {
  cachedRanges: string[];
  oldestCacheAgeMs: number;
  driveLogosCount: number;
  driveCacheAgeMs: number;
  staleRangesCount: number;
}

// --- In-Memory TTL Cache ---
const SHEET_CACHE_TTL_MS = 3000; // 3 seconds TTL
const DRIVE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes TTL

const sheetCache = new Map<string, SheetCacheEntry>();
const staleSheetCache = new Map<string, any[][]>();

let driveCache: { files: DriveFileItem[]; timestamp: number } | null = null;
let themeCache: { themes: Record<string, any>; timestamp: number } | null = null;

let authClientInstance: any = null;
let sheetsClientInstance: any = null;
let driveClientInstance: any = null;

// --- Centralized Auth & Client Provider ---
export function getGoogleClients() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !rawKey || !sheetId) {
    throw new Error('Missing Google Service Account credentials or GOOGLE_SHEET_ID in environment.');
  }

  if (!authClientInstance) {
    const privateKey = rawKey.replace(/\\n/g, '\n');
    authClientInstance = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    sheetsClientInstance = google.sheets({ version: 'v4', auth: authClientInstance });
    driveClientInstance = google.drive({ version: 'v3', auth: authClientInstance });
  }

  return {
    auth: authClientInstance,
    sheets: sheetsClientInstance,
    drive: driveClientInstance,
    sheetId,
    driveFolderId,
  };
}

// --- Safe Parsing Utilities (Prevents NaN & Broken Overlays) ---
export function safeInt(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val);
  const clean = String(val).replace(/[^0-9.-]/g, '').trim();
  if (!clean) return fallback;
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeFloat(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const clean = String(val).replace(/[^0-9.-]/g, '').trim();
  if (!clean) return fallback;
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
}

export function normalizeStr(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// --- Cached Google Drive Logos (10 min TTL) ---
export async function getDriveLogos(fresh = false): Promise<DriveFileItem[]> {
  const now = Date.now();
  if (!fresh && driveCache && now - driveCache.timestamp < DRIVE_CACHE_TTL_MS) {
    return driveCache.files;
  }

  try {
    const { drive, driveFolderId } = getGoogleClients();
    if (!driveFolderId) return [];

    const res = await drive.files.list({
      q: `'${driveFolderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });

    const files = (res.data.files || []) as DriveFileItem[];
    driveCache = { files, timestamp: now };
    return files;
  } catch (error) {
    console.warn('[GoogleDrive] Failed to list drive files. Using fallback/cache:', error);
    return driveCache ? driveCache.files : [];
  }
}

export function resolveTeamLogo(
  teamName: string,
  tagName: string,
  driveFiles: DriveFileItem[]
): string {
  const normTeam = normalizeStr(teamName);
  const normTag = normalizeStr(tagName);

  // Check drive files
  for (const file of driveFiles) {
    if (file.name) {
      const fileNameWithoutExt = normalizeStr(file.name.replace(/\.[^/.]+$/, ''));
      if (
        (normTeam && (fileNameWithoutExt.includes(normTeam) || normTeam.includes(fileNameWithoutExt))) ||
        (normTag && (fileNameWithoutExt === normTag || fileNameWithoutExt.includes(normTag)))
      ) {
        return `https://drive.google.com/thumbnail?id=${file.id}&sz=w150`;
      }
    }
  }

  // Fallback to demo logo in Drive if present
  const demoFile = driveFiles.find((f) => f.name && normalizeStr(f.name) === 'demopng');
  if (demoFile) {
    return `https://drive.google.com/thumbnail?id=${demoFile.id}&sz=w150`;
  }

  // Fallback avatar with team tag or initial
  const label = (tagName || teamName || 'FF').slice(0, 4).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    label
  )}&background=18191a&color=fff&size=128&bold=true`;
}

// --- Batch Sheet Data with TTL & Stale-While-Revalidate Fallback ---
export async function getBatchSheetRanges(
  ranges: string[],
  fresh = false
): Promise<Record<string, any[][]>> {
  const now = Date.now();
  const result: Record<string, any[][]> = {};
  const rangesToFetch: string[] = [];

  for (const r of ranges) {
    const cached = sheetCache.get(r);
    if (!fresh && cached && now - cached.timestamp < SHEET_CACHE_TTL_MS) {
      result[r] = cached.values;
    } else {
      rangesToFetch.push(r);
    }
  }

  // If all requested ranges are fresh in memory, return immediately
  if (rangesToFetch.length === 0) {
    return result;
  }

  try {
    const { sheets, sheetId } = getGoogleClients();
    const batchRes = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: rangesToFetch,
    });

    const valueRanges = batchRes.data.valueRanges || [];
    valueRanges.forEach((vr: any, idx: number) => {
      const originalRange = rangesToFetch[idx] || vr.range;
      const values = vr.values || [];
      sheetCache.set(originalRange, { values, timestamp: now });
      staleSheetCache.set(originalRange, values);
      result[originalRange] = values;
    });

    return result;
  } catch (error) {
    console.error('[GoogleSheets] batchGet failed. Attempting stale-while-revalidate fallback:', error);
    // Stale-While-Revalidate: return last valid data if available
    for (const r of rangesToFetch) {
      if (staleSheetCache.has(r)) {
        result[r] = staleSheetCache.get(r)!;
      } else {
        result[r] = [];
      }
    }
    return result;
  }
}

// --- Persistent Theme Storage in ThemeConfig Tab ---
const THEME_TAB = 'ThemeConfig';
const THEME_RANGE = `${THEME_TAB}!A1:B30`;

export async function getStoredThemes(fresh = false): Promise<Record<string, any>> {
  const now = Date.now();
  if (!fresh && themeCache && now - themeCache.timestamp < 10000) {
    return themeCache.themes;
  }

  try {
    const { sheets, sheetId } = getGoogleClients();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: THEME_RANGE,
    }).catch(async (err: any) => {
      // Auto-create ThemeConfig tab if not existing
      if (err.message && err.message.includes('Unable to parse range')) {
        await ensureThemeTabExists();
      }
      return { data: { values: [] } };
    });

    const rows = res.data?.values || [];
    const themes: Record<string, any> = {};

    rows.forEach((row: any[]) => {
      const key = safeString(row[0]);
      const jsonStr = safeString(row[1]);
      if (key && jsonStr) {
        try {
          themes[key] = JSON.parse(jsonStr);
        } catch {
          themes[key] = jsonStr;
        }
      }
    });

    themeCache = { themes, timestamp: now };
    return themes;
  } catch (error) {
    console.warn('[ThemeConfig] Failed to fetch theme from Google Sheets:', error);
    return themeCache ? themeCache.themes : {};
  }
}

async function ensureThemeTabExists(): Promise<void> {
  try {
    const { sheets, sheetId } = getGoogleClients();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const exists = meta.data.sheets?.some((s: any) => s.properties?.title === THEME_TAB);
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: THEME_TAB,
                  gridProperties: { rowCount: 50, columnCount: 5 },
                },
              },
            },
          ],
        },
      });
    }
  } catch (err) {
    console.warn('[ThemeConfig] Tab ensure notice:', err);
  }
}

export async function saveThemeToSheet(slideKey: string, colors: Record<string, string>): Promise<boolean> {
  try {
    await ensureThemeTabExists();
    const currentThemes = await getStoredThemes(true);
    currentThemes[slideKey] = colors;

    const rows = Object.entries(currentThemes).map(([k, v]) => [
      k,
      typeof v === 'string' ? v : JSON.stringify(v),
    ]);

    const { sheets, sheetId } = getGoogleClients();
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${THEME_TAB}!A1:B${rows.length}`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });

    themeCache = { themes: currentThemes, timestamp: Date.now() };
    return true;
  } catch (error) {
    console.error('[ThemeConfig] Failed to save theme to Google Sheets:', error);
    return false;
  }
}

export async function saveMultipleThemesToSheet(
  themesToSave: Record<string, Record<string, string>>
): Promise<boolean> {
  try {
    await ensureThemeTabExists();
    const currentThemes = await getStoredThemes(true);
    Object.assign(currentThemes, themesToSave);

    const rows = Object.entries(currentThemes).map(([k, v]) => [
      k,
      typeof v === 'string' ? v : JSON.stringify(v),
    ]);

    const { sheets, sheetId } = getGoogleClients();
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${THEME_TAB}!A1:B${rows.length}`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });

    themeCache = { themes: currentThemes, timestamp: Date.now() };
    return true;
  } catch (error) {
    console.error('[ThemeConfig] Failed to save multiple themes to Google Sheets:', error);
    return false;
  }
}

// --- Health & Cache Diagnostic Helper ---
export function getSheetsCacheStats(): CacheStats {
  const now = Date.now();
  const ranges = Array.from(sheetCache.keys());
  let oldestAge = 0;
  sheetCache.forEach((entry) => {
    const age = now - entry.timestamp;
    if (age > oldestAge) oldestAge = age;
  });

  return {
    cachedRanges: ranges,
    oldestCacheAgeMs: oldestAge,
    driveLogosCount: driveCache ? driveCache.files.length : 0,
    driveCacheAgeMs: driveCache ? now - driveCache.timestamp : -1,
    staleRangesCount: staleSheetCache.size,
  };
}
