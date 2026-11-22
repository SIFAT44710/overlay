'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface BroadcastThemeResponse {
  success: boolean;
  themes: Record<string, Record<string, string>>;
  meta?: {
    isLive: boolean;
    sourceTab: string;
    cached: boolean;
    updatedAt: string;
  };
}

export function useBroadcastTheme(slideId?: number | string) {
  const { data, error, isLoading, mutate } = useSWR<BroadcastThemeResponse>(
    '/api/theme',
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const allThemes = data?.themes || {};
  let currentSlideTheme: Record<string, string> = {};

  if (slideId !== undefined && slideId !== null) {
    const key = typeof slideId === 'number' ? `dashboard${slideId}` : String(slideId);
    currentSlideTheme = allThemes[key] || {};
  }

  return {
    allThemes,
    theme: currentSlideTheme,
    isLive: data?.meta?.isLive ?? true,
    updatedAt: data?.meta?.updatedAt,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export default useBroadcastTheme;
