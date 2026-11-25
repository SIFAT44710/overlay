'use client';

import React, { useState, useEffect } from 'react';

interface TeamLogoBadgeProps {
  tag: string;
  name?: string;
  logoUrl?: string;
  color?: string;
  sizeCls?: string;
  textSizeCls?: string;
  className?: string;
}

export default function TeamLogoBadge({
  tag,
  name,
  logoUrl,
  color = '#F5B700',
  sizeCls = 'w-16 h-16',
  textSizeCls = 'text-2xl',
  className = '',
}: TeamLogoBadgeProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever logoUrl changes (e.g. Drive file renamed or synced)
  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const up = (tag || name || '---').toUpperCase().trim().slice(0, 3);
  const isLight =
    color === '#F5B700' ||
    color === '#2DD4BF' ||
    color === '#00DF82' ||
    color === '#fbbf24' ||
    color === '#fde047';

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${sizeCls} rounded-xl border-2 border-black/80 p-1 flex items-center justify-center shrink-0 shadow-lg bg-slate-900/90 overflow-hidden ${className}`}
        title={`Team: ${name || tag}`}
      >
        <img
          key={logoUrl}
          src={logoUrl}
          alt={tag}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <span
      className={`${sizeCls} rounded-xl border-2 border-black/80 inline-flex items-center justify-center shrink-0 font-hud ${textSizeCls} font-extrabold shadow-lg ${className}`}
      style={{
        backgroundColor: color,
        color: isLight ? '#090b10' : '#ffffff',
      }}
      title={`Team: ${name || tag}`}
    >
      {up}
    </span>
  );
}
