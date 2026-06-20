/* eslint-disable max-lines */

export type Id = string;
export type ISODateTime = string;
export type Kobo = number;

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type AuthRole = 'buyer' | 'vendor' | 'admin';

export type AuthUserPayload = {
  id: Id;
  username: string;
  email: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  role: AuthRole;
  kycVerified?: boolean;
  createdAt?: ISODateTime;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type MediaAsset = {
  id: Id;
  url: string;
  type: 'image' | 'video';
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
};

export type RankedProduct = {
  id: Id;
  vendorId: Id;
  title: string;
  description: string;
  price: Kobo;
  category: string;
  stock: number;
  mediaIds: Id[];
  media?: MediaAsset[];
  location: GeoPoint;
  isYfnVerified: boolean;
  distanceKm?: number;
};

export type VendorSummary = {
  id: Id;
  handle?: string;
  storeName: string;
  category?: string;
  rating: number;
  ratingCount: number;
  distanceKm?: number | null;
  isYfnVerified?: boolean;
  avatarUrl?: string | null;
};

export type Review = {
  id: Id;
  author: string;
  rating: number;
  age?: string;
  text: string;
  createdAt?: ISODateTime;
};

export type PageQuery = {
  page?: number;
  limit?: number;
  cursor?: string;
};

export type OtpPurpose = 'registration' | 'login' | 'password_reset' | 'verification';

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: 'buyer' | 'vendor';
  displayName?: string;
  phone?: string;
  dob?: string;
  gender?: 'female' | 'male' | 'non-binary' | 'prefer-not';
};

export type RegisterResponse = {
  user: AuthUserPayload;
} & AuthTokens;

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = RegisterResponse;

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutResponse = {
  success: true;
};

export type OtpSendRequest = {
  destination: string;
  purpose: OtpPurpose;
};

export type OtpSendResponse = {
  success: boolean;
  expiresInSeconds: number;
  retryAfterSeconds: number;
};

export type OtpVerifyRequest = OtpSendRequest & {
  code: string;
};

export type OtpVerifyResponse = {
  success: boolean;
  verifiedAt: ISODateTime;
  resetToken?: string;
};

export type PasswordResetRequest = {
  resetToken: string;
  password: string;
};

export type PasswordResetResponse = {
  success: boolean;
};

export type SubmitNinRequest = {
  nin: string;
};

export type SubmitNinResponse = {
  verified: boolean;
  name?: string;
  dob?: string;
};

export type SubmitBvnRequest = {
  bvn: string;
};

export type SubmitBvnResponse = {
  verified: boolean;
  banks?: { bankName: string; accountNumberLast4: string }[];
};

export type IdDocumentType = 'national' | 'passport' | 'driver' | 'voter';

export type SubmitIdDocumentRequest = {
  country: string;
  type: IdDocumentType;
  frontMediaId: Id;
  backMediaId?: Id;
};

export type SubmitIdDocumentResponse = {
  idDocumentId: Id;
  status: 'pending';
  extractedName?: string;
  reviewedAt?: ISODateTime;
};

export type SubmitSelfieResponse = {
  matched: boolean;
  verified: boolean;
  reviewedAt?: ISODateTime;
};

export type SignUploadRequest = {
  kind: 'product' | 'post' | 'story' | 'reel' | 'kyc' | 'chat';
  contentType: string;
  fileName?: string;
  sizeBytes?: number;
};

export type SignUploadResponse = {
  mediaId: Id;
  uploadUrl: string;
  publicUrl: string;
  headers: { 'Content-Type': string };
  expiresAt: ISODateTime;
};

export type DeleteAssetResponse = {
  success: true;
};

export type MarketplaceHomeQuery = PageQuery & {
  category?: string;
};

export type MarketplaceHomeResponse = {
  products: RankedProduct[];
  categories: string[];
};

export type MarketplaceNearbyQuery = PageQuery & {
  lat: number;
  lng: number;
  radiusKm: number;
  category?: string;
  sortBy?: 'relevance' | 'distance';
};

export type MarketplaceNearbyResponse = {
  vendors: { id: Id; storeName: string; distanceKm: number | null }[];
  products: RankedProduct[];
  query: {
    lat: number;
    lng: number;
    radiusKm: number;
    sortBy: 'relevance' | 'distance';
    matched: number;
  };
};

export type TopRatedQuery = {
  category?: string;
};

export type TopRatedResponse = {
  id: Id;
  storeName: string;
  rating: number;
  ratingCount: number;
}[];

export type ProductDetail = RankedProduct & {
  vendor: VendorSummary;
  images: string[];
  variants: {
    colors?: { key: string; hex?: string; label: string }[];
    sizes?: string[];
  };
  reviews: Review[];
  rating: number;
  ratingCount: number;
};

export type CreateProductRequest = {
  title: string;
  description?: string;
  price: Kobo;
  category: string;
  stock?: number;
  mediaIds?: Id[];
  variants?: {
    colors?: { key: string; hex?: string; label: string }[];
    sizes?: string[];
  };
  active?: boolean;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type StoreSetupRequest = {
  offerType: 'physical' | 'digital' | 'services';
  category: string;
  storeName: string;
  description?: string;
  address?: string;
  location?: GeoPoint;
  phone?: string;
  logoMediaId?: Id;
  bannerMediaId?: Id;
  hours?: { day: string; open: string; close: string; closed?: boolean }[];
};

export type VendorProfile = {
  id: Id;
  handle: string;
  name: string;
  storeName: string;
  category: string;
  rating: number;
  reviews: number;
  priceTier?: string;
  distance?: number;
  verified: boolean;
  rank?: string;
  open: boolean;
  closesAt?: string;
  address?: string | null;
  phone?: string | null;
  about?: string | null;
  hours: { day: string; hours: string }[];
  photos: string[];
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
};

export type StoreSetupResponse = {
  vendor: VendorProfile;
};

export type NearbyVendorsQuery = {
  lat: number;
  lng: number;
  radiusKm?: number;
  filter?: string;
};

export type NearbyVendorsResponse = {
  id: Id;
  name: string;
  category: string;
  distanceKm: number;
  rating: number;
}[];

export type SearchQuery = {
  q?: string;
  type?: 'people' | 'products' | 'tags' | 'places' | 'top';
  limit?: number;
};

export type SearchResponse = {
  people: {
    id: Id;
    handle: string;
    name: string;
    avatarUrl?: string | null;
    kycVerified: boolean;
    kind: 'buyer' | 'vendor';
  }[];
  products: RankedProduct[];
  tags: { tag: string; count: number }[];
  places: {
    id: Id;
    handle: string;
    storeName: string;
    category: string;
    rating: number;
    ratingCount: number;
    isYfnVerified: boolean;
  }[];
};

export type WalletTx = {
  id: Id;
  kind:
    | 'escrow_in'
    | 'release'
    | 'topup'
    | 'refund'
    | 'referral'
    | 'withdrawal'
    | 'fee'
    | 'adjustment';
  label: string;
  amount: Kobo;
  when: ISODateTime;
  orderId?: Id;
};

export type WalletResponse = {
  balance: Kobo;
  inEscrow: Kobo;
  accountNumber: string;
  bankName: string;
  recent: WalletTx[];
};

export type TopUpRequest = {
  amount: Kobo;
  source?: 'Paystack' | 'Bank transfer' | string;
};

export type TopUpResponse = {
  newBalance: Kobo;
  reference: Id;
};

export type WalletPayRequest = {
  amount: Kobo;
  orderId: Id;
  vendor: string;
};

export type WalletPayResponse = {
  orderId: Id;
  escrowTxId: Id;
};

export type ReleaseEscrowRequest = {
  amount: Kobo;
  vendor?: string;
};

export type ReleaseEscrowResponse = {
  success: boolean;
  orderId: Id;
  releasedAt: ISODateTime;
};

export type RefundEscrowRequest = {
  reason: string;
};

export type RefundEscrowResponse = {
  success: boolean;
  orderId: Id;
  refundedAt: ISODateTime;
};

export type WithdrawRequest = {
  amount: Kobo;
  bankAccountId: Id;
};

export type WithdrawResponse = {
  withdrawalId: Id;
  eta: string;
  newBalance: Kobo;
};

export type OrderStatus =
  | 'paid'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'refunded'
  | 'disputed';

export type OrderItem = {
  productId?: Id | null;
  name: string;
  qty: number;
  unit: Kobo;
  imageUrl?: string | null;
};

export type ShippingAddress = {
  recipient?: string;
  street: string;
  city?: string;
  state?: string;
  phone: string;
  geo?: GeoPoint;
};

export type Order = {
  id: Id;
  vendor: string;
  vendorHandle: string;
  vendorId: Id;
  items: OrderItem[];
  status: OrderStatus | string;
  placedAt: ISODateTime;
  estimatedDelivery?: string | null;
  shipTo: unknown;
  shipPhone?: string;
  referrerHandle?: string | null;
  goodsTotal: Kobo;
  deliveryFee: Kobo;
  platformFee: Kobo;
  referralFee: Kobo;
  grandTotal: Kobo;
};

export type OrdersQuery = PageQuery & {
  status?: OrderStatus;
  role?: 'buyer' | 'vendor';
};

export type CreateOrderRequest = {
  vendorId: Id;
  items: { productId: Id; qty: number; unit?: Kobo }[];
  shipTo: ShippingAddress;
  promoCode?: string;
  referrerHandle?: string;
};

export type OrderDetailResponse = Order & {
  timeline: {
    status: OrderStatus;
    label: string;
    at?: ISODateTime;
  }[];
};

export type SetOrderStatusRequest = {
  status: OrderStatus;
};

export type ConfirmOrderResponse = Order & {
  releasedAt: ISODateTime;
};

export type CreateDisputeRequest = {
  reason: string;
  photos?: Id[];
};

export type CreateDisputeResponse = {
  disputeId: Id;
};

export type CreateReviewRequest = {
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  photos?: Id[];
};

export type TrackOrderResponse = {
  orderId: Id;
  status: OrderStatus;
  eta?: string;
  currentLocation?: GeoPoint;
  timeline: { label: string; at?: ISODateTime; done: boolean }[];
};

export type Repost = {
  id: Id;
  productId: Id;
  vendorId: Id;
  caption?: string | null;
  visibility: 'public' | 'mutuals' | 'close-friends';
  ts: ISODateTime;
  earningsNgn: number;
  earnings: Kobo;
  clicks: number;
  conversions: number;
  shareUrl: string;
};

export type ReferralWalletResponse = {
  totalEarned: Kobo;
  clicks: number;
  conversions: number;
  list: Repost[];
};

export type CreateRepostRequest = {
  productId: Id;
  vendorId: Id;
  caption?: string;
  visibility?: 'public' | 'mutuals' | 'close-friends';
};

export type DeleteResponse = {
  success: true;
};

export type RepostReelRequest = {
  caption?: string;
};

export type RepostReelResponse = {
  id: Id;
  shareUrl: string;
  attribution: {
    expectedReferralFeeKobo: Kobo;
    tier: number;
  };
};

export type FeedAuthor = {
  id: Id;
  handle: string;
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
};

export type Post = {
  id: Id;
  author: FeedAuthor;
  caption: string;
  imageUrls: string[];
  product?: { id: Id; name: string; price: Kobo };
  createdAt: ISODateTime;
  likes: number;
  comments: number;
  reposts?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  repostedByMe?: boolean;
};

export type PostActionState = {
  postId: Id;
  likes: number;
  comments: number;
  bookmarks: number;
  reposts: number;
  likedByMe: boolean;
  savedByMe: boolean;
  repostedByMe: boolean;
  repost?: Repost;
};

export type Story = {
  id: Id;
  author: FeedAuthor;
  imageUrl: string;
  caption?: string | null;
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
};

export type Reel = {
  id: Id;
  author: FeedAuthor;
  videoUrl: string;
  coverUrl?: string | null;
  caption: string;
  audio?: string | null;
  createdAt: ISODateTime;
  views: number;
};

export type Comment = {
  id: Id;
  author: FeedAuthor;
  body: string;
  parentId?: Id | null;
  likes: number;
  createdAt: ISODateTime;
};

export type FeedQuery = {
  cursor?: string;
  limit?: number;
};

export type FeedResponse = {
  items: Post[];
  nextCursor: string | null;
};

export type CreatePostRequest = {
  caption: string;
  mediaIds: Id[];
  productId?: Id;
};

export type CommentsResponse = {
  comments: Comment[];
  nextCursor: string | null;
};

export type CreateCommentRequest = {
  body: string;
  parentId?: Id;
};

export type CreateStoryRequest = {
  mediaId: Id;
  caption?: string;
};

export type CreateReelRequest = {
  videoMediaId: Id;
  coverMediaId?: Id;
  caption: string;
  audio?: string;
};

export type ChatConversation = {
  id: Id;
  participants: {
    userId: Id;
    role: 'buyer' | 'vendor' | 'admin';
    lastReadAt?: ISODateTime;
    username?: string;
    name?: string;
    avatarUrl?: string;
  }[];
  productId?: Id | null;
  orderId?: Id | null;
  lastMessagePreview?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type ChatMessage = {
  id: Id;
  conversationId: Id;
  senderId: Id;
  kind: 'text' | 'image' | 'product_card' | 'system';
  body?: string | null;
  mediaId?: Id | null;
  imageUrl?: string | null;
  productId?: Id | null;
  createdAt: ISODateTime;
};

export type StartConversationRequest = {
  participantUserId: Id;
  productId?: Id;
  orderId?: Id;
};

export type ListConversationsQuery = PageQuery;

export type ListMessagesQuery = PageQuery;

export type SendMessageRequest =
  | { kind: 'text'; body: string }
  | { kind: 'image'; imageUrl: string; mediaId?: Id }
  | { kind: 'product_card'; productId: Id };

export type NotificationItem = {
  id: Id;
  userId: Id;
  kind: string;
  title: string;
  body: string;
  data?: unknown;
  readAt: ISODateTime | null;
  createdAt: ISODateTime;
};

export type NotificationsQuery = {
  page?: number;
  unread?: 'true';
  cursor?: string;
  limit?: number;
};

export type Address = {
  id: Id;
  label: string;
  recipient: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  isDefault?: boolean;
};

export type PaymentMethod = {
  id: Id;
  type: 'card' | 'transfer' | 'wallet';
  brand?: 'visa' | 'mastercard' | 'verve';
  last4?: string;
  label: string;
  isDefault?: boolean;
};

export type MeResponse = AuthUserPayload & {
  handle: string;
  name: string;
  phone?: string | null;
  isPrivate: boolean;
  hasStore: boolean;
};

export type UpdateMeRequest = {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarMediaId?: Id;
  isPrivate?: boolean;
  notificationPrefs?: Record<string, boolean>;
  privacyPrefs?: Record<string, boolean>;
};

export type CreateAddressRequest = Omit<Address, 'id'>;
export type UpdateAddressRequest = Partial<Omit<Address, 'id'>>;

export type CreatePaymentMethodRequest = {
  type: 'card' | 'transfer' | 'wallet';
  paystackAuthorizationCode?: string;
  label?: string;
  isDefault?: boolean;
};

export type DataExportResponse = {
  url: string;
  expiresAt: ISODateTime;
};

export type DeleteMeResponse = {
  success: boolean;
  deletionScheduledAt: ISODateTime;
};

export type LiveMatch = {
  title: string;
  meta: string;
  status: 'live' | 'finished' | 'upcoming';
  periodLabel?: string;
  home: { name: string; flag: string; scores: number[] };
  away: { name: string; flag: string; scores: number[] };
};

export type HiveNode = {
  slug: string;
  name: string;
  emoji?: string | null;
  description?: string | null;
  members: number;
  pinnedTopic?: string | null;
  bot?: string | null;
  liveMatch?: unknown;
  children: HiveNode[];
};

export type HiveMessage = {
  id: Id;
  community: string;
  author: string;
  initial: string;
  text: string;
  time: ISODateTime;
  createdAt: ISODateTime;
  mine: boolean;
  bot: boolean;
};

export type HiveDetailResponse = {
  node: HiveNode;
  topic?: string | null;
  messages: HiveMessage[];
  joined: boolean;
};

export type HiveMessagesResponse = {
  messages: HiveMessage[];
  nextCursor: null;
};

export type CreateHiveMessageRequest = {
  text: string;
};

export type VotePollRequest = {
  optionKey: string;
};

export type PollResult = {
  pollId: Id;
  options: { key: string; label: string; votes: number; mine: boolean }[];
  totalVotes: number;
};

export type HiveRealtimeEvent =
  | { kind: 'message'; message: HiveMessage }
  | { kind: 'poll_update'; result: PollResult }
  | { kind: 'pinned_topic'; topic: string }
  | { kind: 'bot_message'; message: HiveMessage };

export type Article = {
  id: Id;
  title: string;
  category: string;
  coverUrl?: string | null;
  author: unknown;
  publishedAt: ISODateTime;
  readMin: number;
  claps: number;
  comments: number;
  excerpt: string;
  paragraphs: string[];
  tags: string[];
  savedByMe: boolean;
  clappedByMe: boolean;
};

export type NewsFeedQuery = {
  personalised?: boolean;
  category?: 'For you' | 'Trending' | 'Music' | 'Sport' | 'Business' | string;
  cursor?: string;
  limit?: number;
};

export type NewsFeedResponse = {
  articles: Article[];
  trendingTags: string[];
  nextCursor: string | null;
};

export type NewsArticleResponse = Article & {
  related: Article[];
};

export type VendorInsight = {
  vendorId: Id;
  highlights: {
    title: string;
    body: string;
    severity?: 'info' | 'warning' | 'success';
  }[];
  productSignals: { productId: Id; label: string; score: number }[];
  generatedAt: ISODateTime;
};

export type BookServiceRequest = {
  when: ISODateTime;
  location: GeoPoint & {
    address?: string;
  };
};

export type BookServiceResponse = {
  bookingId: Id;
};

export type BookingTrackResponse = {
  status: 'requested' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  coords?: GeoPoint;
  eta?: string;
};

export type BookingLocationEvent = {
  bookingId: Id;
  status: BookingTrackResponse['status'];
  coords?: GeoPoint;
  eta?: string;
};

export type HealthResponse = {
  status: string;
  uptimeSeconds: number;
  environment: string;
  db: { connected: boolean };
  timestamp: ISODateTime;
};
