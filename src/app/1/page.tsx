'use client';

import Slide01PointsRace from '@/components/slides/Slide01PointsRace';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide01Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide01PointsRace sheetData={sheetData} theme={themes} />
    </main>
  );
}
