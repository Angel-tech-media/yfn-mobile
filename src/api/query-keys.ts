export const queryKeys = {
  system: {
    health: ['system', 'health'] as const,
  },
  marketplace: {
    home: (params?: unknown) => ['marketplace', 'home', params ?? {}] as const,
    nearby: (params?: unknown) => ['marketplace', 'nearby', params ?? {}] as const,
    topRated: (params?: unknown) => ['marketplace', 'top-rated', params ?? {}] as const,
  },
  products: {
    detail: (id?: string) => ['products', id] as const,
  },
  vendors: {
    nearby: (params?: unknown) => ['vendors', 'nearby', params ?? {}] as const,
    detail: (handle?: string) => ['vendors', handle] as const,
    products: (handle?: string) => ['vendors', handle, 'products'] as const,
    reviews: (handle?: string) => ['vendors', handle, 'reviews'] as const,
  },
  search: {
    results: (params?: unknown) => ['search', params ?? {}] as const,
  },
  wallet: {
    me: ['wallet'] as const,
    referrals: ['wallet', 'referrals'] as const,
  },
  orders: {
    list: (params?: unknown) => ['orders', params ?? {}] as const,
    detail: (id?: string) => ['orders', id] as const,
    track: (id?: string) => ['orders', id, 'track'] as const,
  },
  reposts: {
    me: ['reposts', 'me'] as const,
  },
  feed: {
    list: (params?: unknown) => ['feed', params ?? {}] as const,
    reels: (params?: unknown) => ['feed', 'reels', params ?? {}] as const,
    comments: (postId?: string, params?: unknown) =>
      ['posts', postId, 'comments', params ?? {}] as const,
    storiesInbox: ['stories', 'inbox'] as const,
  },
  chat: {
    conversations: (params?: unknown) => ['chat', 'conversations', params ?? {}] as const,
    conversation: (id?: string) => ['chat', 'conversation', id] as const,
    messages: (id?: string, params?: unknown) => ['chat', 'messages', id, params ?? {}] as const,
  },
  notifications: {
    list: (params?: unknown) => ['notifications', params ?? {}] as const,
  },
  account: {
    me: ['me'] as const,
    addresses: ['me', 'addresses'] as const,
    paymentMethods: ['me', 'payment-methods'] as const,
    dataExport: ['me', 'data-export'] as const,
  },
  hive: {
    tree: ['hive', 'tree'] as const,
    detail: (slugPath?: string) => ['hive', slugPath] as const,
    messages: (slugPath?: string, params?: unknown) =>
      ['hive', slugPath, 'messages', params ?? {}] as const,
  },
  news: {
    feed: (params?: unknown) => ['news', 'feed', params ?? {}] as const,
    article: (id?: string) => ['news', id] as const,
    vendorInsight: (id?: string) => ['news', 'insights', 'vendor', id] as const,
  },
  bookings: {
    track: (id?: string) => ['bookings', id, 'track'] as const,
  },
};
