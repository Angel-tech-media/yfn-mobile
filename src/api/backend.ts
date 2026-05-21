/**
 * Real backend client. Mirrors the shape used by `./index.ts` (mock layer)
 * but actually hits the NestJS server documented at `API.md`.
 *
 * Screens can stay on `./index.ts` until each function is flipped over —
 * see `authApi.login` for the worked example.
 */

import { http } from '@/src/lib/http';

// ───────────────────────── Auth ─────────────────────────

export interface AuthUserPayload {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  role: 'buyer' | 'vendor' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authBackend = {
  register(input: {
    username: string;
    email: string;
    password: string;
    role: 'buyer' | 'vendor';
  }) {
    return http.post<{ user: AuthUserPayload } & AuthTokens>('/auth/register', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  login(input: { email: string; password: string }) {
    return http.post<{ user: AuthUserPayload } & AuthTokens>('/auth/login', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  refresh(refreshToken: string) {
    return http.post<AuthTokens>(
      '/auth/refresh',
      { refreshToken },
      { anonymous: true, skipRefresh: true },
    );
  },

  logout() {
    return http.post<{ success: true }>('/auth/logout');
  },
};

// ───────────────────────── OTP ─────────────────────────

type OtpPurpose = 'registration' | 'login' | 'password_reset' | 'verification';

export const otpBackend = {
  send(destination: string, purpose: OtpPurpose) {
    return http.post<{ success: boolean; expiresInSeconds: number; retryAfterSeconds: number }>(
      '/auth/otp/send',
      { destination, purpose },
      { anonymous: true, skipRefresh: true },
    );
  },

  verify(destination: string, purpose: OtpPurpose, code: string) {
    return http.post<{ success: boolean; verifiedAt: string }>(
      '/auth/otp/verify',
      { destination, purpose, code },
      { anonymous: true, skipRefresh: true },
    );
  },
};

// ───────────────────────── Marketplace ─────────────────────────

export interface RankedProduct {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  mediaIds: string[];
  location: { lat: number; lng: number };
  isYfnVerified: boolean;
  distanceKm?: number;
}

export const marketplaceBackend = {
  home(query: { page?: number; limit?: number; category?: string } = {}) {
    return http.get<{ products: RankedProduct[]; categories: string[] }>(
      '/marketplace/home',
      { query },
    );
  },

  nearby(query: {
    lat: number;
    lng: number;
    radiusKm: number;
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: 'relevance' | 'distance';
  }) {
    return http.get<{
      vendors: Array<{ id: string; storeName: string; distanceKm: number | null }>;
      products: RankedProduct[];
      query: { lat: number; lng: number; radiusKm: number; sortBy: string; matched: number };
    }>('/marketplace/nearby', { query });
  },

  topRated(category?: string) {
    return http.get<Array<{ id: string; storeName: string; rating: number; ratingCount: number }>>(
      '/marketplace/top-rated',
      { query: { category } },
    );
  },
};

// ───────────────────────── Products ─────────────────────────

export const productsBackend = {
  byId(id: string) {
    return http.get<RankedProduct>(`/products/${id}`);
  },
};

// ───────────────────────── Feed / Repost ─────────────────────────

export const feedBackend = {
  reels(query: { page?: number; limit?: number } = {}) {
    return http.get<unknown[]>('/feed/reels', { query });
  },

  repost(reelId: string, caption?: string) {
    return http.post<{
      id: string;
      shareUrl: string;
      attribution: { expectedReferralFeeKobo: number; tier: number };
    }>(`/feed/reels/${reelId}/repost`, { caption });
  },
};

// ───────────────────────── Chat ─────────────────────────

export interface ChatConversation {
  id: string;
  participants: Array<{ userId: string; role: 'buyer' | 'vendor'; lastReadAt?: string }>;
  productId?: string;
  orderId?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  kind: 'text' | 'image' | 'product_card' | 'system';
  body?: string;
  mediaId?: string;
  productId?: string;
  createdAt: string;
}

export const chatBackend = {
  startOrFetch(participantUserId: string, productId?: string, orderId?: string) {
    return http.post<ChatConversation>('/chat/conversations', {
      participantUserId,
      productId,
      orderId,
    });
  },

  listConversations(query: { page?: number; limit?: number } = {}) {
    return http.get<ChatConversation[]>('/chat/conversations', { query });
  },

  getConversation(id: string) {
    return http.get<ChatConversation>(`/chat/conversations/${id}`);
  },

  listMessages(conversationId: string, query: { page?: number; limit?: number } = {}) {
    return http.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`, {
      query,
    });
  },

  sendText(conversationId: string, body: string) {
    return http.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      { kind: 'text', body },
    );
  },

  sendImage(conversationId: string, imageUrl: string) {
    return http.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      { kind: 'image', imageUrl },
    );
  },

  sendProductCard(conversationId: string, productId: string) {
    return http.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      { kind: 'product_card', productId },
    );
  },

  markRead(conversationId: string) {
    return http.post<ChatConversation>(`/chat/conversations/${conversationId}/read`);
  },
};

// ───────────────────────── Notifications ─────────────────────────

export interface NotificationItem {
  id: string;
  userId: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationsBackend = {
  list(unreadOnly = false) {
    return http.get<NotificationItem[]>('/notifications', {
      query: unreadOnly ? { unread: 'true' } : undefined,
    });
  },

  markRead(id: string) {
    return http.patch<{ read: boolean }>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return http.patch<{ success: boolean; count: number }>('/notifications/read-all');
  },

  registerDevice(token: string, platform: 'ios' | 'android' | 'web') {
    return http.post<{ success: boolean }>('/notifications/device-token', { token, platform });
  },
};

// ───────────────────────── Health ─────────────────────────

export const systemBackend = {
  health() {
    return http.get<{
      status: string;
      uptimeSeconds: number;
      environment: string;
      db: { connected: boolean };
      timestamp: string;
    }>('/health', { anonymous: true, skipRefresh: true });
  },
};
