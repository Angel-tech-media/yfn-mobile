import { create } from 'zustand';

type EngagementState = {
  likedPosts: Record<string, true>;
  savedPosts: Record<string, true>;
  followedVendors: Record<string, true>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (vendorId: string) => void;
};

export const useEngagement = create<EngagementState>((set) => ({
  likedPosts: {},
  savedPosts: {},
  followedVendors: {},
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
}));

export const useIsLiked = (postId: string) =>
  useEngagement((s) => !!s.likedPosts[postId]);

export const useIsSaved = (postId: string) =>
  useEngagement((s) => !!s.savedPosts[postId]);

export const useIsFollowing = (vendorId: string) =>
  useEngagement((s) => !!s.followedVendors[vendorId]);
