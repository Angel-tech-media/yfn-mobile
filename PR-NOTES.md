# PR notes — repost-as-referral + Hive fixes

## What changed

### Repost mechanic (wired end-to-end)
- New repost entry points on **place/[id]** product cards, **market reels** action rail, and **home feed** (as a first-class repost feed item type). The product detail header already had one.
- Reposts render as a feed item with reposter row, italic quote, and an embedded vendor card. Buy-now routes to `/product/{id}?via={reposter}`.
- `referrerHandle` is persisted on `Order` and surfaced on the order detail page.
- Reposter earnings + conversions bump in the engagement store when a repost-attributed sale completes.
- Self-reposts are blocked in `toggleRepost` (uses the auth store). `RepostSheet` shows an explainer instead of the CTA when the current user is the vendor.

### Hive bugs
- **Community crash** — `useCommunityMessages` returned a fresh `[]` every render when a community had no messages, looping `useSyncExternalStore`. Hoisted a stable `EMPTY` constant.
- **Trending sort no-op** — was sorting on `wrapper.members` instead of `wrapper.node.members`, always evaluating to 0.
- **Sent messages off-screen** — chat now auto-scrolls to the bottom when a new message arrives, so your message is visible below the static sample thread.

### Misc
- Ignored `.sim-shots/` (local device screenshot output).

## How to test

- [ ] **Place page repost** — Home → tap any vendor → each product card has a small repost button on the image (top-right). Tap → sheet opens for that product.
- [ ] **Home feed reposts** — scroll for **Olufemi Adekoya** (reposting Aisha Threads) and **Bisi Akande** (reposting Tola Bakare). New layout: reposter row on top, italic quote with orange left-bar, embedded vendor card.
- [ ] **Market reels repost** — Market tab → swipe through reels → **Repost** button between Share and Save in the right action rail. Reflects state.
- [ ] **Full attribution loop** — On a repost feed item, tap **Buy now** → product page shows orange "via @olufemia" banner with +₦50 line → pay → order detail shows the new "Reached via @olufemia's repost — they earn ₦50" chip.
- [ ] **Self-repost block** — sign in with a handle that matches a vendor handle (e.g. `aishathreads`) → open the sheet for that vendor's product → CTA is replaced with "You can't repost your own product."
- [ ] **Hive community chat** — Hive tab → tap any community (Books → Romance → Christian Romance, etc.) → chat view loads (bot welcome, sample thread, poll, composer). Send a message via the composer → view auto-scrolls to it.

## Known leftover (not in this PR)

- 21 lingering TS errors (route-literal types, zod v4 mismatch in signup, `isAdd` shape on STORIES). All pre-existing.
- 2 expo-router warnings on boot (`vendor-verify`/`vendor-store-setup` declared but route group doesn't exist yet).
- Backend escrow split (record `referrerId` on checkout server-side, split ₦50 to reposter wallet at release) — frontend simulates it locally; needs the NestJS repo to land it for real.
- Anti-abuse beyond self-repost block (per-buyer-per-vendor throttling, fraud detection).
