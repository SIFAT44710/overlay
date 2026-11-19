<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Architecture & Live Broadcast Conventions (Updated: 2026-11-19)

### 1. Slide 13 — FFWS Wipe Standing (Top 12 Teams)
- **Overlay Route**: `/13` and `/standing`
- **Component**: `src/app/components/Dashboard13.tsx`
- **Data Source**: Real-time Google Sheet `DayStanding!A2:J15` via API endpoint `/api/daystanding` (with delta calculated dynamically against `LastMatchStanding`).
- **Team Logos**: Automatically resolved from Google Drive folder (`1N-b8P53jY5s8bW87wE_0zE1P29rB3N_g`) matched against team name / tag with fallbacks to colored tag plates.
- **Color Customization**: Fully wired into `/admin` (Storage key: `rtb_colors_dashboard13`) across all 6 master palettes (Demo-Graph BD Signature, FFWS World Series, Cyberpunk Neo-Tokyo, Booyah Gold, Toxic Matrix, Bloodline Inferno).
- **OBS / vMix Integration**: Native 1920x1080 transparent canvas (`html, body { background: transparent !important; }`), responsive with zero scrollbars, zero debug text/buttons, listening to `visibilitychange` and `obsSourceVisibleChanged` for entrance wipe replay.

