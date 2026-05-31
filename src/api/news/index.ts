import { http } from '@/src/lib/http';

import type { Id, NewsArticleResponse, NewsFeedQuery, NewsFeedResponse, VendorInsight } from '../types';

export const newsApi = {
  feed(query: NewsFeedQuery = {}) {
    return http.get<NewsFeedResponse>('/news/feed', { query });
  },

  article(id: Id) {
    return http.get<NewsArticleResponse>(`/news/${id}`);
  },

  vendorInsight(id: Id) {
    return http.get<VendorInsight>(`/news/insights/vendor/${id}`);
  },
};
