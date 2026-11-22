// SWR Client Hook for Live Tournament Data Sync
// Polls /api/live-data with snapshot memoization to eliminate unwanted re-renders & flickering

'use client';

import { useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { SheetDataPayload } from '@/types/broadcast';

const fetcher = async (url: string): Promise<SheetDataPayload> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch live data`);
  }
  return res.json();
};

export function useLiveSheetData() {
  const { data, error, isLoading, mutate } = useSWR<SheetDataPayload>(
    '/api/live-data',
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds
      revalidateOnFocus: false, // Don't trigger flash when switching window
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  const [stableData, setStableData] = useState<SheetDataPayload | undefined>(data);
  const lastSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (!data) return;
    // Strip volatile server timestamp before comparing
    const { meta, ...payloadWithoutMeta } = data;
    const currentSnapshot = JSON.stringify(payloadWithoutMeta);

    if (currentSnapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = currentSnapshot;
      setStableData(data);
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
