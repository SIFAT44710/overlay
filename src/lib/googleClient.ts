// Singleton GoogleAuth Client & Centralized Sheets / Drive Methods
// Handles dynamic Sheet ID & Drive Folder ID overrides stored in ThemeConfig

import { google } from 'googleapis';
import {
  getCachedRange,
  getStaleRangeIfValid,
  setCachedRange,
  getStaleRangeFallback,
  getCachedDriveLogos,
  getStaleDriveLogosIfValid,
  setCachedDriveLogos,
  getCachedThemeConfig,
  getStaleThemeIfValid,
  setCachedThemeConfig,
} from './sheetCache';
import { safeString, safeInt } from './sheetParsers';
import { DriveFileItem, BroadcastThemeConfig, AdminSheetConfig } from '@/types/broadcast';

let authClientInstance: any = null;
let sheetsClientInstance: any = null;
let driveClientInstance: any = null;

export const THEME_CONFIG_TAB = 'ThemeConfig';
export const THEME_CONFIG_RANGE = `${THEME_CONFIG_TAB}!A1:B50`;

export function getGoogleClients() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !rawKey) {
    throw new Error('Missing Google Service Account credentials (GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY) in environment.');
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
  };
}

/**
 * Returns active Sheet ID and Drive Folder ID, checking ThemeConfig tab first,
 * then falling back to process.env.
 */
export async function getActiveConfig(): Promise<AdminSheetConfig> {
  const defaultSheetId = process.env.GOOGLE_SHEET_ID || '1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE';
  const defaultDriveId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

  try {
    const themeData = await getStoredThemeConfig();
    const dynamicSheetId = themeData._config_sheetId || defaultSheetId;
    const dynamicDriveId = themeData._config_driveFolderId || defaultDriveId;
    const dynamicApiKey = themeData._config_apiKey || '';

    return {
      sheetId: dynamicSheetId,
      driveFolderId: dynamicDriveId,
      apiKey: dynamicApiKey,
    };
  } catch {
    return {
      sheetId: defaultSheetId,
      driveFolderId: defaultDriveId,
    };
  }
}

/**
 * Ensures the ThemeConfig tab exists in the active Google Spreadsheet
 */
export async function ensureThemeConfigTabExists(sheetId: string): Promise<void> {
  try {
    const { sheets } = getGoogleClients();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const exists = meta.data.sheets?.some(
      (s: any) => s.properties?.title === THEME_CONFIG_TAB
    );
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: THEME_CONFIG_TAB,
                  gridProperties: { rowCount: 60, columnCount: 6 },
                },
              },
            },
          ],
        },
      });
    }
  } catch (err) {
    console.warn('[ThemeConfig] Tab check/creation note:', err);
  }
}

let themeRefreshPromise: Promise<Record<string, any>> | null = null;
let driveRefreshPromise: Promise<DriveFileItem[]> | null = null;
let batchRefreshInFlight = false;

/**
 * Reads persistent theme & source selections from ThemeConfig tab (with sub-10ms SWR)
 */
export async function getStoredThemeConfig(fresh = false): Promise<Record<string, any>> {
  const cached = getCachedThemeConfig(fresh);
  if (cached) return cached;

  if (!fresh) {
    const stale = getStaleThemeIfValid();
    if (stale) {
      if (stale.needsRefresh && !themeRefreshPromise) {
        themeRefreshPromise = getStoredThemeConfig(true).finally(() => {
          themeRefreshPromise = null;
        });
      }
      return stale.data;
    }
  }

  const defaultSheetId = process.env.GOOGLE_SHEET_ID || '1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE';

  try {
    const { sheets } = getGoogleClients();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: defaultSheetId,
      range: THEME_CONFIG_RANGE,
    }).catch(async (err: any) => {
      if (err.message && err.message.includes('Unable to parse range')) {
        await ensureThemeConfigTabExists(defaultSheetId);
      }
      return { data: { values: [] } };
    });

    const rows = res.data?.values || [];
    const configMap: Record<string, any> = {};

    rows.forEach((row: any[]) => {
      const key = safeString(row[0]);
      const jsonStr = safeString(row[1]);
      if (key && jsonStr) {
        try {
          configMap[key] = JSON.parse(jsonStr);
        } catch {
          configMap[key] = jsonStr;
        }
      }
    });

    setCachedThemeConfig(configMap);
    return configMap;
  } catch (error) {
    console.warn('[ThemeConfig] Failed to fetch theme from Google Sheets:', error);
    return getCachedThemeConfig(false) || {};
  }
}

/**
 * Saves updated theme & source settings to ThemeConfig tab
 */
export async function saveThemeConfigToSheet(
  updates: Record<string, any>
): Promise<boolean> {
  const defaultSheetId = process.env.GOOGLE_SHEET_ID || '1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE';

  // 1. ALWAYS update in-memory cache immediately so server-side state never drops
  const current = (await getStoredThemeConfig(false)) || {};
  Object.entries(updates).forEach(([k, v]) => {
    if (typeof v === 'object' && v !== null && !Array.isArray(v) && typeof current[k] === 'object' && current[k] !== null) {
      current[k] = { ...current[k], ...v };
    } else {
      current[k] = v;
    }
  });
  setCachedThemeConfig(current);

  // 2. Best-effort persistent write to Google Sheet
  try {
    await ensureThemeConfigTabExists(defaultSheetId);
    const rows = Object.entries(current).map(([k, v]) => [
      k,
      typeof v === 'string' ? v : JSON.stringify(v),
    ]);

    const { sheets } = getGoogleClients();
    await sheets.spreadsheets.values.update({
      spreadsheetId: defaultSheetId,
      range: `${THEME_CONFIG_TAB}!A1:B${rows.length}`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });
    return true;
  } catch (error) {
    console.warn('[ThemeConfig] Google Sheet tab write note (retained in server cache):', error);
    return true; // Preserved in server cache
  }
}

/**
 * Single batchGet call fetching all requested ranges with 3s TTL cache & stale-while-revalidate
 */
export async function getBatchSheetRanges(
  ranges: string[],
  sheetIdOverride?: string,
  fresh = false
): Promise<Record<string, any[][]>> {
  const config = await getActiveConfig();
  const sheetId = sheetIdOverride || config.sheetId;

  const result: Record<string, any[][]> = {};
  const rangesToFetch: string[] = [];
  const staleRangesToRefresh: string[] = [];

  for (const r of ranges) {
    const cached = getCachedRange(r, fresh);
    if (cached) {
      result[r] = cached;
    } else if (!fresh) {
      const stale = getStaleRangeIfValid(r);
      if (stale) {
        result[r] = stale.values;
        if (stale.needsRefresh) staleRangesToRefresh.push(r);
      } else {
        rangesToFetch.push(r);
      }
    } else {
      rangesToFetch.push(r);
    }
  }

  // Trigger non-blocking background refresh for stale ranges
  if (staleRangesToRefresh.length > 0 && !batchRefreshInFlight) {
    batchRefreshInFlight = true;
    void getBatchSheetRanges(staleRangesToRefresh, sheetId, true).finally(() => {
      batchRefreshInFlight = false;
    });
  }

  if (rangesToFetch.length === 0) {
    return result;
  }

  try {
    const { sheets } = getGoogleClients();
    const batchRes = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: rangesToFetch,
    });

    const valueRanges = batchRes.data.valueRanges || [];
    valueRanges.forEach((vr: any, idx: number) => {
      const originalRange = rangesToFetch[idx] || vr.range;
      const values = vr.values || [];
      setCachedRange(originalRange, values);
      result[originalRange] = values;
    });

    return result;
  } catch (error) {
    console.error('[GoogleSheets] batchGet failed. Falling back to stale cache:', error);
    for (const r of rangesToFetch) {
      result[r] = getStaleRangeFallback(r);
    }
    return result;
  }
}

/**
 * Fetches Google Drive logo list (3-second TTL cache for instant sync)
 */
export async function getDriveLogos(fresh = false): Promise<DriveFileItem[]> {
  const cached = getCachedDriveLogos(fresh);
  if (cached) return cached;

  if (!fresh) {
    const stale = getStaleDriveLogosIfValid();
    if (stale) {
      if (stale.needsRefresh && !driveRefreshPromise) {
        driveRefreshPromise = getDriveLogos(true).finally(() => {
          driveRefreshPromise = null;
        });
      }
      return stale.files;
    }
  }

  const config = await getActiveConfig();
  const driveFolderId = config.driveFolderId;
  if (!driveFolderId) return [];

  try {
    const { drive } = getGoogleClients();
    const res = await drive.files.list({
      q: `'${driveFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, modifiedTime, version, mimeType)',
      pageSize: 150,
    });

    const files = (res.data.files || []) as DriveFileItem[];
    setCachedDriveLogos(files);
    return files;
  } catch (error) {
    console.warn('[GoogleDrive] Failed to list drive files:', error);
    return getCachedDriveLogos(false) || [];
  }
}
