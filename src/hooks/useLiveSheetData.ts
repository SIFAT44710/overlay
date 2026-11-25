// SWR Client Hook for Live Tournament Data Sync
// Hydrates instantaneously from localStorage at 0ms on reload, then polls /api/live-data every 2s

'use client';

import { useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { SheetDataPayload } from '@/types/broadcast';

const CACHE_KEY = 'dg_live_sheet_cache_v1';

const fetcher = async (url: string): Promise<SheetDataPayload> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch live data`);
  }
  return res.json();
};

function getInitialSheetData(): SheetDataPayload | undefined {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw) as SheetDataPayload;
    } catch {}
  }
  return undefined;
}

export function useLiveSheetData() {
  const [stableData, setStableData] = useState<SheetDataPayload | undefined>(getInitialSheetData);
  const lastSnapshotRef = useRef<string>('');

  const { data, error, isLoading, mutate } = useSWR<SheetDataPayload>(
    '/api/live-data',
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds for instant Sheet & Drive updates
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      keepPreviousData: true,
      fallbackData: stableData,
    }
  );

  useEffect(() => {
    if (!data) return;
    // Strip volatile server timestamp before comparing
    const { meta, ...payloadWithoutMeta } = data;
    const currentSnapshot = JSON.stringify(payloadWithoutMeta);

    if (currentSnapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = currentSnapshot;
      setStableData(data);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
      }
    }
  }, [data]);

  return {
    sheetData: stableData || data,
    isLoading: isLoading && !stableData,
    isError: !!error,
    error,
    refreshNow: () => mutate(),
  };
}
