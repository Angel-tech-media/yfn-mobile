# Vibe Backend API Contract

This document is the backend handoff for the Expo/React Native frontend in this
repo. It is derived from:

- `src/api/backend.ts` for endpoints already wired to the live API client.
- `src/api/index.ts` for mock endpoints that still need a real backend.
- `src/store/*` and app screens for response fields the UI renders.
- `backend/schema.sql` for persisted entities and money invariants.

## Transport

Base URL is configured in `src/config/api.ts`:

```text
{EXPO_PUBLIC_API_URL}/api/v1
```

Requests and responses are JSON unless an endpoint explicitly says multipart or
redirect. Authenticated endpoints require:

```text
Authorization: Bearer <accessToken>
```

The live `src/lib/http.ts` client expects the response body directly, not an
`{ ok, data }` envelope. Error responses should be:

```ts
type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};
```

Use standard HTTP statuses: `400` validation, `401` unauthenticated, `403`
forbidden, `404` missing resource, `409` conflict/idempotency collision, `422`
domain rule violation, `429` rate limited, `500` server error.

## Global Conventions

Money values returned by backend endpoints should be integer kobo. The live
marketplace screens already divide `price / 100` for display. Older local
Zustand mocks use NGN numbers; convert at the API adapter boundary when replacing
mock calls.

All timestamps are ISO 8601 strings unless called out as local mock-only values.
All IDs are strings, normally UUIDs.

Wallet-mutating endpoints must require an `Idempotency-Key` header.

```ts
type Id = string;
type ISODateTime = string;
type Kobo = number;

type PageQuery = {
  page?: number;
  limit?: number;
  cursor?: string;
};
```

## Shared Schemas

```ts
type AuthRole = 'buyer' | 'vendor' | 'admin';

type AuthUser = {
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

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type GeoPoint = {
  lat: number;
  lng: number;
};

type MediaAsset = {
  id: Id;
  url: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  durationMs?: number;
};

type RankedProduct = {
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

type VendorSummary = {
  id: Id;
  handle: string;
  storeName: string;
  category?: string;
  rating: number;
  ratingCount: number;
  distanceKm?: number | null;
  isYfnVerified?: boolean;
  avatarUrl?: string | null;
};
```

## Required Endpoint Surface

These are the endpoints the backend should expose for the current frontend to
work when every mock store is replaced by API calls.

| Area | Method | Path |
| --- | --- | --- |
| System | `GET` | `/health` |
| Auth | `POST` | `/auth/register` |
| Auth | `POST` | `/auth/login` |
| Auth | `POST` | `/auth/refresh` |
| Auth | `POST` | `/auth/logout` |
| OTP | `POST` | `/auth/otp/send` |
| OTP | `POST` | `/auth/otp/verify` |
| Password | `POST` | `/auth/password/reset` |
| KYC | `POST` | `/auth/kyc/nin` |
| KYC | `POST` | `/auth/kyc/bvn` |
| KYC | `POST` | `/auth/kyc/id-document` |
| KYC | `POST` | `/auth/kyc/selfie` |
| Uploads | `POST` | `/upload/sign` |
| Marketplace | `GET` | `/marketplace/home` |
| Marketplace | `GET` | `/marketplace/nearby` |
| Marketplace | `GET` | `/marketplace/top-rated` |
| Products | `GET` | `/products/:id` |
| Products | `POST` | `/products` |
| Products | `PATCH` | `/products/:id` |
| Products | `DELETE` | `/products/:id` |
| Vendors | `POST` | `/vendors/store-setup` |
| Vendors | `GET` | `/vendors/nearby` |
| Vendors | `GET` | `/vendors/:handle` |
| Vendors | `GET` | `/vendors/:handle/products` |
| Vendors | `GET` | `/vendors/:handle/reviews` |
| Vendors | `POST` | `/vendors/:handle/follow` |
| Search | `GET` | `/search` |
| Wallet | `GET` | `/wallet` |
| Wallet | `POST` | `/wallet/topup` |
| Wallet | `POST` | `/wallet/pay` |
| Wallet | `POST` | `/wallet/release/:orderId` |
| Wallet | `POST` | `/wallet/refund/:orderId` |
| Wallet | `POST` | `/wallet/withdraw` |
| Wallet | `GET` | `/wallet/referrals` |
| Orders | `GET` | `/orders` |
| Orders | `POST` | `/orders` |
| Orders | `GET` | `/orders/:id` |
| Orders | `PATCH` | `/orders/:id/status` |
| Orders | `POST` | `/orders/:id/confirm` |
| Orders | `POST` | `/orders/:id/dispute` |
| Orders | `POST` | `/orders/:id/review` |
| Orders | `GET` | `/orders/:id/track` |
| Reposts | `GET` | `/reposts/me` |
| Reposts | `POST` | `/reposts` |
| Reposts | `DELETE` | `/reposts/:id` |
| Reposts | `GET` | `/reposts/:id/click` |
| Feed | `GET` | `/feed` |
| Feed | `GET` | `/feed/reels` |
| Feed | `POST` | `/feed/reels/:reelId/repost` |
| Posts | `POST` | `/posts` |
| Posts | `GET` | `/posts/:id/comments` |
| Posts | `POST` | `/posts/:id/comments` |
| Stories | `POST` | `/stories` |
| Stories | `GET` | `/stories/inbox` |
| Reels | `POST` | `/reels` |
| Chat | `POST` | `/chat/conversations` |
| Chat | `GET` | `/chat/conversations` |
| Chat | `GET` | `/chat/conversations/:id` |
| Chat | `GET` | `/chat/conversations/:id/messages` |
| Chat | `POST` | `/chat/conversations/:id/messages` |
| Chat | `POST` | `/chat/conversations/:id/read` |
| Chat realtime | Socket.IO | `/ws/chat` |
| Notifications | `GET` | `/notifications` |
| Notifications | `PATCH` | `/notifications/:id/read` |
| Notifications | `PATCH` | `/notifications/read-all` |
| Notifications | `POST` | `/notifications/device-token` |
| Account | `GET` | `/me` |
| Account | `PATCH` | `/me` |
| Account | `GET` | `/me/addresses` |
| Account | `POST` | `/me/addresses` |
| Account | `PATCH` | `/me/addresses/:id` |
| Account | `DELETE` | `/me/addresses/:id` |
| Account | `GET` | `/me/payment-methods` |
| Account | `POST` | `/me/payment-methods` |
| Account | `DELETE` | `/me/payment-methods/:id` |
| Account | `GET` | `/me/data-export` |
| Account | `DELETE` | `/me` |
| Hive | `GET` | `/hive/tree` |
| Hive | `GET` | `/hive/:slugPath` |
| Hive | `POST` | `/hive/:slugPath/join` |
| Hive | `GET` | `/hive/:slugPath/messages` |
| Hive | `POST` | `/hive/:slugPath/messages` |
| Hive | `POST` | `/hive/:slugPath/polls/:id/vote` |
| Hive realtime | Socket.IO or WS | `/ws/hive/:slugPath` |
| News | `GET` | `/news/feed` |
| News | `GET` | `/news/:id` |
| News | `GET` | `/news/insights/vendor/:id` |
| Booking | `POST` | `/services/:productId/book` |
| Booking | `GET` | `/bookings/:id/track` |
| Booking realtime | Socket.IO or WS | `/ws/bookings/:id/track` |

## System

### `GET /health`

Public. Used by `systemBackend.health()`.

Response:

```ts
type HealthResponse = {
  status: string;
  uptimeSeconds: number;
  environment: string;
  db: { connected: boolean };
  timestamp: ISODateTime;
};
```

## Auth, OTP, Password, KYC

### `POST /auth/register`

Public. The live client currently sends only `username`, `email`, `password`,
and `role`, while signup screens collect richer profile data. Backend should
accept the full shape and only require the minimal live-client fields.

Request:

```ts
type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: 'buyer' | 'vendor';
  displayName?: string;
  phone?: string;
  dob?: string;
  gender?: 'female' | 'male' | 'non-binary' | 'prefer-not';
};
```

Response:

```ts
type RegisterResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
```

### `POST /auth/login`

Public. Used by `authBackend.login()` through `useAuth.signIn()`.

Request:

```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

Response:

```ts
type LoginResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
```

### `POST /auth/refresh`

Public. Used automatically after `401`.

Request:

```ts
type RefreshRequest = {
  refreshToken: string;
};
```

Response:

```ts
type RefreshResponse = AuthTokens;
```

### `POST /auth/logout`

Authenticated.

Request body: none.

Response:

```ts
type LogoutResponse = {
  success: true;
};
```

### `POST /auth/otp/send`

Public. Used by registration verification, two-factor, and password reset
screens.

Request:

```ts
type OtpPurpose = 'registration' | 'login' | 'password_reset' | 'verification';

type OtpSendRequest = {
  destination: string; // email or phone
  purpose: OtpPurpose;
};
```

Response:

```ts
type OtpSendResponse = {
  success: boolean;
  expiresInSeconds: number;
  retryAfterSeconds: number;
};
```

### `POST /auth/otp/verify`

Public.

Request:

```ts
type OtpVerifyRequest = {
  destination: string;
  purpose: OtpPurpose;
  code: string; // six digits
};
```

Response:

```ts
type OtpVerifyResponse = {
  success: boolean;
  verifiedAt: ISODateTime;
  resetToken?: string; // required when purpose === 'password_reset'
};
```

### `POST /auth/password/reset`

Public. Needed by the reset-password screen after OTP verification.

Request:

```ts
type PasswordResetRequest = {
  resetToken: string;
  password: string;
};
```

Response:

```ts
type PasswordResetResponse = {
  success: boolean;
};
```

### `POST /auth/kyc/nin`

Authenticated. Used by the mock `authApi.submitKyc()` and vendor verification
flow.

Request:

```ts
type SubmitNinRequest = {
  nin: string; // 11 digits
};
```

Response:

```ts
type SubmitNinResponse = {
  verified: boolean;
  name?: string;
  dob?: string;
};
```

### `POST /auth/kyc/bvn`

Authenticated.

Request:

```ts
type SubmitBvnRequest = {
  bvn: string;
};
```

Response:

```ts
type SubmitBvnResponse = {
  verified: boolean;
  banks?: Array<{ bankName: string; accountNumberLast4: string }>;
};
```

### `POST /auth/kyc/id-document`

Authenticated. Needed by the vendor ID-type and scan-ID flow. Upload the image
first with `POST /upload/sign` using `kind: 'kyc'`, then submit the returned
`mediaId` here.

Request:

```ts
type IdDocumentType = 'national' | 'passport' | 'driver' | 'voter';

type SubmitIdDocumentRequest = {
  country: string; // ISO 3166-1 alpha-2, e.g. 'NG'
  type: IdDocumentType;
  frontMediaId: Id;
  backMediaId?: Id;
};
```

Response:

```ts
type SubmitIdDocumentResponse = {
  idDocumentId: Id;
  status: 'pending' | 'verified' | 'rejected';
  extractedName?: string;
  reviewedAt?: ISODateTime;
};
```

### `POST /auth/kyc/selfie`

Authenticated multipart upload. Used by vendor selfie verification.

Request:

```ts
type SubmitSelfieMultipart = {
  selfie: File;
  idDocumentId?: Id;
};
```

Response:

```ts
type SubmitSelfieResponse = {
  matched: boolean;
  verified: boolean;
  reviewedAt?: ISODateTime;
};
```

## Uploads

### `POST /upload/sign`

Authenticated. Required for product, post, story, reel, KYC, and chat media.

Request:

```ts
type SignUploadRequest = {
  kind: 'product' | 'post' | 'story' | 'reel' | 'kyc' | 'chat';
  contentType: string;
  fileName?: string;
  sizeBytes?: number;
};
```

Response:

```ts
type SignUploadResponse = {
  mediaId: Id;
  uploadUrl: string;
  publicUrl: string;
  headers?: Record<string, string>;
  expiresAt: ISODateTime;
};
```

## Marketplace, Vendors, Products, Search

### `GET /marketplace/home`

Authenticated. Used by `useMarketplaceHome()`.

Query:

```ts
type MarketplaceHomeQuery = {
  page?: number;
  limit?: number;
  category?: string;
};
```

Response:

```ts
type MarketplaceHomeResponse = {
  products: RankedProduct[];
  categories: string[];
};
```

### `GET /marketplace/nearby`

Authenticated. Used by `useNearby()`.

Query:

```ts
type MarketplaceNearbyQuery = {
  lat: number;
  lng: number;
  radiusKm: number;
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'relevance' | 'distance';
};
```

Response:

```ts
type MarketplaceNearbyResponse = {
  vendors: Array<{ id: Id; storeName: string; distanceKm: number | null }>;
  products: RankedProduct[];
  query: {
    lat: number;
    lng: number;
    radiusKm: number;
    sortBy: string;
    matched: number;
  };
};
```

### `GET /marketplace/top-rated`

Authenticated.

Query:

```ts
type TopRatedQuery = {
  category?: string;
};
```

Response:

```ts
type TopRatedResponse = Array<{
  id: Id;
  storeName: string;
  rating: number;
  ratingCount: number;
}>;
```

### `GET /products/:id`

Authenticated.

Response:

```ts
type ProductDetail = RankedProduct & {
  vendor: VendorSummary;
  images?: string[];
  variants?: {
    colors?: Array<{ key: string; hex: string; label: string }>;
    sizes?: string[];
  };
  reviews?: Review[];
  rating?: number;
  ratingCount?: number;
};
```

### `POST /products`

Authenticated vendor only. Needed by `app/(vendor-dashboard)/products/add.tsx`
and vendor store setup.

Request:

```ts
type CreateProductRequest = {
  title: string;
  description?: string;
  price: Kobo;
  category: string;
  stock?: number;
  mediaIds: Id[];
  variants?: {
    colors?: Array<{ key: string; hex?: string; label: string }>;
    sizes?: string[];
  };
  active?: boolean;
};
```

Response:

```ts
type CreateProductResponse = ProductDetail;
```

### `PATCH /products/:id`

Authenticated vendor owner only.

Request:

```ts
type UpdateProductRequest = Partial<CreateProductRequest>;
```

Response:

```ts
type UpdateProductResponse = ProductDetail;
```

### `DELETE /products/:id`

Authenticated vendor owner only. Soft-delete/deactivate is preferred.

Response:

```ts
type DeleteProductResponse = {
  success: boolean;
};
```

### `POST /vendors/store-setup`

Authenticated vendor only. Needed by the vendor onboarding screens.

Request:

```ts
type StoreSetupRequest = {
  offerType: 'physical' | 'digital' | 'services';
  category: string;
  storeName: string;
  description?: string;
  address?: string;
  location?: GeoPoint;
  phone?: string;
  logoMediaId?: Id;
  bannerMediaId?: Id;
  hours?: Array<{ day: string; open: string; close: string; closed?: boolean }>;
};
```

Response:

```ts
type StoreSetupResponse = {
  vendor: VendorProfile;
};
```

### `GET /vendors/nearby`

Authenticated. Legacy mock endpoint used by `vendorsApi.nearby()`.

Query:

```ts
type NearbyVendorsQuery = {
  lat: number;
  lng: number;
  radiusKm?: number;
  filter?: string;
};
```

Response:

```ts
type NearbyVendorsResponse = Array<{
  id: Id;
  name: string;
  category: string;
  distanceKm: number;
  rating: number;
}>;
```

### `GET /vendors/:handle`

Authenticated.

Response:

```ts
type VendorProfile = {
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
  address?: string;
  phone?: string;
  about?: string;
  hours?: Array<{ day: string; hours: string }>;
  photos?: string[];
  followers?: number;
  following?: number;
  posts?: number;
  isFollowing?: boolean;
};
```

### `GET /vendors/:handle/products`

Authenticated.

Response:

```ts
type VendorProductsResponse = RankedProduct[];
```

### `GET /vendors/:handle/reviews`

Authenticated.

Response:

```ts
type Review = {
  id: Id;
  author: string;
  rating: number;
  age?: string;
  text: string;
  createdAt?: ISODateTime;
};

type VendorReviewsResponse = Review[];
```

### `POST /vendors/:handle/follow`

Authenticated.

Request body: none.

Response:

```ts
type FollowVendorResponse = {
  following: boolean;
};
```

### `GET /search`

Authenticated.

Query:

```ts
type SearchQuery = {
  q: string;
  type?: 'people' | 'products' | 'tags' | 'places' | 'top';
  limit?: number;
};
```

Response:

```ts
type SearchResponse = {
  people: Array<{
    id: Id;
    handle: string;
    name: string;
    avatarUrl?: string | null;
    kycVerified?: boolean;
    kind: 'buyer' | 'vendor';
  }>;
  products: RankedProduct[];
  tags: Array<{ tag: string; count: number }>;
  places: VendorSummary[];
};
```

## Wallet and Escrow

```ts
type WalletTx = {
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
```

### `GET /wallet`

Authenticated.

Response:

```ts
type WalletResponse = {
  balance: Kobo;
  inEscrow: Kobo;
  accountNumber: string;
  bankName: string;
  recent: WalletTx[];
};
```

### `POST /wallet/topup`

Authenticated. Starts a Paystack top-up or records a webhook-confirmed top-up,
depending on implementation.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type TopUpRequest = {
  amount: Kobo;
  source?: 'Paystack' | 'Bank transfer' | string;
};
```

Response:

```ts
type TopUpResponse = {
  newBalance: Kobo;
  authorizationUrl?: string;
  reference?: string;
};
```

### `POST /wallet/pay`

Authenticated buyer only. Debits buyer wallet and parks funds in escrow.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type WalletPayRequest = {
  amount: Kobo;
  orderId: Id;
  vendor: string;
};
```

Response:

```ts
type WalletPayResponse = {
  orderId: Id;
  escrowTxId: Id;
};
```

Domain errors:

```ts
type InsufficientBalanceError = {
  message: 'Insufficient balance';
  code: 'INSUFFICIENT_BALANCE';
  details: { required: Kobo; available: Kobo };
};

type DeliveryFeeTooHighError = {
  message: string;
  code: 'DELIVERY_FEE_TOO_HIGH';
  details: { closerVendors: VendorSummary[] };
};
```

### `POST /wallet/release/:orderId`

Authenticated buyer only.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type ReleaseEscrowRequest = {
  amount: Kobo;
  vendor?: string;
};
```

Response:

```ts
type ReleaseEscrowResponse = {
  success: boolean;
  orderId: Id;
  releasedAt: ISODateTime;
};
```

### `POST /wallet/refund/:orderId`

Authenticated buyer, vendor, or reviewer depending on dispute state.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type RefundEscrowRequest = {
  reason: string;
};
```

Response:

```ts
type RefundEscrowResponse = {
  success: boolean;
  orderId: Id;
  refundedAt: ISODateTime;
};
```

### `POST /wallet/withdraw`

Authenticated.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type WithdrawRequest = {
  amount: Kobo;
  bankAccountId: Id;
};
```

Response:

```ts
type WithdrawResponse = {
  withdrawalId: Id;
  eta: string;
  newBalance: Kobo;
};
```

### `GET /wallet/referrals`

Authenticated.

Response:

```ts
type ReferralWalletResponse = {
  totalEarned: Kobo;
  clicks: number;
  conversions: number;
  list: Repost[];
};
```

Server invariants:

- `delivery_kobo <= goods_kobo`, otherwise return `422 DELIVERY_FEE_TOO_HIGH`.
- `wallet_tx` is append-only with a hash chain.
- Buyer can only release their own order escrow.
- Paystack webhooks must be HMAC-SHA512 verified.
- Every wallet mutation is idempotent.

## Orders

```ts
type OrderStatus =
  | 'paid'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'refunded'
  | 'disputed';

type OrderItem = {
  productId?: Id;
  name: string;
  qty: number;
  unit: Kobo;
  imageUrl?: string;
};

type ShippingAddress = {
  recipient?: string;
  street: string;
  city?: string;
  state?: string;
  phone: string;
  geo?: GeoPoint;
};

type Order = {
  id: Id;
  vendor: string;
  vendorHandle: string;
  vendorId?: Id;
  items: OrderItem[];
  status: OrderStatus;
  placedAt: ISODateTime;
  estimatedDelivery?: string;
  shipTo?: string | ShippingAddress;
  shipPhone?: string;
  referrerHandle?: string;
  goodsTotal: Kobo;
  deliveryFee: Kobo;
  platformFee: Kobo;
  referralFee?: Kobo;
  grandTotal: Kobo;
};
```

### `GET /orders`

Authenticated.

Query:

```ts
type OrdersQuery = {
  status?: OrderStatus;
  role?: 'buyer' | 'vendor';
  page?: number;
  limit?: number;
};
```

Response:

```ts
type OrdersResponse = Order[];
```

### `POST /orders`

Authenticated buyer only.

Headers:

```text
Idempotency-Key: <unique key>
```

Request:

```ts
type CreateOrderRequest = {
  vendorId: Id;
  items: Array<{ productId: Id; qty: number; unit?: Kobo }>;
  shipTo: ShippingAddress;
  promoCode?: string;
  referrerHandle?: string;
};
```

Response:

```ts
type CreateOrderResponse = Order;
```

### `GET /orders/:id`

Authenticated buyer/vendor participant.

Response:

```ts
type OrderDetailResponse = Order & {
  timeline: Array<{
    status: OrderStatus;
    label: string;
    at?: ISODateTime;
  }>;
};
```

### `PATCH /orders/:id/status`

Authenticated vendor or system role. Used by the mock `ordersApi.setStatus()`.

Request:

```ts
type SetOrderStatusRequest = {
  status: OrderStatus;
};
```

Response:

```ts
type SetOrderStatusResponse = Order;
```

### `POST /orders/:id/confirm`

Authenticated buyer only. Confirms delivery and releases escrow.

Request body: none.

Response:

```ts
type ConfirmOrderResponse = Order & {
  releasedAt: ISODateTime;
};
```

### `POST /orders/:id/dispute`

Authenticated buyer or vendor participant.

Request:

```ts
type CreateDisputeRequest = {
  reason: string;
  photos?: Id[];
};
```

Response:

```ts
type CreateDisputeResponse = {
  disputeId: Id;
};
```

### `POST /orders/:id/review`

Authenticated buyer only after delivery/release.

Request:

```ts
type CreateReviewRequest = {
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  photos?: Id[];
};
```

Response:

```ts
type CreateReviewResponse = Review;
```

### `GET /orders/:id/track`

Authenticated buyer/vendor participant.

Response:

```ts
type TrackOrderResponse = {
  orderId: Id;
  status: OrderStatus;
  eta?: string;
  currentLocation?: GeoPoint;
  timeline: Array<{ label: string; at?: ISODateTime; done: boolean }>;
};
```

## Reposts and Referrals

```ts
type Repost = {
  id: Id;
  productId: Id;
  vendorId: Id;
  caption?: string;
  visibility: 'public' | 'mutuals' | 'close-friends';
  ts: ISODateTime;
  earningsNgn?: number; // legacy display field
  earnings: Kobo;
  clicks: number;
  conversions: number;
  shareUrl: string;
};
```

### `GET /reposts/me`

Authenticated.

Response:

```ts
type MyRepostsResponse = Repost[];
```

### `POST /reposts`

Authenticated. Toggles or creates a repost. Reject self-reposts.

Request:

```ts
type CreateRepostRequest = {
  productId: Id;
  vendorId: Id;
  caption?: string;
  visibility?: 'public' | 'mutuals' | 'close-friends';
};
```

Response:

```ts
type CreateRepostResponse = Repost;
```

### `DELETE /reposts/:id`

Authenticated owner only.

Response:

```ts
type DeleteRepostResponse = {
  success: boolean;
};
```

### `GET /reposts/:id/click`

Public. Records click attribution then redirects to the product deep link.

Response: `302` redirect to `vibe://product/:productId?via=<handle>` or the
equivalent universal link.

### `POST /feed/reels/:reelId/repost`

Authenticated. Used by `feedBackend.repost()`.

Request:

```ts
type RepostReelRequest = {
  caption?: string;
};
```

Response:

```ts
type RepostReelResponse = {
  id: Id;
  shareUrl: string;
  attribution: {
    expectedReferralFeeKobo: Kobo;
    tier: number;
  };
};
```

Attribution rule: when checkout includes `via=<handle>` and the order releases,
credit the reposter referral fee during escrow release, not during payment.

## Feed, Posts, Stories, Reels, Comments

```ts
type FeedAuthor = {
  id: Id;
  handle: string;
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
};

type Post = {
  id: Id;
  author: FeedAuthor;
  caption: string;
  imageUrls: string[];
  product?: { id: Id; name: string; price: Kobo };
  createdAt: ISODateTime;
  likes: number;
  comments: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
};

type Story = {
  id: Id;
  author: FeedAuthor;
  imageUrl: string;
  caption?: string;
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
};

type Reel = {
  id: Id;
  author: FeedAuthor;
  videoUrl: string;
  coverUrl?: string;
  caption: string;
  audio?: string;
  createdAt: ISODateTime;
  views: number;
};

type Comment = {
  id: Id;
  author: FeedAuthor;
  body: string;
  parentId?: Id | null;
  likes: number;
  createdAt: ISODateTime;
};
```

### `GET /feed`

Authenticated.

Query:

```ts
type FeedQuery = {
  cursor?: string;
  limit?: number;
};
```

Response:

```ts
type FeedResponse = {
  items: Post[];
  nextCursor?: string | null;
};
```

### `GET /feed/reels`

Authenticated. Used by `feedBackend.reels()`.

Query:

```ts
type FeedReelsQuery = {
  page?: number;
  limit?: number;
};
```

Response:

```ts
type FeedReelsResponse = Reel[];
```

### `POST /posts`

Authenticated.

Request:

```ts
type CreatePostRequest = {
  caption: string;
  mediaIds: Id[];
  productId?: Id;
};
```

Response:

```ts
type CreatePostResponse = Post;
```

### `GET /posts/:id/comments`

Authenticated.

Query:

```ts
type CommentsQuery = {
  cursor?: string;
  limit?: number;
};
```

Response:

```ts
type CommentsResponse = {
  comments: Comment[];
  nextCursor?: string | null;
};
```

### `POST /posts/:id/comments`

Authenticated.

Request:

```ts
type CreateCommentRequest = {
  body: string;
  parentId?: Id;
};
```

Response:

```ts
type CreateCommentResponse = Comment;
```

### `POST /stories`

Authenticated.

Request:

```ts
type CreateStoryRequest = {
  mediaId: Id;
  caption?: string;
};
```

Response:

```ts
type CreateStoryResponse = Story;
```

### `GET /stories/inbox`

Authenticated.

Response:

```ts
type StoriesInboxResponse = Story[];
```

### `POST /reels`

Authenticated.

Request:

```ts
type CreateReelRequest = {
  videoMediaId: Id;
  coverMediaId?: Id;
  caption: string;
  audio?: string;
};
```

Response:

```ts
type CreateReelResponse = Reel;
```

## Chat

Used by `src/hooks/use-chat.ts` and `src/hooks/use-chat-socket.ts`.

```ts
type ChatConversation = {
  id: Id;
  participants: Array<{
    userId: Id;
    role: 'buyer' | 'vendor';
    lastReadAt?: ISODateTime;
  }>;
  productId?: Id;
  orderId?: Id;
  lastMessagePreview?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

type ChatMessage = {
  id: Id;
  conversationId: Id;
  senderId: Id;
  kind: 'text' | 'image' | 'product_card' | 'system';
  body?: string;
  mediaId?: Id;
  imageUrl?: string;
  productId?: Id;
  createdAt: ISODateTime;
};
```

### `POST /chat/conversations`

Authenticated.

Request:

```ts
type StartConversationRequest = {
  participantUserId: Id;
  productId?: Id;
  orderId?: Id;
};
```

Response:

```ts
type StartConversationResponse = ChatConversation;
```

### `GET /chat/conversations`

Authenticated.

Query:

```ts
type ListConversationsQuery = {
  page?: number;
  limit?: number;
};
```

Response:

```ts
type ListConversationsResponse = ChatConversation[];
```

### `GET /chat/conversations/:id`

Authenticated participant only.

Response:

```ts
type GetConversationResponse = ChatConversation;
```

### `GET /chat/conversations/:id/messages`

Authenticated participant only.

Query:

```ts
type ListMessagesQuery = {
  page?: number;
  limit?: number;
  cursor?: string;
};
```

Response:

```ts
type ListMessagesResponse = ChatMessage[];
```

### `POST /chat/conversations/:id/messages`

Authenticated participant only.

Request:

```ts
type SendMessageRequest =
  | { kind: 'text'; body: string }
  | { kind: 'image'; imageUrl: string; mediaId?: Id }
  | { kind: 'product_card'; productId: Id };
```

Response:

```ts
type SendMessageResponse = ChatMessage;
```

### `POST /chat/conversations/:id/read`

Authenticated participant only.

Request body: none.

Response:

```ts
type MarkConversationReadResponse = ChatConversation;
```

### Socket.IO `/ws/chat`

Client connects to `${API_BASE_URL}/ws/chat` with:

```ts
type SocketAuth = {
  token: string;
};
```

Client emits:

```ts
type ChatJoinEvent = ['chat:join', { conversationId: Id }];
type ChatLeaveEvent = ['chat:leave', { conversationId: Id }];
```

Server emits:

```ts
type ChatMessageEvent = ['chat:message', ChatMessage];
type ChatUpdatedEvent = ['chat:updated', ChatConversation];
```

Polling through `GET /chat/conversations/:id/messages` remains the fallback.

## Notifications and Push Devices

```ts
type NotificationItem = {
  id: Id;
  userId: Id;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: ISODateTime | null;
  createdAt: ISODateTime;
};
```

### `GET /notifications`

Authenticated. Used by `useNotifications()`.

Query:

```ts
type NotificationsQuery = {
  unread?: 'true';
  cursor?: string;
  limit?: number;
};
```

Response:

```ts
type NotificationsResponse = NotificationItem[];
```

### `PATCH /notifications/:id/read`

Authenticated owner only.

Request body: none.

Response:

```ts
type MarkNotificationReadResponse = {
  read: boolean;
};
```

### `PATCH /notifications/read-all`

Authenticated.

Request body: none.

Response:

```ts
type MarkAllNotificationsReadResponse = {
  success: boolean;
  count: number;
};
```

### `POST /notifications/device-token`

Authenticated.

Request:

```ts
type RegisterDeviceTokenRequest = {
  token: string;
  platform: 'ios' | 'android' | 'web';
};
```

Response:

```ts
type RegisterDeviceTokenResponse = {
  success: boolean;
};
```

## Account, Addresses, Payment Methods, Privacy

```ts
type Address = {
  id: Id;
  label: string;
  recipient: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  isDefault?: boolean;
};

type PaymentMethod = {
  id: Id;
  type: 'card' | 'transfer' | 'wallet';
  brand?: 'visa' | 'mastercard' | 'verve';
  last4?: string;
  label: string;
  isDefault?: boolean;
};
```

### `GET /me`

Authenticated.

Response:

```ts
type MeResponse = AuthUser & {
  handle: string;
  name: string;
  phone?: string;
  isPrivate: boolean;
  hasStore: boolean;
};
```

### `PATCH /me`

Authenticated.

Request:

```ts
type UpdateMeRequest = {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarMediaId?: Id;
  isPrivate?: boolean;
  notificationPrefs?: Record<string, boolean>;
  privacyPrefs?: Record<string, boolean>;
};
```

Response:

```ts
type UpdateMeResponse = MeResponse;
```

### Address Endpoints

```ts
type ListAddressesResponse = Address[];
type CreateAddressRequest = Omit<Address, 'id'>;
type CreateAddressResponse = Address;
type UpdateAddressRequest = Partial<Omit<Address, 'id'>>;
type UpdateAddressResponse = Address;
type DeleteAddressResponse = { success: boolean };
```

- `GET /me/addresses`
- `POST /me/addresses`
- `PATCH /me/addresses/:id`
- `DELETE /me/addresses/:id`

### Payment Method Endpoints

Backend should not accept raw card numbers from the app. Use Paystack setup
flows and only return tokenized methods.

```ts
type ListPaymentMethodsResponse = PaymentMethod[];

type CreatePaymentMethodRequest = {
  type: 'card' | 'transfer' | 'wallet';
  paystackAuthorizationCode?: string;
  label?: string;
  isDefault?: boolean;
};

type CreatePaymentMethodResponse = PaymentMethod;
type DeletePaymentMethodResponse = { success: boolean };
```

- `GET /me/payment-methods`
- `POST /me/payment-methods`
- `DELETE /me/payment-methods/:id`

### Privacy

- `GET /me/data-export` returns a ZIP or a signed URL to the ZIP within NDPR/GDPR
  timelines.
- `DELETE /me` starts account deletion with a 14-day grace period.

## Hive Communities

```ts
type LiveMatch = {
  title: string;
  meta: string;
  status: 'live' | 'finished' | 'upcoming';
  periodLabel?: string;
  home: { name: string; flag: string; scores: number[] };
  away: { name: string; flag: string; scores: number[] };
};

type HiveNode = {
  slug: string;
  name: string;
  emoji?: string;
  description?: string;
  members?: number;
  pinnedTopic?: string;
  bot?: string;
  liveMatch?: LiveMatch;
  children?: HiveNode[];
};

type HiveMessage = {
  id: Id;
  community: string;
  author: string;
  initial: string;
  text: string;
  time: string;
  createdAt?: ISODateTime;
  mine?: boolean;
  bot?: boolean;
};
```

### `GET /hive/tree`

Authenticated.

Response:

```ts
type HiveTreeResponse = HiveNode[];
```

### `GET /hive/:slugPath`

Authenticated. `slugPath` can contain `/`, for example
`books/romance/christian`.

Response:

```ts
type HiveDetailResponse = {
  node: HiveNode;
  topic?: string;
  messages: HiveMessage[];
  joined: boolean;
};
```

### `POST /hive/:slugPath/join`

Authenticated.

Response:

```ts
type JoinHiveResponse = {
  success: boolean;
};
```

### `GET /hive/:slugPath/messages`

Authenticated member.

Query:

```ts
type HiveMessagesQuery = {
  cursor?: string;
  limit?: number;
};
```

Response:

```ts
type HiveMessagesResponse = {
  messages: HiveMessage[];
  nextCursor?: string | null;
};
```

### `POST /hive/:slugPath/messages`

Authenticated member.

Request:

```ts
type CreateHiveMessageRequest = {
  text: string;
};
```

Response:

```ts
type CreateHiveMessageResponse = HiveMessage;
```

### `POST /hive/:slugPath/polls/:id/vote`

Authenticated member.

Request:

```ts
type VotePollRequest = {
  optionKey: string;
};
```

Response:

```ts
type PollResult = {
  pollId: Id;
  options: Array<{ key: string; label: string; votes: number; mine: boolean }>;
  totalVotes: number;
};
```

### Realtime `/ws/hive/:slugPath`

Server emits new messages, poll updates, pinned-topic changes, and bot messages.

AI bots are background workers, not public user endpoints. Persona prompts live
in `bots/*.md`.

## News and Vendor Insights

```ts
type Article = {
  id: Id;
  title: string;
  category: string;
  coverUrl?: string;
  author: { name: string; role?: string; avatarUrl?: string; initial?: string };
  publishedAt: ISODateTime;
  readMin: number;
  claps: number;
  comments: number;
  excerpt: string;
  paragraphs?: string[];
  tags?: string[];
  savedByMe?: boolean;
  clappedByMe?: boolean;
};
```

### `GET /news/feed`

Authenticated.

Query:

```ts
type NewsFeedQuery = {
  personalised?: boolean;
  category?: 'For you' | 'Trending' | 'Music' | 'Sport' | 'Business' | string;
  cursor?: string;
  limit?: number;
};
```

Response:

```ts
type NewsFeedResponse = {
  articles: Article[];
  trendingTags: string[];
  nextCursor?: string | null;
};
```

### `GET /news/:id`

Authenticated.

Response:

```ts
type NewsArticleResponse = Article & {
  related: Article[];
};
```

### `GET /news/insights/vendor/:id`

Authenticated vendor owner or admin.

Response:

```ts
type VendorInsight = {
  vendorId: Id;
  highlights: Array<{ title: string; body: string; severity?: 'info' | 'warning' | 'success' }>;
  productSignals: Array<{ productId: Id; label: string; score: number }>;
  generatedAt: ISODateTime;
};
```

## Services and Live Booking

### `POST /services/:productId/book`

Authenticated buyer only.

Request:

```ts
type BookServiceRequest = {
  when: ISODateTime;
  location: GeoPoint & {
    address?: string;
  };
};
```

Response:

```ts
type BookServiceResponse = {
  bookingId: Id;
};
```

### `GET /bookings/:id/track`

Authenticated buyer/vendor participant.

Response:

```ts
type BookingTrackResponse = {
  status: 'requested' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  coords?: GeoPoint;
  eta?: string;
};
```

### Realtime `/ws/bookings/:id/track`

Server emits partner location every ~5 seconds while en route:

```ts
type BookingLocationEvent = {
  bookingId: Id;
  status: BookingTrackResponse['status'];
  coords?: GeoPoint;
  eta?: string;
};
```

When the two devices are within 80m, both get a push notification:

```ts
type RendezvousPush = {
  kind: 'rendezvous';
  bookingId: Id;
};
```

## Rate Limits

- Auth and OTP endpoints: 5 attempts / 15 minutes / IP and destination.
- Payment and wallet endpoints: 30 requests / minute / user.
- Search: 60 requests / minute / user.
- Chat and Hive realtime: 10 messages / 10 seconds / user / room.

## Backend Security Requirements

- Store access tokens short-lived and rotate refresh tokens.
- Redact passwords, OTPs, NIN, BVN, card data, and raw Paystack payload secrets
  from logs.
- Encrypt KYC values at rest.
- Enforce row ownership for every user-scoped resource.
- Verify Paystack and KYC provider webhook signatures before processing.
- Never expose raw card details to the frontend.
- Keep buyer profiles private by default.
- Vendors should receive only delivery-required buyer fields: name, phone,
  shipping address, and KYC pass/fail status.
