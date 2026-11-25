'use client';

import Slide08KillsDmgLine from '@/components/slides/Slide08KillsDmgLine';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide07Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={6} theme={themes}>
      <Slide08KillsDmgLine sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
