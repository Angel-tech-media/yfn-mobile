import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

import { API_BASE_URL } from '@/src/config/api';
import { useAuth } from '@/src/store/auth';

import type { ChatConversation, ChatMessage } from '@/src/api/types';

const PRIMARY_SOCKET_PATH = '/ws/chat';
const LEGACY_SOCKET_PATH = '/ws';

function appendMessage(prev: ChatMessage[] | undefined, message: ChatMessage): ChatMessage[] {
  if (!prev) return [message];
  if (prev.some((m) => m.id === message.id)) return prev;
  return [...prev, message];
}

/**
 * Subscribes a screen to live updates for a single conversation.
 *
 * On mount: opens a Socket.IO connection to /ws/chat, emits `chat:join` with
 * the conversation id, and on every `chat:message` event pushes the message
 * into the React Query cache for `['chat', 'messages', conversationId]` so
 * the existing screen rerenders without polling.
 *
 * On unmount: leaves the room and disconnects.
 *
 * The polling cadence in `use-chat.ts#useMessages` is the fallback for
 * clients that can't establish a WebSocket (corporate Wi-Fi, etc.).
 */
export function useChatSocket(conversationId: string | undefined): void {
  const qc = useQueryClient();
  const accessToken = useAuth((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!conversationId || !accessToken) return;

    const connect = (path: string) => {
      const socket = io(API_BASE_URL, {
        path,
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('chat:join', { conversationId });
      });

      socket.on('connect_error', () => {
        if (path === PRIMARY_SOCKET_PATH && socketRef.current === socket) {
          socket.disconnect();
          connect(LEGACY_SOCKET_PATH);
        }
      });

      socket.on('chat:message', (message: ChatMessage) => {
        qc.setQueriesData<ChatMessage[]>(
          { queryKey: ['chat', 'messages', conversationId] },
          (prev) => appendMessage(prev, message),
        );
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      });

      socket.on('chat:updated', (conversation: ChatConversation) => {
        qc.setQueryData(['chat', 'conversation', conversation.id], conversation);
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      });
    };

    connect(PRIMARY_SOCKET_PATH);

    return () => {
      socketRef.current?.emit('chat:leave', { conversationId });
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, accessToken, qc]);
}
