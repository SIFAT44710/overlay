'use client';

import Slide10DualColumn from '@/components/slides/Slide10DualColumn';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide09Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={8} theme={themes}>
      <Slide10DualColumn sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
