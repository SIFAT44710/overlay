'use client';

import Slide06SingleColumn from '@/components/slides/Slide06SingleColumn';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide05Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={4} theme={themes}>
      <Slide06SingleColumn sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
