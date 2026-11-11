# Aktive — Design & Functionality Brief (for Lovable)

## What Aktive is
A social-commerce marketplace for everyday people in Nigeria/Africa: shop from vendors, follow creators, pay safely with escrow, sell from your phone.
It is NOT a news or community-chat app. Those live in a separate app (The Hive Network), which links to Aktive via a button, the way Facebook links to Messenger.

## Design direction
Apple-grade: calm, restrained, mature, functional, easy for the common man. No clutter, no decorative extras.

| Token | Value |
|---|---|
| Base (OLED carbon) | `#08080C` |
| Glass surface | `rgba(22,22,27,0.76)` + hairline border |
| Selected pill | `#FAFAFA` with `#09090B` text |
| Primary CTA | Terracotta `#E85D3F` to `#C94124` |
| Price / rating | Gold `#F5C469` (prices only) |
| Font | Inter Tight (titles, tight tracking) + Inter (body) |
| Scale | largeTitle 34, title 22, body 17, subhead 15, footnote 13, caption 12 |
| Layout | 16pt margins, 8pt grid, 44pt touch targets, squircle corners |

## Screens (mobile, 4 tabs + create)
Home feed, Market, Wallet, Profile, centre "+" create sheet.
Also: product detail, cart, checkout (escrow), orders, wishlist, search, reels, live, messages, vendor dashboard, settings, help.

## What we want from Lovable
1. Polish aesthetics: spacing, hierarchy, feed card, product card, empty/loading/error states.
2. Suggest a simpler information architecture: fewer visible features for first-time users.
3. A web version of the marketplace (browse, product page, cart, checkout) sharing the same API.
4. Landing page for Aktive (hero, how escrow works, sell on Aktive, download buttons).
5. Keep the palette and typography above. Do not add gold anywhere except prices.

## Backend
Fastify 5 + Postgres + Socket.IO. Endpoints: auth, products, orders, payments (Paystack), wallet, vendors, bookings, chat, social, search, uploads, notifications, moderation.
Configure the API via `EXPO_PUBLIC_API_URL` (no secrets are included in this repo).

## Constraints
- Mobile app is React Native (Expo), not web. Lovable output (React web) is for the web app and landing page, and as a design reference for the mobile screens.
