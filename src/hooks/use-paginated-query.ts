'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PaginatedResponse } from '@/lib/api-types';
import { useState } from 'react';

interface UsePaginatedQueryOptions {
  endpoint: string;
  queryKey: string;
  defaultLimit?: number;
}

export function usePaginatedQuery<T>({ endpoint, queryKey, defaultLimit = 20 }: UsePaginatedQueryOptions) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:DESC');

  const query = useQuery({
    queryKey: [queryKey, page, search, sortBy],
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      const params = new URLSearchParams({ page: String(page), limit: String(defaultLimit), sortBy });
      if (search) params.set('search', search);
      const { data } = await apiClient.get(`${endpoint}?${params}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });

  return { ...query, page, setPage, search, setSearch, sortBy, setSortBy };
}
