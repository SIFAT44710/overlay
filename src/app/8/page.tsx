'use client';

import Slide09RolePolar from '@/components/slides/Slide09RolePolar';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide08Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={7} theme={themes}>
      <Slide09RolePolar sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
