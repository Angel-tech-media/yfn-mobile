import type { ImageSourcePropType } from 'react-native';

import { create } from 'zustand';

export type CartLine = {
  id: string;
  name: string;
  price: number;
  priceKobo?: number;
  quantity: number;
  image: ImageSourcePropType;
  vendor: string;
  vendorId?: string;
  color?: string;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  remove: (id: string, color?: string) => void;
  setQuantity: (id: string, quantity: number, color?: string) => void;
  clear: () => void;
};

const sameLine = (a: CartLine, b: { id: string; color?: string }) =>
  a.id === b.id && (a.color ?? '') === (b.color ?? '');

export const useCart = create<CartState>((set) => ({
  lines: [],
  add: (line, quantity = 1) =>
    set((state) => {
      const existing = state.lines.findIndex((l) => sameLine(l, line));
      if (existing >= 0) {
        const next = [...state.lines];
        next[existing] = { ...next[existing], quantity: next[existing].quantity + quantity };
        return { lines: next };
      }
      return { lines: [...state.lines, { ...line, quantity }] };
    }),
  remove: (id, color) =>
    set((state) => ({ lines: state.lines.filter((l) => !sameLine(l, { id, color })) })),
  setQuantity: (id, quantity, color) =>
    set((state) => {
      if (quantity <= 0) {
        return { lines: state.lines.filter((l) => !sameLine(l, { id, color })) };
      }
      return {
        lines: state.lines.map((l) => (sameLine(l, { id, color }) ? { ...l, quantity } : l)),
      };
    }),
  clear: () => set({ lines: [] }),
}));

export const useCartCount = () =>
  useCart((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));

export const useCartTotal = () =>
  useCart((s) => s.lines.reduce((acc, l) => acc + l.price * l.quantity, 0));
