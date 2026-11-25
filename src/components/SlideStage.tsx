'use client';

import React from 'react';
import { BroadcastThemeConfig } from '@/types/broadcast';

interface SlideStageProps {
  slideIdx: number; // 0-based index (0 = /1, 1 = /2, ...)
  theme?: BroadcastThemeConfig;
  children: React.ReactNode;
}

/**
 * Wraps each isolated broadcast slide (/1..10) so toggling a slide OFF
 * in the Admin Panel immediately hides it on its live OBS/vMix route.
 */
export default function SlideStage({ slideIdx, theme, children }: SlideStageProps) {
  const isDisabled = theme?.disabledSlides?.[slideIdx] === true;

  if (isDisabled) {
    return (
      <main
        id="stage"
        className="w-screen h-screen overflow-hidden bg-transparent pointer-events-none select-none"
      />
    );
  }

  return (
    <main
      id="stage"
      className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none"
    >
      {children}
    </main>
  );
}
