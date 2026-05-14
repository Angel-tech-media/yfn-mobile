import { create } from 'zustand';

import { useAuth } from './auth';

export type Repost = {
  productId: string;
  vendorId: string;
  caption?: string;
  visibility: 'public' | 'mutuals' | 'close-friends';
  ts: number;
  /** Estimated earnings to date in NGN; mock until backend wires up. */
  earningsNgn: number;
  /** Number of clicks the user's repost link has received. */
  clicks: number;
  /** Number of conversions (purchases via this repost). */
  conversions: number;
};

type EngagementState = {
  likedPosts: Record<string, true>;
  savedPosts: Record<string, true>;
  followedVendors: Record<string, true>;
  reposts: Record<string, Repost>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
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
  reposts: {
    p1: {
      productId: 'p1',
      vendorId: 'sarahsboutique',
      caption: 'this gown is fire 🔥 had to share',
      visibility: 'public',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 3,
      earningsNgn: 250,
      clicks: 86,
      conversions: 5,
    },
    p2: {
      productId: 'p2',
      vendorId: 'aishathreads',
      visibility: 'mutuals',
      ts: Date.now() - 1000 * 60 * 60 * 12,
      earningsNgn: 100,
      clicks: 31,
      conversions: 2,
    },
    r6: {
      productId: 'r6',
      vendorId: 'tolathreads',
      caption: 'Super Eagles jersey drop — naija sizing finally 🇳🇬',
      visibility: 'public',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 1,
      earningsNgn: 400,
      clicks: 152,
      conversions: 8,
    },
    r7: {
      productId: 'r7',
      vendorId: 'beautybyfemi',
      caption: 'Day 14 of the kit — my skin is glowing, no jokes',
      visibility: 'public',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 6,
      earningsNgn: 150,
      clicks: 47,
      conversions: 3,
    },
    r11: {
      productId: 'r11',
      vendorId: 'naijakitchen',
      caption: 'Booked them for my mum\'s 60th — pure soul food',
      visibility: 'close-friends',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 10,
      earningsNgn: 200,
      clicks: 64,
      conversions: 4,
    },
    r14: {
      productId: 'r14',
      vendorId: 'kemibooks',
      caption: 'Best gift bundle for new readers — christmas sorted',
      visibility: 'mutuals',
      ts: Date.now() - 1000 * 60 * 60 * 2,
      earningsNgn: 50,
      clicks: 18,
      conversions: 1,
    },
    r10: {
      productId: 'r10',
      vendorId: 'tundeotun',
      visibility: 'public',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 14,
      earningsNgn: 0,
      clicks: 22,
      conversions: 0,
    },
  },
  toggleLike: (postId) =>
    set((s) => {
      const next = { ...s.likedPosts };
      if (next[postId]) delete next[postId];
      else next[postId] = true;
      return { likedPosts: next };
    }),
  toggleSave: (postId) =>
    set((s) => {
      const next = { ...s.savedPosts };
      if (next[postId]) delete next[postId];
      else next[postId] = true;
      return { savedPosts: next };
    }),
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
  useEngagement((s) => !!s.likedPosts[postId]);

export const useIsSaved = (postId: string) =>
  useEngagement((s) => !!s.savedPosts[postId]);

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
