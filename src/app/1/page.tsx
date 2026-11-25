'use client';

import Slide01PointsRace from '@/components/slides/Slide01PointsRace';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide01Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={0} theme={themes}>
      <Slide01PointsRace sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
