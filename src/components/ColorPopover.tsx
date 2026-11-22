'use client';

import React, { useState, useEffect, useRef } from 'react';

const SWATCHES = [
  '#F5B700', '#E11D48', '#8B5CF6', '#A855F7',
  '#EC008C', '#2DD4BF', '#38BDF8', '#22C55E',
  '#F97316', '#EF4444', '#FACC15', '#6366F1',
  '#FFFFFF', '#0A0C16', '#120824', '#04121C',
];

interface ColorPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  label: string;
  initialColor: string;
  showExtras?: boolean;
  onColorChange: (color: string) => void;
  onClose: () => void;
  onSelectGlobalText?: () => void;
  onSelectGlobalBox?: () => void;
}

export default function ColorPopover({
  isOpen,
  position,
  label,
  initialColor,
  showExtras = false,
  onColorChange,
  onClose,
  onSelectGlobalText,
  onSelectGlobalBox,
}: ColorPopoverProps) {
  const [color, setColor] = useState(initialColor || '#ffffff');
  const [hexInput, setHexInput] = useState(initialColor || '#ffffff');
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setColor(initialColor || '#ffffff');
    setHexInput(initialColor || '#ffffff');
  }, [initialColor]);

  // Handle Escape key and outside click to cleanly dismiss popover
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleColorPick = (val: string) => {
    setColor(val);
    setHexInput(val.toUpperCase());
    onColorChange(val);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setColor(val);
      onColorChange(val);
    }
  };

  // Viewport clamping with safety padding
  const width = 270;
  const height = showExtras ? 260 : 210;
  const pad = 16;
  let left = position.x + 16;
  let top = position.y - height / 2;

  if (typeof window !== 'undefined') {
    if (left + width > window.innerWidth - pad) {
      left = position.x - width - 16;
    }
    if (top + height > window.innerHeight - pad) {
      top = window.innerHeight - height - pad;
    }
    if (top < pad) top = pad;
    if (left < pad) left = pad;
  }

  return (
    <>
      {/* Invisible backdrop to capture outside clicks without blocking overlays */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={popoverRef}
        id="colorPopover"
        style={{ left: `${left}px`, top: `${top}px` }}
        className="fixed z-50 w-[270px] rounded-2xl bg-slate-950/95 border border-purple-400/65 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.85)] space-y-3 font-hud backdrop-blur-md select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-purple-300 uppercase">
              DYNAMIC COLOR
            </div>
            <div className="font-hud text-lg font-bold text-white leading-tight truncate max-w-[200px]">
              {label}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorPick(e.target.value)}
            className="color-chip-input w-11 h-11 shrink-0"
          />
          <div className="flex-1">
            <div className="text-[10px] text-slate-400 uppercase">HEX CODE</div>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              className="w-full bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1 font-hud text-base font-bold text-white uppercase focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-8 gap-1.5">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => handleColorPick(swatch)}
              className="w-6 h-6 rounded-md border border-white/25 cursor-pointer transition-transform hover:scale-115 active:scale-95"
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>

        {showExtras && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSelectGlobalText}
              className="flex-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-800 border border-white/15 font-hud text-xs font-bold text-slate-200 cursor-pointer text-center"
            >
              Edit Text Color
            </button>
            <button
              type="button"
              onClick={onSelectGlobalBox}
              className="flex-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-800 border border-white/15 font-hud text-xs font-bold text-slate-200 cursor-pointer text-center"
            >
              Edit Box BG
            </button>
          </div>
        )}
      </div>
    </>
  );
}
