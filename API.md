# Vibe — backend API contract

Frontend talks to the API via `src/api/*`. Today every call resolves locally
from a Zustand store; swap each function for `fetch()` against the real
backend when ready. Below is the endpoint surface the frontend already expects.

Base URL: `https://api.vibe.app/v1`

All responses follow `{ ok: true, data } | { ok: false, error }`.
All write endpoints require `Authorization: Bearer <jwt>` unless noted public.

## Auth

| Method | Path                  | Body                               | Returns                       |
|--------|-----------------------|------------------------------------|-------------------------------|
| POST   | `/auth/signup`        | `{ email, password, role }`        | `{ token, refresh, user }`    |
| POST   | `/auth/login`         | `{ email, password, role }`        | `{ token, refresh, user }`    |
| POST   | `/auth/refresh`       | `{ refresh }`                      | `{ token, refresh }`          |
| POST   | `/auth/logout`        | —                                  | `null`                        |
| POST   | `/auth/kyc/nin`       | `{ nin }`                          | `{ verified, name, dob }`     |
| POST   | `/auth/kyc/bvn`       | `{ bvn }`                          | `{ verified, banks }`         |
| POST   | `/auth/kyc/selfie`    | multipart photo                    | `{ matched: boolean }`        |

## Wallet & escrow

| Method | Path                          | Body                                  | Returns                          |
|--------|-------------------------------|---------------------------------------|----------------------------------|
| GET    | `/wallet`                     | —                                     | `{ balance, inEscrow, account, recent[] }` |
| POST   | `/wallet/topup`               | `{ amount, source }`                  | `{ newBalance }`                 |
| POST   | `/wallet/pay`                 | `{ amount, orderId, vendor }`         | `{ orderId, escrowTxId }`        |
| POST   | `/wallet/release/:orderId`    | `{ amount }`                          | `null`                           |
| POST   | `/wallet/refund/:orderId`     | `{ reason }`                          | `null`                           |
| POST   | `/wallet/withdraw`            | `{ amount, bankAccountId }`           | `{ withdrawalId, eta }`          |
| GET    | `/wallet/referrals`           | —                                     | `{ totalEarned, clicks, list[] }`|

Money invariants enforced server-side:
1. `delivery_fee <= goods_value`. If not, return 422 + closer-vendor list.
2. `wallet_transactions` is append-only with a hash chain.
3. Buyer can only call `release` on their own orders.
4. Paystack webhook signatures HMAC-verified.

## Orders

| Method | Path                       | Body / Query                          | Returns                         |
|--------|----------------------------|---------------------------------------|---------------------------------|
| GET    | `/orders?status=`          | —                                     | `Order[]`                       |
| POST   | `/orders`                  | `{ vendorId, items, shipTo }`         | `Order`                         |
| GET    | `/orders/:id`              | —                                     | `Order + timeline`              |
| PATCH  | `/orders/:id/status`       | `{ status }`                          | `Order`                         |
| POST   | `/orders/:id/confirm`      | —                                     | triggers escrow release         |
| POST   | `/orders/:id/dispute`      | `{ reason, photos? }`                 | `{ disputeId }`                 |

## Reposts (referrals)

| Method | Path                       | Body                                  | Returns           |
|--------|----------------------------|---------------------------------------|-------------------|
| GET    | `/reposts/me`              | —                                     | `Repost[]`        |
| POST   | `/reposts`                 | `{ productId, vendorId, caption?, visibility }` | `Repost` |
| DELETE | `/reposts/:id`             | —                                     | `null`            |
| GET    | `/reposts/:id/click`       | (public, redirects to product page with `?via=`) | redirect |

Server attribution rule: when a buyer's checkout reaches `/wallet/pay` and the
buyer has a cookie / query param `via=<handle>`, the ₦50 referral fee routes
to that handle's wallet on `release` (not on pay).

## Market & vendors

| Method | Path                                  | Query                            | Returns                    |
|--------|---------------------------------------|----------------------------------|----------------------------|
| GET    | `/vendors/nearby`                     | `lat`, `lng`, `radiusKm`, `filter` | `Vendor[]`               |
| GET    | `/vendors/:handle`                    | —                                | `Vendor`                   |
| GET    | `/vendors/:handle/products`           | —                                | `Product[]`                |
| GET    | `/vendors/:handle/reviews`            | —                                | `Review[]`                 |
| POST   | `/vendors/:handle/follow`             | —                                | `{ following }`            |
| GET    | `/products/:id`                       | —                                | `Product + reviews`        |
| POST   | `/products`                           | `{ name, price, category, image }` | `Product` (vendor only)  |
| GET    | `/search?q=`                          | `q`                              | `{ people[], products[], tags[], places[] }` |

## Hive (communities)

| Method | Path                                  | Body                              | Returns                    |
|--------|---------------------------------------|-----------------------------------|----------------------------|
| GET    | `/hive/tree`                          | —                                 | `HiveNode[]`               |
| GET    | `/hive/:slugPath`                     | —                                 | `HiveNode + topic + msgs[]`|
| POST   | `/hive/:slugPath/join`                | —                                 | `null`                     |
| GET    | `/hive/:slugPath/messages?cursor=`    | —                                 | `Message[]`                |
| POST   | `/hive/:slugPath/messages`            | `{ text }`                        | `Message`                  |
| WS     | `/hive/:slugPath`                     | (realtime)                        | new messages / polls / bot |
| POST   | `/hive/:slugPath/polls/:id/vote`      | `{ optionKey }`                   | `PollResult`               |

## AI bots (server-to-server)

Bots are background workers, not user-facing endpoints. Each subscribes to a
community's message stream. Persona prompts live in `bots/*.md`.

Triggers:
- New member join → `greet_new_members` (debounced 60s)
- Activity dry for >30 min → `revive_dry_chat`
- 3+ distinct members converging → `propose_pin_topic`
- External event (match underway, album drop) → `pin_live_event`

## News

| Method | Path                          | Returns                |
|--------|-------------------------------|------------------------|
| GET    | `/news/feed?personalised=`    | `Article[]`            |
| GET    | `/news/:id`                   | `Article (long-form)`  |
| GET    | `/news/insights/vendor/:id`   | `VendorInsight` (premium) |

## Service booking (Bolt-style)

| Method | Path                                | Body                       | Returns                          |
|--------|-------------------------------------|----------------------------|----------------------------------|
| POST   | `/services/:productId/book`         | `{ when, location }`       | `{ bookingId }`                  |
| GET    | `/bookings/:id/track`               | —                          | `{ status, coords, eta }`        |
| WS     | `/bookings/:id/track`               | (realtime location stream) | partner location every ~5s       |

When the two devices are within 80m, both get a push:
`{ kind: 'rendezvous', bookingId }`.

## Stories / reels / posts

| Method | Path                       | Body                          | Returns      |
|--------|----------------------------|-------------------------------|--------------|
| POST   | `/posts`                   | `{ caption, image, product? }`| `Post`       |
| POST   | `/stories`                 | `{ image, caption? }`         | `Story` (24h)|
| POST   | `/reels`                   | `{ video, caption, audio? }`  | `Reel`       |
| GET    | `/feed?cursor=`            | —                             | `Post[]`     |
| GET    | `/stories/inbox`           | —                             | `Story[]`    |

## Notifications

| Method | Path                       | Body              | Returns                          |
|--------|----------------------------|-------------------|----------------------------------|
| GET    | `/notifications?cursor=`   | —                 | `Notif[]`                        |
| POST   | `/notifications/read-all`  | —                 | `null`                           |
| POST   | `/devices/push-token`      | `{ token }`       | `null` (Expo Push)               |

## Privacy (purpose limitation + data minimization)

- Buyer profile content (posts/reels/tagged) is private by default.
- Vendor receives only what's needed for delivery: name, phone, KYC pass status.
- `/me/data-export` (GDPR/NDPR) returns ZIP of personal data within 30 days.
- `/me/delete` triggers a soft-delete with a 14-day grace period.

## Rate limits

- Auth endpoints: 5 attempts / 15 min / IP
- Payment endpoints: 30 / min / user
- Search: 60 / min / user
- Realtime: 10 messages / 10s / user / community
