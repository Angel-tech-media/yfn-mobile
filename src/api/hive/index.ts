import { http } from '@/src/lib/http';

import type {
  HiveDetailResponse,
  HiveMessagesResponse,
  HiveNode,
  Id,
  PageQuery,
  PollResult,
  VotePollRequest,
  CreateHiveMessageRequest,
  HiveMessage,
} from '../types';

const pathFor = (slugPath: string) => `/hive/${encodeURIComponent(slugPath)}`;

export const hiveApi = {
  tree() {
    return http.get<HiveNode[]>('/hive/tree');
  },

  detail(slugPath: string) {
    return http.get<HiveDetailResponse>(pathFor(slugPath));
  },

  join(slugPath: string) {
    return http.post<{ success: true }>(`${pathFor(slugPath)}/join`);
  },

  messages(slugPath: string, query: PageQuery = {}) {
    return http.get<HiveMessagesResponse>(`${pathFor(slugPath)}/messages`, { query });
  },

  sendMessage(slugPath: string, input: CreateHiveMessageRequest) {
    return http.post<HiveMessage>(`${pathFor(slugPath)}/messages`, input);
  },

  vote(slugPath: string, id: Id, input: VotePollRequest) {
    return http.post<PollResult>(`${pathFor(slugPath)}/polls/${id}/vote`, input);
  },
};
