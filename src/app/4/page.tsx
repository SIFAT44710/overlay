'use client';

import Slide05GroupAverages from '@/components/slides/Slide05GroupAverages';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide04Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide05GroupAverages sheetData={sheetData} theme={themes} />
    </main>
  );
}
