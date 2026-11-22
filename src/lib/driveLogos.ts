// Google Drive Auto-Logo Matching & Resolution
// Maps <TEAM_NAME>.png and <TAG>.png to direct Google Drive thumbnail URLs

import { DriveFileItem } from '@/types/broadcast';
import { normalizeStr } from '@/lib/sheetParsers';

/**
 * Resolves a team's logo from Google Drive files, falling back to a clean tag avatar
 */
export function resolveDriveLogo(
  teamName: string,
  tagName: string,
  driveFiles: DriveFileItem[] = []
): string {
  const normTeam = normalizeStr(teamName);
  const normTag = normalizeStr(tagName);

  // 1. Exact or substring match in Google Drive
  for (const file of driveFiles) {
    if (file.name) {
      const fileNameWithoutExt = normalizeStr(file.name.replace(/\.[^/.]+$/, ''));
      if (
        (normTag && (fileNameWithoutExt === normTag || fileNameWithoutExt.includes(normTag))) ||
        (normTeam && (fileNameWithoutExt.includes(normTeam) || normTeam.includes(fileNameWithoutExt)))
      ) {
        return `https://drive.google.com/thumbnail?id=${file.id}&sz=w240`;
      }
    }
  }

  // 2. Fallback to demo logo in Drive if present
  const demoFile = driveFiles.find((f) => f.name && normalizeStr(f.name) === 'demopng');
  if (demoFile) {
    return `https://drive.google.com/thumbnail?id=${demoFile.id}&sz=w240`;
  }

  // 3. Clean SVG/UI avatar fallback
  const label = (tagName || teamName || 'FF').slice(0, 3).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    label
  )}&background=0a0c16&color=F5B700&size=240&bold=true`;
}
