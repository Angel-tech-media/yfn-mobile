import { http } from '@/src/lib/http';

import type {
  ChatConversation,
  ChatMessage,
  Id,
  ListConversationsQuery,
  ListMessagesQuery,
  SendMessageRequest,
  StartConversationRequest,
} from '../types';

export const chatApi = {
  startOrFetch(input: StartConversationRequest) {
    return http.post<ChatConversation>('/chat/conversations', input);
  },

  listConversations(query: ListConversationsQuery = {}) {
    return http.get<ChatConversation[]>('/chat/conversations', { query });
  },

  getConversation(id: Id) {
    return http.get<ChatConversation>(`/chat/conversations/${id}`);
  },

  listMessages(conversationId: Id, query: ListMessagesQuery = {}) {
    return http.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`, {
      query,
    });
  },

  sendMessage(conversationId: Id, input: SendMessageRequest) {
    return http.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, input);
  },

  markRead(conversationId: Id) {
    return http.post<ChatConversation>(`/chat/conversations/${conversationId}/read`);
  },
};
