// SWR Client Hook for Live Tournament Data Sync
// Polls /api/live-data every 2.5s for zero-flicker live updates in vMix / OBS

'use client';

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
      refreshInterval: 2500, // Poll every 2.5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1800,
      keepPreviousData: true,
    }
  );

  return {
    sheetData: data,
    isLoading,
    isError: !!error,
    error,
    refreshNow: () => mutate(),
  };
}
