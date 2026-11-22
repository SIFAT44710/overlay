'use client';

import Slide03WeaponRings from '@/components/slides/Slide03WeaponRings';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide03Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide03WeaponRings sheetData={sheetData} theme={themes} />
    </main>
  );
}
