import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/src/config/api';
import { useAuth } from '@/src/store/auth';
import { useToast } from '@/src/providers/toast-provider';
import { vibeHaptics } from '@/src/lib/haptics';
import type { ChatMessage } from '@/src/api/types';

const PRIMARY_SOCKET_PATH = '/ws/chat';
const LEGACY_SOCKET_PATH = '/ws';

export function useGlobalChatNotifications(): void {
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const accessToken = useAuth((s) => s.accessToken);
  const toast = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id || !accessToken) return;

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
        socket.emit('user:join', { userId: user.id });
      });

      socket.on('connect_error', () => {
        if (path === PRIMARY_SOCKET_PATH && socketRef.current === socket) {
          socket.disconnect();
          connect(LEGACY_SOCKET_PATH);
        }
      });

      socket.on('chat:incoming', ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
        vibeHaptics.light();
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
        qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });

        const preview = message.body || (message.kind === 'image' ? 'Sent an image' : 'New message');
        toast.info('New message received', {
          description: preview,
          action: {
            label: 'Open',
            onPress: () => router.push(`/threads/${conversationId}` as never),
          },
        });
      });
    };

    connect(PRIMARY_SOCKET_PATH);

    return () => {
      socketRef.current?.emit('user:leave', { userId: user.id });
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, accessToken, qc, toast]);
}
