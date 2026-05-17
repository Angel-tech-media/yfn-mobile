-- Vibe — Postgres schema sketch
-- Targets Postgres 16 + PostGIS + pgvector. Compatible with Supabase.
-- Run extensions first (Supabase: enable in Dashboard → Database → Extensions)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ──────────────────────────────────────────────────────────────────────────
-- USERS, KYC
-- ──────────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('buyer', 'vendor');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle        CITEXT UNIQUE NOT NULL,
  email         CITEXT UNIQUE NOT NULL,
  phone         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'buyer',
  is_private    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- KYC payload encrypted at rest (server-side; per-row key via pgcrypto)
CREATE TABLE kyc (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nin_encrypted  BYTEA,
  bvn_encrypted  BYTEA,
  id_photo_url   TEXT,
  selfie_url     TEXT,
  nin_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  bvn_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  selfie_matched BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at    TIMESTAMPTZ,
  reviewer_id    UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX ON follows (followee_id);

-- ──────────────────────────────────────────────────────────────────────────
-- VENDORS, PRODUCTS, PLACES
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE vendors (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  store_name  TEXT NOT NULL,
  category    TEXT,
  description TEXT,
  address     TEXT,
  geo         geography(POINT, 4326),  -- PostGIS for proximity queries
  phone       TEXT,
  hours_json  JSONB,                   -- { mon: '9-7', tue: '9-7', ... }
  rating      NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  rank_score  NUMERIC NOT NULL DEFAULT 0,
  open_now    BOOLEAN GENERATED ALWAYS AS (FALSE) STORED, -- computed by job
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX vendors_geo_gix ON vendors USING GIST (geo);
CREATE INDEX vendors_rank_idx ON vendors (rank_score DESC);

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID NOT NULL REFERENCES vendors(user_id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price_kobo  BIGINT NOT NULL CHECK (price_kobo > 0),
  category    TEXT,
  image_urls  TEXT[],
  embedding   vector(1536),  -- pgvector for semantic search
  stock       INTEGER,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_vendor_idx ON products (vendor_id);
CREATE INDEX products_active_idx ON products (active) WHERE active;
CREATE INDEX products_embedding_idx ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ──────────────────────────────────────────────────────────────────────────
-- WALLET & ESCROW (append-only ledger with hash chain)
-- ──────────────────────────────────────────────────────────────────────────

CREATE TYPE wallet_tx_kind AS ENUM (
  'topup',         -- bank → wallet (Paystack)
  'escrow_in',     -- wallet → escrow (buyer paid)
  'release',       -- escrow → vendor wallet (buyer confirmed)
  'refund',        -- escrow → buyer wallet (rejection)
  'referral',      -- escrow → reposter wallet (split on release)
  'withdrawal',    -- wallet → bank (vendor or buyer)
  'fee',           -- platform fee
  'adjustment'     -- manual reconciliation
);

CREATE TABLE wallets (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_kobo   BIGINT NOT NULL DEFAULT 0 CHECK (balance_kobo >= 0),
  escrow_kobo    BIGINT NOT NULL DEFAULT 0 CHECK (escrow_kobo >= 0),
  account_number TEXT UNIQUE, -- Paystack virtual account
  bank_name      TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_tx (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  kind            wallet_tx_kind NOT NULL,
  amount_kobo     BIGINT NOT NULL CHECK (amount_kobo > 0),
  /* +1 = credit to user, -1 = debit from user */
  sign            SMALLINT NOT NULL CHECK (sign IN (-1, 1)),
  balance_after   BIGINT NOT NULL,
  /* Optional links */
  order_id        UUID,
  vendor_id       UUID,
  reposter_id     UUID,
  paystack_ref    TEXT,
  notes           TEXT,
  /* Hash chain: hash(this) = sha256(prev_hash || row_data) */
  prev_hash       BYTEA,
  hash            BYTEA NOT NULL,
  /* Idempotency to prevent double-charge */
  idempotency_key TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wallet_tx_user_idx ON wallet_tx (user_id, created_at DESC);
CREATE INDEX wallet_tx_order_idx ON wallet_tx (order_id) WHERE order_id IS NOT NULL;
-- No UPDATE/DELETE — append-only
REVOKE UPDATE, DELETE ON wallet_tx FROM PUBLIC;

-- ──────────────────────────────────────────────────────────────────────────
-- ORDERS & ESCROW LIFECYCLE
-- ──────────────────────────────────────────────────────────────────────────

CREATE TYPE order_status AS ENUM (
  'paid',        -- buyer paid, money in escrow, vendor notified
  'confirmed',   -- vendor accepted
  'packed',
  'shipped',
  'delivered',
  'released',    -- escrow released to vendor wallet
  'refunded',    -- escrow returned to buyer
  'disputed'
);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        UUID NOT NULL REFERENCES users(id),
  vendor_id       UUID NOT NULL REFERENCES vendors(user_id),
  status          order_status NOT NULL DEFAULT 'paid',
  goods_kobo      BIGINT NOT NULL CHECK (goods_kobo > 0),
  delivery_kobo   BIGINT NOT NULL DEFAULT 0,
  referrer_id     UUID REFERENCES users(id),
  referral_kobo   BIGINT NOT NULL DEFAULT 0,
  ship_to         TEXT,
  ship_geo        geography(POINT, 4326),
  placed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at    TIMESTAMPTZ,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  released_at     TIMESTAMPTZ,
  /* Invariant: delivery cannot exceed goods value */
  CHECK (delivery_kobo <= goods_kobo)
);
CREATE INDEX orders_buyer_idx ON orders (buyer_id, placed_at DESC);
CREATE INDEX orders_vendor_idx ON orders (vendor_id, placed_at DESC);

CREATE TABLE order_items (
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  qty        INTEGER NOT NULL CHECK (qty > 0),
  unit_kobo  BIGINT NOT NULL CHECK (unit_kobo > 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE disputes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id),
  raised_by   UUID NOT NULL REFERENCES users(id),
  reason      TEXT NOT NULL,
  photo_urls  TEXT[],
  status      TEXT NOT NULL DEFAULT 'open',
  reviewer_id UUID REFERENCES users(id),
  resolution  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────────────────────────────────────
-- REPOSTS (referrals)
-- ──────────────────────────────────────────────────────────────────────────

CREATE TYPE repost_visibility AS ENUM ('public', 'mutuals', 'close_friends');

CREATE TABLE reposts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reposter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  caption     TEXT,
  visibility  repost_visibility NOT NULL DEFAULT 'public',
  /* Tracking */
  clicks      INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  earnings_kobo BIGINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reposter_id, product_id)
);

CREATE TABLE repost_clicks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repost_id  UUID NOT NULL REFERENCES reposts(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES users(id),
  ip_hash    TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- HIVE (communities)
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE communities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_path    TEXT UNIQUE NOT NULL, -- 'books/romance/christian'
  name         TEXT NOT NULL,
  emoji        TEXT,
  description  TEXT,
  bot_id       TEXT,                 -- matches bots/<id>.md
  pinned_topic TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE community_members (
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE TABLE community_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  /* NULL for bot messages */
  author_id    UUID REFERENCES users(id),
  bot_id       TEXT,
  body         TEXT NOT NULL,
  /* Optional: this message IS a poll. */
  poll_json    JSONB,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX community_messages_idx ON community_messages (community_id, created_at DESC);

-- Trend scoring snapshot (recomputed by background job)
CREATE TABLE community_trends (
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  topic        TEXT NOT NULL,
  score        NUMERIC NOT NULL,
  voices       INTEGER NOT NULL,
  msg_count    INTEGER NOT NULL,
  computed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, topic)
);

-- ──────────────────────────────────────────────────────────────────────────
-- POSTS / STORIES / REELS
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption    TEXT,
  image_urls TEXT[],
  product_id UUID REFERENCES products(id),
  likes      INTEGER NOT NULL DEFAULT 0,
  comments   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_author_idx ON posts (author_id, created_at DESC);

CREATE TABLE comments (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  likes     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption    TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stories_active_idx ON stories (author_id) WHERE expires_at > now();

CREATE TABLE reels (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  cover_url TEXT,
  caption   TEXT,
  audio     TEXT,
  views     BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS, MESSAGING
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL, -- 'order', 'follow', 'like', 'comment', 'sale', 'referral', 'escrow', 'bot', 'news'
  payload    JSONB NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE push_devices (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_token TEXT NOT NULL,
  platform   TEXT,
  PRIMARY KEY (user_id, expo_token)
);

CREATE TABLE chats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a     UUID NOT NULL REFERENCES users(id),
  user_b     UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (LEAST(user_a, user_b), GREATEST(user_a, user_b))
);

CREATE TABLE chat_messages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id   UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  body      TEXT,
  product_id UUID REFERENCES products(id), -- attachable product card
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_idx ON chat_messages (chat_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────
-- BOOKINGS (Bolt-style service tracking)
-- ──────────────────────────────────────────────────────────────────────────

CREATE TYPE booking_status AS ENUM (
  'requested', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'
);

CREATE TABLE bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id     UUID NOT NULL REFERENCES users(id),
  vendor_id    UUID NOT NULL REFERENCES vendors(user_id),
  product_id   UUID REFERENCES products(id),
  status       booking_status NOT NULL DEFAULT 'requested',
  start_at     TIMESTAMPTZ,
  location     geography(POINT, 4326),
  /* Live tracking — updated by partner every ~5s while en_route */
  vendor_geo   geography(POINT, 4326),
  buyer_geo    geography(POINT, 4326),
  rendezvous_notified_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (Supabase patterns — adapt as needed)
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE wallets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_tx      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc            ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;

-- Example: buyers can only see their own wallet
CREATE POLICY wallets_self ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wallet_tx_self ON wallet_tx
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY orders_party ON orders
  FOR SELECT USING (auth.uid() IN (buyer_id, vendor_id));

CREATE POLICY chats_party ON chats
  FOR SELECT USING (auth.uid() IN (user_a, user_b));

CREATE POLICY chat_messages_party ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_messages.chat_id
        AND auth.uid() IN (c.user_a, c.user_b)
    )
  );

-- KYC is never readable by anyone except the reviewer
CREATE POLICY kyc_owner ON kyc FOR SELECT USING (auth.uid() = user_id);

-- Write policies: server-only (use a service role for mutations).
-- Buyers/vendors never write to wallet_tx directly — only the API does.
