'use client';

import Slide04TeamH2H from '@/components/slides/Slide04TeamH2H';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide10Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={9} theme={themes}>
      <Slide04TeamH2H sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
