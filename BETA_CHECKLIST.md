# Vibe — Beta Testing Checklist & Tester Guide

## 1. Application Overview
- **App Name:** Vibe
- **Package / Bundle ID:** `ng.vibe.app`
- **Current Version:** `1.0.0` (Build 1)
- **Design Standard:** Apple Human Interface Guidelines / Midnight Theme
  - Base: `#0A0E1F`
  - Surface: `#121833`
  - Text: `#F5F1EA`
  - Primary Accent: `#2F6BFF` (Glory Blue)
  - Destructive / Badge: `#E5262F` (Altar Red)
  - Price & Ratings: `#F4C464` (Vibe Gold)

---

## 2. Installation & Access

### Android Preview (EAS APK)
1. Download the latest preview build APK from the EAS dashboard build link or build locally using:
   ```bash
   eas build --profile preview --platform android
   ```
2. Enable "Install from unknown sources" if prompted by Android.
3. Install and open **Vibe**.

### iOS Internal TestFlight
1. Open the TestFlight invitation link sent to your Apple ID.
2. Accept the invitation and tap **Install** to download **Vibe**.

### Expo Go (Development / Local Testing)
1. Start the Fastify backend on the host machine:
   ```bash
   cd c:\Users\UDSER\YFN
   npm run dev
   ```
2. Set `EXPO_PUBLIC_API_URL` in `.env` to your machine's LAN IP (e.g. `http://192.168.1.50:4000/api/v1`).
3. Start the Expo app:
   ```bash
   cd c:\Users\UDSER\yfn-mobile
   npx expo start
   ```
4. Scan the QR code using Expo Go on Android or the Camera app on iOS.

---

## 3. Seeded Test Accounts

| Role | Email | Password | Handle | Notes |
|---|---|---|---|---|
| **Buyer** | `buyer@example.com` | `Password123!` | `@buyer` | Funded test wallet, sample orders, cart |
| **Vendor** | `vendor@example.com` | `Password123!` | `@demo_vendor` | Vibe Couture storefront, listings, pending orders |
| **Vendor** | `sarah@example.com` | `Password123!` | `@sarah_glow` | Sarah Glow storefront, skincare listings |
| **Vendor** | `tech@example.com` | `Password123!` | `@gadget_pro` | Lagos Tech Hub, electronics listings |

> *Note: Testers can also register brand-new accounts via the Sign Up screen with any email and receive the OTP in dev mode or via console/test provider.*

---

## 4. Key Flows to Test

### Flow A: Authentication & Onboarding
- [ ] Sign up with a new email address.
- [ ] Receive and verify OTP code.
- [ ] Complete profile setup (display name, handle, avatar upload).
- [ ] Log out and log back in with password.

### Flow B: Browse & Search
- [ ] Explore the home feed and reels feed.
- [ ] Search for products by name, sector, and price filters.
- [ ] Inspect product detail pages (images, description, vendor details, rating).

### Flow C: Cart & Checkout
- [ ] Add multiple products from the same vendor to the cart.
- [ ] Proceed to checkout.
- [ ] Pay via Vibe Wallet balance or Paystack test mode.
- [ ] Verify order creation and balance deduction.

### Flow D: Order Lifecycle & Escrow
- [ ] Log in as Vendor (`vendor@example.com`) to view new order in vendor dashboard.
- [ ] Advance order status: `paid` → `confirmed` → `packed` → `shipped`.
- [ ] Log in as Buyer (`buyer@example.com`) and verify status updates in real-time.
- [ ] Buyer confirms delivery (`delivered` → `released`).
- [ ] Verify vendor wallet is credited and funds released from escrow.

### Flow E: Real-Time Messaging
- [ ] Open a product and tap **Chat with Vendor**.
- [ ] Send direct text messages, order inquiries, and photos.
- [ ] Verify instant delivery over Socket.IO and REST fallback.
- [ ] Verify unread count badge increments and decrements upon viewing.

### Flow F: Safety, Moderation & Compliance
- [ ] Open a user profile, tap the "..." options menu, and submit a **Report**.
- [ ] Block a user and verify their messages and content are hidden.
- [ ] Review Terms of Service and Privacy Policy from Settings.
- [ ] Test account deletion with verification guard (Settings > Delete Account).

---

## 5. Known Limitations & Unverified Configurations

1. **Paystack Live Mode:**
   - Paystack transactions are fully implemented and verified with mock/test mode signatures (`test/payments-paystack.test.ts`).
   - Production transactions remain **NOT VERIFIED** until live Paystack secret keys and webhook endpoints are configured.
2. **SMS Delivery (Termii):**
   - Implemented behind the `OtpDriver` interface. Tested with `ConsoleOtpDriver` and `ResendOtpDriver`.
   - Real SMS delivery via Termii is **NOT VERIFIED** without live Termii API keys.
3. **Cloudflare R2 Media Uploads:**
   - Production uploads stream to Cloudflare R2; local dev-fallback stores files under `public/uploads`.
   - R2 in production is **NOT VERIFIED** until production bucket credentials and domain are bound.
4. **Push Notifications:**
   - Push infrastructure is wired via Expo Push API and tested. Physical delivery requires device token generation from an installed build on physical hardware.

---

## 6. How to Report Bugs & Feedback

- **In-App Support:**
  - Navigate to **Profile → Settings → Help & Support**.
  - Tap **Email Us** (`support@vibe.ng`) or **Call Support** (`+234 800 000 8423`).
- **In-App Reporting:**
  - Tap the "..." menu on any profile or content item to submit an immediate flag to the moderation queue.
- **Critical / Blocking Issues:**
  - Send bug reports including device model, OS version, screenshot, and reproduction steps to `beta-feedback@vibe.ng`.
