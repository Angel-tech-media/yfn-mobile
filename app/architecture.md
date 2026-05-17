# Vibe app — Figma → code architecture

The Figma file (`https://www.figma.com/design/lBPJKJiuTr7hbyD0Q4DIFq/YFN-Mobile-App`)
groups every screen into one of 8 sections plus a Components page. The code
mirrors that grouping 1:1 using Expo Router route groups so the file tree
reads like the Figma sidebar. Route groups are wrapped in parentheses and do
not affect URLs — every existing URL keeps working.

## Section map

| Figma section            | Code location                       | URL prefix                |
|--------------------------|-------------------------------------|---------------------------|
| App Launch               | `app/(app-launch)/`                 | `/splash`, `/welcome`, `/intent` |
| Login (all users)        | `app/(login)/`                      | `/login`, `/two-factor`, `/forgot-*`, `/reset-password` |
| Buyer Signup             | `app/(buyer-signup)/`               | `/signup`, `/verify`, `/onboarding-complete` |
| Vendor Signup            | `app/(vendor-signup)/`              | `/vendor-ready` (signup itself is shared with buyer via `?role=vendor`) |
| Vendor verification      | `app/vendor-verify/`                | `/vendor-verify`, `/vendor-verify/...` |
| Vendor Store Setup       | `app/vendor-store-setup/`           | `/vendor-store-setup`, `/vendor-store-setup/...` |
| Vendor Dashboard         | `app/(vendor-dashboard)/`           | `/vendor-dashboard`, `/vendor-store`, `/products/...` |
| Home Feed (Buyer/All)    | `app/(home-feed)/`                  | `/(tabs)`, `/cart`, `/checkout`, `/orders/...`, `/wishlist`, `/notifications`, `/messages/...`, `/post/...`, `/u/...`, `/story/...`, `/reels`, `/reel`, `/search`, `/help`, `/account/...`, `/settings/...`, `/create/...` |
|                          | Bottom tabs (in `(tabs)/`)          | Home · Discover (map) · `+` · Wallet · News · Profile. `shop` and `inbox` remain as routes (`href: null`) but are not in the bar. |
| Components               | `components/ui/`                    | (UI primitives, not routed) |

Each Figma section folder owns its own `_layout.tsx` that registers its
Stack screens and section-specific options (animations, modal presentations).
The root `_layout.tsx` only registers the eight sections + a few utility
routes (index redirect, modal).

## Components page

The Figma "Components" canvas — Navbar, Avatar, Status, Stock-tag, Like,
Play, etc. — maps to `components/ui/`:

| Figma component          | Code primitive                       |
|--------------------------|--------------------------------------|
| Navbar                   | `components/ui/BottomTabBar.tsx`     |
| Avatar / Image-48        | `components/ui/Avatar.tsx`           |
| verified-check           | `components/ui/VerifiedCheck.tsx`    |
| Status                   | `components/ui/StatusBadge.tsx`      |
| Stock-tag                | `components/ui/StockTag.tsx`         |
| Like                     | `components/ui/HeartButton.tsx`      |
| Play                     | `components/ui/PlayButton.tsx`       |
| Input Bar                | `components/ui/InputBar.tsx`         |
| Checkbox                 | `components/ui/Checkbox.tsx`         |
| View (eye toggle)        | folded into `TextField.tsx`          |
| story-author-info        | `components/ui/StoryAuthorInfo.tsx`  |
| Component-12 (icon btn)  | `components/ui/IconButton.tsx`       |
| Component-15 (heart btn) | `components/ui/HeartButton.tsx`      |
| change-color (swatch)    | inline in `app/(home-feed)/product/[id].tsx` |
| product-carousel         | inline tile grids                    |
| loading-spinners         | `components/ui/LoadingSpinner.tsx`   |
| (Card / glass)           | `components/ui/GlassCard.tsx`        |
| Stepper                  | `components/ui/Stepper.tsx`          |
| RadioRow                 | `components/ui/RadioRow.tsx`         |
| Bottom sheet             | `components/ui/BottomSheet.tsx`      |
| Upload sheet             | `components/ui/UploadSheet.tsx`      |
| Date picker sheet        | `components/ui/DatePickerSheet.tsx`  |
| Create sheet             | `components/ui/CreateSheet.tsx`      |
| OTP input                | `components/ui/OtpInput.tsx`         |
| Country phone field      | `components/ui/CountryPhoneField.tsx`|
| Select field             | `components/ui/SelectField.tsx`      |
| Top bar                  | `components/ui/TopBar.tsx`           |
| Brand logo               | `components/ui/BrandLogo.tsx`        |
| Espresso background      | `components/ui/EspressoBackground.tsx` |
| Screen container         | `components/ui/ScreenContainer.tsx`  |
| Primary button           | `components/ui/PrimaryButton.tsx`    |
| Text field               | `components/ui/TextField.tsx`        |
| Link text                | `components/ui/LinkText.tsx`         |

## State stores

Domain state lives under `src/store/`:

- `cart.ts` — line items, totals, qty +/-, add/remove/clear
- `wishlist.ts` — saved products
- `engagement.ts` — likedPosts, savedPosts, followedVendors
- `account.ts` — saved addresses, payment methods, defaults
- `user.ts` — current role (buyer | vendor), hasStore

## Theme

`src/theme/` contains:

- `tokens.ts` — palette, radius, spacing, typography, gradient stops
- `fonts.ts` — Manrope variants registered with `useFonts`
- `index.ts` — re-exports

## Asset extraction

Real Figma raster assets live in `assets/figma/` (welcome hero photo, glass
icons for intent, store banner/avatar, product samples, story portraits,
verify-intro logo, reel snowboarder photo). Each was rendered via the Figma
images API at scale=2 from a specific node ID and downloaded into the repo.

## Adding a new screen

1. Identify the Figma section it belongs to.
2. Drop the file into that section's folder.
3. Register it in the section's `_layout.tsx` (only required if you need
   custom Stack options — animation, modal presentation, etc.).
4. The URL is determined by the file path inside the section, ignoring the
   parenthesised group name.

## Navigation philosophy

- The buyer is always inside `(home-feed)`. The bottom `(tabs)` group lives
  inside `(home-feed)` and is the buyer's persistent nav.
- The vendor side has its own dashboard root (`(vendor-dashboard)`) which is
  reached from the Profile tab's role toggle and from the "Become a vendor"
  CTA flow that ends at `/vendor-dashboard`.
- Auth/onboarding flows live in their own sections and are pushed onto the
  root Stack — they're not children of `(home-feed)` or `(vendor-dashboard)`.
