/**
 * Compatibility exports for older screens/hooks. New code should import from
 * resource folders such as `@/src/api/notifications` and
 * `@/src/api/notifications/hooks`.
 */

import { authApi } from './auth';
import { chatApi } from './chat';
import { feedApi } from './feed';
import { marketplaceApi } from './marketplace';
import { notificationsApi } from './notifications';
import { productsApi } from './products';
import { repostsApi } from './reposts';
import { systemApi } from './system';

import type { OtpPurpose } from './types';

export type {
  AuthTokens,
  AuthUserPayload,
  ChatConversation,
  ChatMessage,
  NotificationItem,
  RankedProduct,
} from './types';

export const authBackend = authApi;

export const otpBackend = {
  send(destination: string, purpose: OtpPurpose) {
    return authApi.sendOtp({ destination, purpose });
  },

  verify(destination: string, purpose: OtpPurpose, code: string) {
    return authApi.verifyOtp({ destination, purpose, code });
  },
};

export const marketplaceBackend = marketplaceApi;
export const productsBackend = productsApi;

export const feedBackend = {
  reels: feedApi.reels,
  repost(reelId: string, caption?: string) {
    return repostsApi.repostReel(reelId, { caption });
  },
};

export const chatBackend = {
  startOrFetch(participantUserId: string, productId?: string, orderId?: string) {
    return chatApi.startOrFetch({ participantUserId, productId, orderId });
  },
  listConversations: chatApi.listConversations,
  getConversation: chatApi.getConversation,
  listMessages: chatApi.listMessages,
  sendText(conversationId: string, body: string) {
    return chatApi.sendMessage(conversationId, { kind: 'text', body });
  },
  sendImage(conversationId: string, imageUrl: string) {
    return chatApi.sendMessage(conversationId, { kind: 'image', imageUrl });
  },
  sendProductCard(conversationId: string, productId: string) {
    return chatApi.sendMessage(conversationId, { kind: 'product_card', productId });
  },
  markRead: chatApi.markRead,
};

export const notificationsBackend = {
  list(unreadOnly = false) {
    return notificationsApi.list(unreadOnly ? { unread: 'true' } : {});
  },
  markRead: notificationsApi.markRead,
  markAllRead: notificationsApi.markAllRead,
  registerDevice(token: string, platform: 'ios' | 'android' | 'web') {
    return notificationsApi.registerDeviceToken({ token, platform });
  },
};

export const systemBackend = systemApi;
