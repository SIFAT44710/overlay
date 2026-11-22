'use client';

import Slide08KillsDmgLine from '@/components/slides/Slide08KillsDmgLine';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide08Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
      <Slide08KillsDmgLine sheetData={sheetData} theme={themes} />
    </main>
  );
}
