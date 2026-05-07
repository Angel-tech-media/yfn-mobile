import type { ImageSourcePropType } from 'react-native';

import { create } from 'zustand';

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
  vendor: string;
};

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlist = create<WishlistState>((set) => ({
  items: [],
  toggle: (item) =>
    set((s) => {
      const exists = s.items.some((i) => i.id === item.id);
      if (exists) return { items: s.items.filter((i) => i.id !== item.id) };
      return { items: [...s.items, item] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

export const useIsWishlisted = (id: string) =>
  useWishlist((s) => s.items.some((i) => i.id === id));

export const useWishlistCount = () =>
  useWishlist((s) => s.items.length);
