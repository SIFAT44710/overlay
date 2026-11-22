// Google Drive Auto-Logo Matching & Resolution
// Maps Tag Name (e.g. TOP.png, EXE.png) and Full Name (e.g. RAAD VAI YT.png, EXTREME EX.png)
// to direct Google Drive thumbnail URLs with cache-busting version timestamps

import { DriveFileItem } from '@/types/broadcast';
import { normalizeStr } from '@/lib/sheetParsers';

/**
 * Resolves a team's logo from Google Drive files, falling back to a clean tag avatar
 * Strict Priority Matching:
 * Pass 1: Exact Tag Match (e.g. TOP.png -> TOP)
 * Pass 2: Exact Team Name Match (e.g. RAAD VAI YT.png -> RAAD VAI YT)
 * Pass 3: Word boundary / delimiter match (e.g. TRX_LOGO.png -> TRX)
 * Pass 4: Team Name Contains / Substring Match (e.g. COFFIN MAKERS.png -> COFFIN MAKERS ESP)
 * Pass 5: Tag Contains Match (e.g. UEO_PNG -> UEO)
 */
export function resolveDriveLogo(
  teamName: string,
  tagName: string,
  driveFiles: DriveFileItem[] = []
): string {
  const normTeam = normalizeStr(teamName);
  const normTag = normalizeStr(tagName);

  const getCleanName = (fName: string) => normalizeStr(fName.replace(/\.[^/.]+$/, ''));

  const buildUrl = (file: DriveFileItem) => {
    const ver = file.version || file.modifiedTime || '';
    const cacheParam = ver ? `&v=${encodeURIComponent(ver)}` : '';
    return `https://drive.google.com/thumbnail?id=${file.id}&sz=w240${cacheParam}`;
  };

  // Pass 1: Exact Tag Match (case-insensitive, extension-stripped)
  if (normTag) {
    for (const file of driveFiles) {
      if (file.name && getCleanName(file.name) === normTag) {
        return buildUrl(file);
      }
    }
  }

  // Pass 2: Exact Team Name Match
  if (normTeam) {
    for (const file of driveFiles) {
      if (file.name && getCleanName(file.name) === normTeam) {
        return buildUrl(file);
      }
    }
  }

  // Pass 3: Word boundary / Delimiter match (e.g. "TOP_LOGO.png", "EXE-LOGO.png", "TOP LOGO.png")
  for (const file of driveFiles) {
    if (!file.name) continue;
    const base = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
    const words = base.split(/[\s_\-]+/).filter(Boolean);
    if (normTag && words.includes(normTag)) {
      return buildUrl(file);
    }
    if (normTeam && words.join('') === normTeam) {
      return buildUrl(file);
    }
  }

  // Pass 4: Team Name Substring / Contains Match
  if (normTeam) {
    for (const file of driveFiles) {
      if (!file.name) continue;
      const clean = getCleanName(file.name);
      if (clean.length >= 3 && (normTeam.includes(clean) || clean.includes(normTeam))) {
        return buildUrl(file);
      }
    }
  }

  // Pass 5: Tag Substring Match (length >= 2)
  if (normTag && normTag.length >= 2) {
    for (const file of driveFiles) {
      if (!file.name) continue;
      const clean = getCleanName(file.name);
      if (clean.includes(normTag) || normTag.includes(clean)) {
        return buildUrl(file);
      }
    }
  }

  // Fallback 1: Demo logo in Drive if present
  const demoFile = driveFiles.find((f) => f.name && normalizeStr(f.name) === 'demopng');
  if (demoFile) {
    return buildUrl(demoFile);
  }

  // Fallback 2: Clean SVG avatar
  const label = (tagName || teamName || 'FF').slice(0, 3).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    label
  )}&background=0a0c16&color=F5B700&size=240&bold=true`;
}
