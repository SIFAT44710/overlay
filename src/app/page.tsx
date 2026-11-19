import Link from 'next/link';

export default function Home() {
  const overlays = [
    { href: '/1', title: 'Overlay 1', desc: 'Top 12 Elims & Damage Trend (Bar + Curve)', badge: 'Leaderboard' },
    { href: '/2', title: 'Overlay 2', desc: 'Double Bar Side-by-Side Comparison', badge: 'H2H Teams' },
    { href: '/3', title: 'Overlay 3', desc: 'Matrix 3-Line Grid (Elims, Survival & Damage)', badge: 'Multi-Metric' },
    { href: '/4', title: 'Overlay 4', desc: 'Team vs Team Radar Polygon', badge: 'Radar H2H' },
    { href: '/5', title: 'Overlay 5', desc: 'Team Head-to-Head V-Progression Line', badge: 'Progression' },
    { href: '/6', title: 'Overlay 6', desc: 'MVP Player of the Match Pentagon', badge: 'MVP' },
    { href: '/7', title: 'Overlay 7', desc: 'Top Fragger 1v1 PvP Duel Showdown', badge: '1v1 Duel' },
  ];

  return (
    <main className="min-h-screen bg-[#18191a] text-[#e4e6eb] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-[#1877f2]/20 text-[#1877f2] text-xs font-bold rounded-full uppercase tracking-wider">
            Broadcast Overlays
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Free Fire Tournament Graphics System
          </h1>
          <p className="text-sm text-[#b0b3b8]">
            OBS / vMix Ready • Transparent Browser Source Compatible • 1080p Native
          </p>
        </div>

        {/* FFWS Pro Demo Showcase Banner */}
        <Link
          href="/demo"
          className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent hover:from-amber-500/25 border-2 border-amber-500/40 rounded-2xl transition duration-150 group shadow-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase rounded">
                NEW DEMO
              </span>
              <span className="text-lg font-black text-white group-hover:text-amber-400 transition">
                FFWS Esports Broadcast Showcase (Light/Dark Demos)
              </span>
            </div>
            <p className="text-xs text-[#b0b3b8]">
              Featuring Frag Dominance Split Bar, Point Trajectory Momentum, and 4-Player Squad HUD using Palette E5.
            </p>
          </div>
          <span className="px-4 py-2 bg-amber-500 text-black text-xs font-black uppercase rounded-xl tracking-wider shadow">
            Launch Showcase ↗
          </span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {overlays.map((ov) => (
            <Link
              key={ov.href}
              href={ov.href}
              target="_blank"
              className="flex items-center justify-between p-4 bg-[#242526] hover:bg-[#3a3b3c]/60 border border-[#3a3b3c] rounded-xl transition duration-150 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-white group-hover:text-[#1877f2] transition">
                    {ov.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#3a3b3c] text-[#b0b3b8] rounded">
                    {ov.badge}
                  </span>
                </div>
                <p className="text-xs text-[#b0b3b8]">{ov.desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#1877f2] px-3 py-1.5 bg-[#1877f2]/10 rounded-lg">
                Open ↗
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center pt-6 text-xs text-[#b0b3b8]">
          Connected to Live Google Sheet (Vmix) • Auto-sync every 3-5 seconds
        </div>
      </div>
    </main>
  );
}
