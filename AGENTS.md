<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# RTB / Free Fire Esports Broadcast Overlay Suite (Living Knowledge)
**Last Updated:** 2026-11-22  
**Production URL:** https://demo-graph-bd.vercel.app  
**Repository:** https://github.com/SIFAT44710/overlay.git  

---

## 1. Architecture Overview
- **Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Chart.js 4.4.1, SWR 2.5.1.
- **Data Source:** Google Sheets (`1QOTrmLLqyZQdL7AarXbhnFFA8_BeXHoWhod8INJnoHE`) via single centralized `batchGet`.
- **Team Logos:** Google Drive (`1osOfwQDzyZFg_Ma0brO6UNYjd8JfvxxW`) automated regex matching `<TEAM_NAME>.png` & `<TAG>.png`.
- **Serverless Persistence:** Zero external databases. All admin colors, active slide dataset sources, and dynamic Sheet/Drive IDs persist directly inside the `ThemeConfig!A1:B50` tab of the Google Sheet.

---

## 2. Route Separation & Security
- **Transparent Broadcast Routes (`/1` through `/10`):**
  - ZERO UI Chrome (no navbars, buttons, or drawers).
  - 100% transparent canvas ready for OBS / vMix Browser Sources.
  - SWR auto-polling: `/api/live-data` every 2.5s and `/api/theme` every 2.0s.
- **Admin Control Panel (`/admin`):**
  - Protected by `AuthGate.tsx` + `dg_session` HMAC SHA-256 HttpOnly cookie.
  - Requires `ADMIN_PASSWORD` (configured in Vercel environment variables).
  - Direct click-to-edit `ColorPopover`, collapsible `SheetDataDrawer`, dynamic `SheetConfigModal`, and `Sync Drive Logos` button.

---

## 3. Real Google Sheets Column Mapping (Verified 2026-11-22)
| Tab Name | Row Structure | Accurate Column Mapping |
|:---|:---|:---|
| `DayStanding` | Row 1: Title, Row 2: Header, Rows 3-14: 12 Teams | `r[0]`: Rank, `r[1]`: Team Name, `r[2]`: Tag, `r[3]`: Survival Pts, `r[5]`: Total Pts, `r[6]`: Kills, `r[7]`: Booyah, `r[8]`: Damage |
| `GameStanding` | Header: `MATCH #(\d+)`, then Rows 3-14 per match | `r[1]`: Team, `r[2]`: Tag, `r[5]`: Total Pts (Match cumulative), `r[6]`: Kills, `r[8]`: Damage |
| `PlayerData` | Row 1: Title, Row 2: Header, Rows 3+: Players | `r[0]`: Team Tag, `r[1]`: Player ID, `r[2]`: Player Name, `r[3]`: Kills, `r[4]`: Damage, `r[5]`: Assist, `r[8]`: Headshots |
| `PlayerRoleStats`| Headers: `SNIPER (X PLAYERS)`, `RUSHER (X PLAYERS)`, etc. | `r[0]`: Header / Team, `r[2]`: Player Name, `r[3]`: Kills, `r[4]`: Damage |
| `Vmix` | Rows 91-98: Day Most Used Guns | `r[0]`: Gun Name, `r[1]`: Kills, `r[2]`: Damage, `r[4]`: Headshots |
| `TeamStats` | Row 1: Title, Row 2: Header, Rows 3+: Teams | `r[1]`: Team, `r[2]`: Tag, `r[3]`: Survival Pts, `r[5]`: Total Pts, `r[6]`: Kills, `r[7]`: Booyah, `r[8]`: Damage, `r[11]`: Gloo Used |

---

## 4. Typography & Esports Broadcast Rules
- Only **GFF Latin** and **Teko** typography.
- **ZERO 'K' abbreviations:** Numbers like `57261` or `115964` are rendered in full with comma separators (`57,261`, `115,964`).
- Hexagon team logos in Chart.js have 72px diameter with `padding.bottom: 132` to guarantee high broadcast visibility in vMix.
