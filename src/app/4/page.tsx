'use client';

import Slide05GroupAverages from '@/components/slides/Slide05GroupAverages';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide04Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={3} theme={themes}>
      <Slide05GroupAverages sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
