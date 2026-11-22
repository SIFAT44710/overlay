'use client';

import Slide06SingleColumn from '@/components/slides/Slide06SingleColumn';
import { useLiveSheetData } from '@/hooks/useLiveSheetData';
import { useBroadcastTheme } from '@/hooks/useBroadcastTheme';
import AuthGate from '@/components/AuthGate';

export default function StandingPage() {
  const { sheetData } = useLiveSheetData();
  const { themes } = useBroadcastTheme();

  return (
    <AuthGate>
      <main id="stage" className="w-screen h-screen flex items-center justify-center p-4 overflow-hidden bg-transparent select-none">
        <Slide06SingleColumn sheetData={sheetData} theme={themes} />
      </main>
    </AuthGate>
  );
}
