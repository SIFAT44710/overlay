'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// New order requested: 5 and 6 moved to the back, rest in front
export const SLIDE_ORDER = [
  { id: 1, label: 'Slide 01 • Wipe Standing (Top 12)', path: '/1' },
  { id: 2, label: 'Slide 02 • Match 1–5 Points Race', path: '/2' },
  { id: 3, label: 'Slide 03 • 1v1 Player Clash Gauge', path: '/3' },
  { id: 4, label: 'Slide 04 • Weapon Meta Rings', path: '/4' },
  { id: 7, label: 'Slide 07 • Team H2H Match 5 (Radar + Gauge)', path: '/7' },
  { id: 8, label: 'Slide 08 • Team H2H Day Butterfly', path: '/8' },
  { id: 9, label: 'Slide 09 • Group Stage Averages', path: '/9' },
  { id: 10, label: 'Slide 10 • Match 5 MVP Spotlight', path: '/10' },
  { id: 11, label: 'Slide 11 • Total Points Column', path: '/11' },
  { id: 12, label: 'Slide 12 • Top 2 Cinematic Slow Radar', path: '/12' },
  { id: 13, label: 'Slide 13 • M1–M5 Kills & DMG Line', path: '/13' },
  { id: 14, label: 'Slide 14 • Role Avg Dual Polar', path: '/14' },
  { id: 5, label: 'Slide 05 • Role Warfare Donut (Later)', path: '/5' },
  { id: 6, label: 'Slide 06 • Match 5 Map Standing (Later)', path: '/6' },
];

export default function SlideNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hide on Home, Admin, or OBS / vMix capture mode
  const isObs = searchParams.get('obs') === '1' || searchParams.get('vmix') === '1';
  if (!pathname || pathname === '/' || pathname === '/admin' || isObs) {
    return null;
  }

  const currentIdx = SLIDE_ORDER.findIndex((s) => s.path === pathname);
  const currentSlide = currentIdx !== -1 ? SLIDE_ORDER[currentIdx] : null;

  // Keyboard navigation (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' && currentIdx !== -1 && currentIdx < SLIDE_ORDER.length - 1) {
        router.push(SLIDE_ORDER[currentIdx + 1].path);
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        router.push(SLIDE_ORDER[currentIdx - 1].path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, router]);

  const prevSlide = currentIdx > 0 ? SLIDE_ORDER[currentIdx - 1] : null;
  const nextSlide = currentIdx !== -1 && currentIdx < SLIDE_ORDER.length - 1 ? SLIDE_ORDER[currentIdx + 1] : null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 bg-[#18191a]/95 backdrop-blur-md border border-[#3a3b3c] px-3 py-1.5 rounded-full shadow-2xl">
        {/* Home Link */}
        <Link
          href="/"
          className="text-xs font-bold text-[#b0b3b8] hover:text-white px-2 py-1 rounded-full hover:bg-[#242526] transition flex items-center gap-1 font-hud"
          title="Home Dashboard"
        >
          <span>⌂</span>
          <span className="hidden sm:inline">Suite</span>
        </Link>

        <span className="w-px h-4 bg-[#3a3b3c]" />

        {/* Prev Button */}
        <button
          type="button"
          onClick={() => prevSlide && router.push(prevSlide.path)}
          disabled={!prevSlide}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition font-hud ${
            prevSlide
              ? 'text-white hover:bg-[#242526] active:scale-95 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title={prevSlide ? `Go to ${prevSlide.label}` : 'First Slide'}
        >
          ◀
        </button>

        {/* Slide Selector Dropdown */}
        <select
          value={pathname}
          onChange={(e) => router.push(e.target.value)}
          aria-label="Select Slide"
          className="bg-[#242526] text-white text-xs font-bold font-hud px-3 py-1 rounded-full border border-[#3a3b3c] focus:outline-none focus:border-[#1877f2] cursor-pointer max-w-[200px] sm:max-w-xs truncate"
        >
          {SLIDE_ORDER.map((slide, idx) => (
            <option key={slide.id} value={slide.path} className="bg-[#18191a] text-white">
              {idx + 1}. {slide.label}
            </option>
          ))}
        </select>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => nextSlide && router.push(nextSlide.path)}
          disabled={!nextSlide}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition font-hud ${
            nextSlide
              ? 'text-white hover:bg-[#242526] active:scale-95 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title={nextSlide ? `Go to ${nextSlide.label}` : 'Last Slide'}
        >
          ▶
        </button>

        <span className="w-px h-4 bg-[#3a3b3c]" />

        {/* Current Index Badge */}
        <span className="text-[11px] font-extrabold font-hud px-2 py-0.5 rounded-full bg-[#1877f2] text-white">
          {currentIdx !== -1 ? `${currentIdx + 1}/${SLIDE_ORDER.length}` : 'Slide'}
        </span>
      </div>
    </div>
  );
}
