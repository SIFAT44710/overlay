// Safe Google Sheet Parsers & Utilities
// Zero NaN, Comma-Formatted Full Numbers (Zero 'K' Abbreviations)

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

/**
 * STRICT RULE: NEVER use 'K' abbreviations (e.g. 57.3K).
 * ALWAYS format as full comma-separated numbers (e.g. 57,261).
 */
export function formatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : safeFloat(val);
  return Number(num).toLocaleString();
}

/**
 * Extracts a clean Google Sheet ID whether the user provides a full URL or a raw ID
 */
export function extractSheetId(input: string): string {
  const clean = (input || '').trim();
  const match = clean.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return clean;
}
