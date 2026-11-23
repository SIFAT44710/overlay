'use client';

import Slide09RolePolar from '@/components/slides/Slide09RolePolar';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide08Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide09RolePolar sheetData={sheetData} theme={themes} />
    </main>
  );
}
