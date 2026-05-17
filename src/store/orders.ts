import { create } from 'zustand';

export type OrderStatus = 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'released';

export type Order = {
  id: string;
  vendor: string;
  vendorHandle: string;
  items: Array<{ name: string; qty: number; unit: number }>;
  status: OrderStatus;
  placedAt: number;
  /** Handle of the user whose repost drove this sale, if any. */
  referrerHandle?: string;
};

type OrderState = {
  orders: Order[];
  add: (input: Omit<Order, 'placedAt' | 'status'> & { status?: OrderStatus }) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  remove: (id: string) => void;
};

export const useOrders = create<OrderState>((set) => ({
  orders: [],
  add: ({ status = 'paid', ...rest }) =>
    set((s) => ({
      orders: [{ ...rest, status, placedAt: Date.now() }, ...s.orders],
    })),
  setStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  remove: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
}));
