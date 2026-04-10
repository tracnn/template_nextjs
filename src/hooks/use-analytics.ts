'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AnalyticsStats } from '@/lib/api-types';

export function useAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics', from, to],
    queryFn: async (): Promise<AnalyticsStats> => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const { data } = await apiClient.get(`/v1/analytics/stats?${params}`);
      return data;
    },
  });
}
