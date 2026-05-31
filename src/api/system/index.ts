import { http } from '@/src/lib/http';

import type { HealthResponse } from '../types';

export const systemApi = {
  health() {
    return http.get<HealthResponse>('/health', {
      anonymous: true,
      skipRefresh: true,
    });
  },
};
