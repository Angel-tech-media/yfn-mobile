import { http } from '@/src/lib/http';

import type {
  CreateRepostRequest,
  DeleteResponse,
  Id,
  Repost,
  RepostReelRequest,
  RepostReelResponse,
} from '../types';

export const repostsApi = {
  mine() {
    return http.get<Repost[]>('/reposts/me');
  },

  create(input: CreateRepostRequest) {
    return http.post<Repost>('/reposts', input);
  },

  delete(id: Id) {
    return http.delete<DeleteResponse>(`/reposts/${id}`);
  },

  repostReel(reelId: Id, input: RepostReelRequest = {}) {
    return http.post<RepostReelResponse>(`/feed/reels/${reelId}/repost`, input);
  },
};
