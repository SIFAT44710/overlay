'use client';

import Slide02PlayerClash from '@/components/slides/Slide02PlayerClash';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide02Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={1} theme={themes}>
      <Slide02PlayerClash sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
