'use client';

import Slide03WeaponRings from '@/components/slides/Slide03WeaponRings';
import SlideStage from '@/components/SlideStage';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';

export default function Slide03Page() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <SlideStage slideIdx={2} theme={themes}>
      <Slide03WeaponRings sheetData={sheetData} theme={themes} />
    </SlideStage>
  );
}
