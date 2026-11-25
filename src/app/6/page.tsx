'use client';

import Slide07FastRadar from '@/components/slides/Slide07FastRadar';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide06Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={5} theme={themes}>
      <Slide07FastRadar sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
