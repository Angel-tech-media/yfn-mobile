/**
 * Vibe platform-fee model — "stamp duty" pricing.
 *
 * Rationale (see docs/strategy/expert-analysis.md):
 * - Inclusive: every vendor competes on equal information; insights are free.
 * - Vibe earns when vendors earn (per-transaction, not subscription).
 * - Pricing alignment: cheapest commerce rail in Nigeria by an order of
 *   magnitude vs. Jumia/Konga commission models.
 * - Buyer-paid (matches the bank stamp-duty mental model). Vendor receives
 *   the full subtotal; no commission deducted from their wallet.
 *
 * Formula:
 *   fee = max(BASE, BASE + RATE * (subtotal - THRESHOLD))   when subtotal > THRESHOLD
 *   fee = BASE                                              when subtotal <= THRESHOLD
 *   fee = min(fee, MAX)                                     always
 *
 * Examples:
 *   ₦500   → ₦10        (flat, under threshold)
 *   ₦5,000 → ₦10        (flat, at threshold)
 *   ₦10,000 → ₦10 + ₦25  = ₦35
 *   ₦50,000 → ₦10 + ₦225 = ₦235
 *   ₦100,000 → ₦10 + ₦475 = ₦485
 *   ₦500,000 → capped at ₦500
 */

export const PLATFORM_FEE_BASE_NGN = 10;
export const PLATFORM_FEE_THRESHOLD_NGN = 5000;
export const PLATFORM_FEE_RATE = 0.005; // 0.5%
export const PLATFORM_FEE_MAX_NGN = 500;

/** Compute the buyer-side Vibe service fee for a given subtotal. */
export function computePlatformFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  const overThreshold = Math.max(0, subtotal - PLATFORM_FEE_THRESHOLD_NGN);
  const variable = Math.round(overThreshold * PLATFORM_FEE_RATE);
  const fee = PLATFORM_FEE_BASE_NGN + variable;
  return Math.min(fee, PLATFORM_FEE_MAX_NGN);
}

/** Short label used in checkout/order summaries. */
export const PLATFORM_FEE_LABEL = 'Vibe service fee';

/**
 * One-line explainer for tooltips, FAQ, vendor-facing copy.
 * Keep wording stable — referenced from multiple screens.
 */
export const PLATFORM_FEE_EXPLAINER =
  'Flat ₦10 + 0.5% on amounts over ₦5,000 (capped at ₦500). Pays for escrow, delivery tracking, and dispute handling.';
