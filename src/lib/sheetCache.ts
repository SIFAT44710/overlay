// Server-Side In-Memory TTL Cache
// Prevents Google Sheets API 429 Quota Exceeded errors during OBS / vMix multi-overlay polling

import { DriveFileItem } from '@/types/broadcast';

interface SheetCacheEntry {
  values: any[][];
  timestamp: number;
}

const SHEET_CACHE_TTL_MS = 3000; // 3 seconds TTL for sheet values
const DRIVE_CACHE_TTL_MS = 3000; // 3 seconds TTL for Drive logo list (Instant sync with Google Drive)

const sheetRangeCache = new Map<string, SheetCacheEntry>();
const staleRangeCache = new Map<string, any[][]>();

let driveFilesCache: { files: DriveFileItem[]; timestamp: number } | null = null;
let themeConfigCache: { data: Record<string, any>; timestamp: number } | null = null;

// --- Sheet Ranges Cache ---
export function getCachedRange(range: string, fresh = false): any[][] | null {
  if (fresh) return null;
  const entry = sheetRangeCache.get(range);
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age < SHEET_CACHE_TTL_MS) {
    return entry.values;
  }
  return null;
}

export function setCachedRange(range: string, values: any[][]): void {
  const now = Date.now();
  sheetRangeCache.set(range, { values, timestamp: now });
  staleRangeCache.set(range, values);
}

export function getStaleRangeFallback(range: string): any[][] {
  return staleRangeCache.get(range) || [];
}

// --- Drive Logos Cache ---
export function getCachedDriveLogos(fresh = false): DriveFileItem[] | null {
  if (fresh || !driveFilesCache) return null;
  const age = Date.now() - driveFilesCache.timestamp;
  if (age < DRIVE_CACHE_TTL_MS) {
    return driveFilesCache.files;
  }
  return null;
}

export function setCachedDriveLogos(files: DriveFileItem[]): void {
  driveFilesCache = { files, timestamp: Date.now() };
}

export function flushDriveCache(): void {
  driveFilesCache = null;
}

// --- Theme Config Cache ---
export function getCachedThemeConfig(fresh = false): Record<string, any> | null {
  if (fresh || !themeConfigCache) return null;
  const age = Date.now() - themeConfigCache.timestamp;
  if (age < 5000) { // 5s theme cache
    return themeConfigCache.data;
  }
  return null;
}

export function setCachedThemeConfig(data: Record<string, any>): void {
  themeConfigCache = { data, timestamp: Date.now() };
}

// --- Cache Diagnostics ---
export function getCacheStats() {
  const now = Date.now();
  let oldestSheetAge = 0;
  sheetRangeCache.forEach((entry) => {
    const age = now - entry.timestamp;
    if (age > oldestSheetAge) oldestSheetAge = age;
  });

  return {
    cachedRangesCount: sheetRangeCache.size,
    oldestSheetCacheAgeMs: oldestSheetAge,
    driveLogosCount: driveFilesCache ? driveFilesCache.files.length : 0,
    driveCacheAgeMs: driveFilesCache ? now - driveFilesCache.timestamp : -1,
  };
}
