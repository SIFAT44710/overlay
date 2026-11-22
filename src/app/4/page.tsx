'use client';

import Slide04TeamH2H from '@/components/slides/Slide04TeamH2H';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide04Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide04TeamH2H sheetData={sheetData} theme={themes} />
    </main>
  );
}
