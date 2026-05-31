import { useQuery } from '@tanstack/react-query';

import { newsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { Id, NewsFeedQuery } from '../../types';

export function useNewsFeed(params: NewsFeedQuery = {}) {
  return useQuery({
    queryKey: queryKeys.news.feed(params),
    queryFn: () => newsApi.feed(params),
    staleTime: 30_000,
  });
}

export function useNewsArticle(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.news.article(id),
    enabled: !!id,
    queryFn: () => newsApi.article(id!),
    staleTime: 60_000,
  });
}

export function useVendorInsight(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.news.vendorInsight(id),
    enabled: !!id,
    queryFn: () => newsApi.vendorInsight(id!),
    staleTime: 60_000,
  });
}
