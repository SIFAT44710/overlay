'use client';

import Slide02PlayerClash from '@/components/slides/Slide02PlayerClash';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide02Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide02PlayerClash sheetData={sheetData} theme={themes} />
    </main>
  );
}
