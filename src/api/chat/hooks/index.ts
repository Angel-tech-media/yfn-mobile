import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatApi } from '..';
import { queryKeys } from '../../query-keys';

import type {
  ChatConversation,
  ChatMessage,
  Id,
  ListConversationsQuery,
  ListMessagesQuery,
  SendMessageRequest,
  StartConversationRequest,
} from '../../types';

const MESSAGE_POLL_MS = 4000;

export function useConversations(params: ListConversationsQuery = { limit: 50 }) {
  return useQuery({
    queryKey: queryKeys.chat.conversations(params),
    queryFn: () => chatApi.listConversations(params),
    staleTime: 10_000,
  });
}

export function useConversation(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(id),
    enabled: !!id,
    queryFn: () => chatApi.getConversation(id!),
    staleTime: 10_000,
  });
}

export function useMessages(conversationId: Id | undefined, params: ListMessagesQuery = { limit: 100 }) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId, params),
    enabled: !!conversationId,
    queryFn: () => chatApi.listMessages(conversationId!, params),
    refetchInterval: MESSAGE_POLL_MS,
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartConversationRequest) => chatApi.startOrFetch(input),
    onSuccess: (conv: ChatConversation) => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      qc.setQueryData(queryKeys.chat.conversation(conv.id), conv);
    },
  });
}

export function useSendMessage(conversationId: Id | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendMessageRequest) => {
      if (!conversationId) throw new Error('conversationId required');
      return chatApi.sendMessage(conversationId, input);
    },
    onSuccess: (message: ChatMessage) => {
      qc.setQueriesData<ChatMessage[]>(
        { queryKey: ['chat', 'messages', conversationId] },
        (prev) => (prev ? [...prev, message] : [message]),
      );
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: Id) => chatApi.markRead(conversationId),
    onSuccess: (conv) => {
      qc.setQueryData(queryKeys.chat.conversation(conv.id), conv);
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}
