# Vibe backend — handoff package

This folder is the contract between the frontend (Expo / React Native) and the
backend you (or the next engineer) are about to build. Frontend code expects
the API described in `../API.md` and the Postgres schema described in
`./schema.sql`.

## Recommended stack

| Layer       | Pick                | Why                                                              |
|-------------|---------------------|------------------------------------------------------------------|
| Database    | Postgres 16         | PostGIS for proximity, pgvector for semantic search              |
| API runtime | Supabase Edge fns OR NestJS | Supabase = fastest to ship. NestJS = more control later. |
| Realtime    | Supabase Realtime   | Free with Supabase. Or Socket.IO if NestJS.                      |
| Object store| Cloudflare R2       | Cheap, no egress. S3-compatible.                                 |
| CDN         | Cloudflare          | In front of R2; image transforms.                                |
| Payments    | Paystack            | Nigerian-first. Virtual accounts for the eWallet.                |
| KYC         | Verifyme NG         | NIN + BVN verification, ID OCR, selfie matching.                 |
| AI          | Anthropic Claude    | Bot personas in `bots/*.md`. Cohere/Voyage for embeddings.        |
| Maps        | Google Maps Platform | Places + Geocoding. Mapbox cheaper if traffic gets heavy.       |
| Search      | Meilisearch         | Self-hosted, fast. Or pg_search if you want one fewer service.   |
| Push        | Expo Push           | Free, wraps FCM/APNs.                                            |
| Jobs        | BullMQ + Redis      | Cron + retries for NewsBot run, trend recompute, escrow sweeps.  |
| Errors      | Sentry              | Mobile + backend.                                                |
| Analytics   | PostHog             | Self-host option, GDPR-friendly.                                 |

## First-week setup (Supabase path)

1. Create a Supabase project. Region: London or Frankfurt for Nigeria latency.
2. Enable extensions in Dashboard → Database → Extensions: `postgis`,
   `pgvector`, `pgcrypto`, `citext`.
3. Run `schema.sql` in the SQL editor.
4. Create a `service_role` policy for the API server. Buyers/vendors never
   write directly to `wallet_tx` — only the server (with service role) does.
5. Create a Paystack sandbox account. Wire two webhooks:
   - `charge.success` → credit `wallet_tx` (kind=topup) and update wallet
   - `transfer.success` → mark withdrawals complete
6. Create a Verifyme NG sandbox account. Map their NIN endpoint to
   `POST /v1/auth/kyc/nin`.
7. Generate Cloudflare R2 bucket + API token. Wire upload signed URLs at
   `POST /v1/upload/sign`.
8. Wire Anthropic Claude. Each bot persona file in `bots/*.md` becomes a
   system prompt. The bot runner is a background worker that:
   - Subscribes to `community_messages` realtime stream
   - Maintains rolling context per community
   - Calls Claude every N messages or on a dry-chat timer
   - Writes back a row with `bot_id` set and `author_id = NULL`

## Money flow invariants (enforce server-side)

1. **Append-only ledger.** `wallet_tx` is never updated or deleted. Each row
   contains `prev_hash` and `hash` so the chain can be verified.
2. **Idempotency.** Every wallet-mutating endpoint requires an
   `Idempotency-Key` header; duplicate keys are no-ops.
3. **Double-entry.** Every debit has a matching credit in the same tx.
4. **Delivery fee ≤ goods value.** If a buyer's checkout would violate this,
   return 422 with a list of closer vendors.
5. **Escrow release.** Only the buyer (or the reviewer in a dispute) can
   transition `orders.status` → `released`. On release, fan out:
   - Vendor wallet: credit `goods_kobo`
   - Reposter wallet: credit `referral_kobo` (₦50)
   - Platform: credit `delivery_kobo` (platform fee minus carrier)
6. **Webhook verification.** Paystack signs webhooks with HMAC-SHA512.
   Verify or drop.
7. **Reconciliation.** Nightly job compares Paystack settlement totals to the
   sum of internal `wallet_tx` for that day. Mismatches page the team.

## Security checklist (review before launch)

- [ ] Tokens stored in `expo-secure-store` on mobile, NOT `AsyncStorage`
- [ ] 15-min access tokens + 30-day rotating refresh tokens
- [ ] 5 attempts / 15 min / IP rate limit on auth endpoints
- [ ] CAPTCHA on signup
- [ ] PII redacted from logs (NIN, BVN, full card, password, OTP)
- [ ] KYC fields encrypted at rest (`pgcrypto` per-row keys)
- [ ] Postgres RLS active on every table that holds user data
- [ ] CORS locked to app's origin + the universal-link domain
- [ ] Webhook HMAC verification on Paystack + Verifyme
- [ ] Idempotency keys required on wallet mutations
- [ ] Hard cap `delivery_kobo ≤ goods_kobo` enforced both in API and SQL CHECK
- [ ] In-app account deletion flow (Apple + Google require this)
- [ ] Data export endpoint (NDPR + GDPR)
- [ ] Sentry breadcrumbs scrubbed for PII
- [ ] Pen-test by an outside firm before opening public signups

## Mock → real migration

The frontend talks to the backend through `src/api/*` in the mobile repo.
Today every function returns synchronously from a Zustand store. The migration
is **one file per resource**:

1. Replace `walletApi.pay` body with `fetch(BASE + '/v1/wallet/pay', …)`.
2. Replace `ordersApi.list` body with `fetch(BASE + '/v1/orders', …)`.
3. … and so on.

The store layer (`src/store/*`) can stay — it becomes the local cache. Or
swap to React Query for proper caching + retries; the project already has
`@tanstack/react-query` in dependencies.

## Phasing the v1 launch

**Month 1 — Foundation**
- Supabase project + schema applied
- Auth: email + password + role select
- KYC: NIN-only (defer BVN)
- Wallet: balance display + manual top-up via Paystack
- Push notification token registration

**Month 2 — Money flow**
- Paystack virtual accounts on signup
- Full escrow lifecycle (pay → ship → confirm → release)
- Vendor "withdraw to bank" flow
- Idempotency + reconciliation job

**Month 3 — Market**
- Vendor onboarding (store + first product)
- Product upload to R2
- Place detail pulls real `vendors` + `products`
- Search (Meilisearch indexed nightly)
- Order tracking with real status updates

**Month 4 — Polish + soft launch**
- 100 vendors / 1k buyers waitlist beta
- Manual KYC review for the first batch
- Pen-test
- Public signups in Lagos

**v1.1 — Hive + bots**
**v1.2 — Service booking + live tracking**
**v1.3 — Reposts attribution with real splits**
