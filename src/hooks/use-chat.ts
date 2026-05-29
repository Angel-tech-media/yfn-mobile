import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatBackend, type ChatConversation, type ChatMessage } from '@/src/api/backend';

const MESSAGE_POLL_MS = 4000;

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatBackend.listConversations({ limit: 50 }),
    staleTime: 10_000,
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: ['chat', 'conversation', id],
    enabled: !!id,
    queryFn: () => chatBackend.getConversation(id!),
    staleTime: 10_000,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    enabled: !!conversationId,
    queryFn: () => chatBackend.listMessages(conversationId!, { limit: 100 }),
    refetchInterval: MESSAGE_POLL_MS,
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { participantUserId: string; productId?: string; orderId?: string }) =>
      chatBackend.startOrFetch(input.participantUserId, input.productId, input.orderId),
    onSuccess: (conv: ChatConversation) => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      qc.setQueryData<ChatConversation>(['chat', 'conversation', conv.id], conv);
    },
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      kind: 'text' | 'image' | 'product_card';
      body?: string;
      imageUrl?: string;
      productId?: string;
    }) => {
      if (!conversationId) throw new Error('conversationId required');
      if (input.kind === 'text') return chatBackend.sendText(conversationId, input.body ?? '');
      if (input.kind === 'image')
        return chatBackend.sendImage(conversationId, input.imageUrl ?? '');
      return chatBackend.sendProductCard(conversationId, input.productId ?? '');
    },
    onSuccess: (message: ChatMessage) => {
      qc.setQueryData<ChatMessage[]>(
        ['chat', 'messages', conversationId],
        (prev) => (prev ? [...prev, message] : [message]),
      );
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatBackend.markRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}
