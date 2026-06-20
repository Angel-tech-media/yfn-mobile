import { create } from 'zustand';

import { useAuth } from './auth';

export type Repost = {
  productId: string;
  vendorId: string;
  caption?: string;
  visibility: 'public' | 'mutuals' | 'close-friends';
  ts: number;
  /** Estimated earnings to date in NGN for local-only fallback contexts. */
  earningsNgn: number;
  /** Number of clicks the user's repost link has received. */
  clicks: number;
  /** Number of conversions (purchases via this repost). */
  conversions: number;
};

type EngagementState = {
  likedPosts: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  followedVendors: Record<string, true>;
  reposts: Record<string, Repost>;
  setLike: (postId: string, liked: boolean) => void;
  setSave: (postId: string, saved: boolean) => void;
  toggleFollow: (vendorId: string) => void;
  /** Add or remove a repost. If the product is already reposted, removes it. */
  toggleRepost: (input: {
    productId: string;
    vendorId: string;
    caption?: string;
    visibility?: Repost['visibility'];
  }) => void;
  isReposted: (productId: string) => boolean;
  /**
   * Record a sale attributed to a repost. Bumps conversions + earnings on the
   * matching repost. No-op if the productId isn't currently reposted by anyone
   * tracked locally — backend remains the source of truth in production.
   */
  recordRepostSale: (input: { productId: string; feeNgn: number }) => void;
};

export const useEngagement = create<EngagementState>((set, get) => ({
  likedPosts: {},
  savedPosts: {},
  followedVendors: {},
  reposts: {},
  setLike: (postId, liked) =>
    set((s) => ({
      likedPosts: { ...s.likedPosts, [postId]: liked },
    })),
  setSave: (postId, saved) =>
    set((s) => ({
      savedPosts: { ...s.savedPosts, [postId]: saved },
    })),
  toggleFollow: (vendorId) =>
    set((s) => {
      const next = { ...s.followedVendors };
      if (next[vendorId]) delete next[vendorId];
      else next[vendorId] = true;
      return { followedVendors: next };
    }),
  toggleRepost: ({ productId, vendorId, caption, visibility = 'public' }) =>
    set((s) => {
      // Block self-reposts: a vendor reposting their own product would
      // earn the ₦50 referral on their own sales — disallow.
      const currentHandle = useAuth.getState().user?.handle;
      if (currentHandle && currentHandle === vendorId) return s;
      const next = { ...s.reposts };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = {
          productId,
          vendorId,
          caption,
          visibility,
          ts: Date.now(),
          earningsNgn: 0,
          clicks: 0,
          conversions: 0,
        };
      }
      return { reposts: next };
    }),
  isReposted: (productId) => !!get().reposts[productId],
  recordRepostSale: ({ productId, feeNgn }) =>
    set((s) => {
      const existing = s.reposts[productId];
      if (!existing) return s;
      return {
        reposts: {
          ...s.reposts,
          [productId]: {
            ...existing,
            conversions: existing.conversions + 1,
            earningsNgn: existing.earningsNgn + feeNgn,
          },
        },
      };
    }),
}));

export const useIsLiked = (postId: string) =>
  useEngagement((s) => s.likedPosts[postId]);

export const useIsSaved = (postId: string) =>
  useEngagement((s) => s.savedPosts[postId]);

export const useIsFollowing = (vendorId: string) =>
  useEngagement((s) => !!s.followedVendors[vendorId]);

export const useIsReposted = (productId: string) =>
  useEngagement((s) => !!s.reposts[productId]);

/**
 * Returns true when the current user is allowed to repost this vendor's product.
 * Self-reposts are blocked (would let a vendor earn referrals on their own sales).
 */
export const useCanRepost = (vendorId: string) => {
  const myHandle = useAuth((s) => s.user?.handle);
  return !myHandle || myHandle !== vendorId;
};

/**
 * Selects the repost map (stable reference) then computes derived stats
 * outside the selector to avoid infinite re-renders.
 */
export const useRepostStats = () => {
  const reposts = useEngagement((s) => s.reposts);
  const list = Object.values(reposts);
  return {
    list,
    totalEarnings: list.reduce((acc, r) => acc + r.earningsNgn, 0),
    totalClicks: list.reduce((acc, r) => acc + r.clicks, 0),
    totalConversions: list.reduce((acc, r) => acc + r.conversions, 0),
  };
};

/** Default referral fee — added on top of the product price for the buyer. */
export const REFERRAL_FEE_NGN = 50;
/** Visible commission rate label for marketing. */
export const REFERRAL_RATE_LABEL = '~1% of price (capped per item)';
