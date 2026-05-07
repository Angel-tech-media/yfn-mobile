import { create } from 'zustand';

export type Address = {
  id: string;
  label: string;
  recipient: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  isDefault?: boolean;
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'transfer' | 'wallet';
  brand?: 'visa' | 'mastercard' | 'verve';
  last4?: string;
  label: string;
  isDefault?: boolean;
};

type AccountState = {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  addAddress: (a: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPayment: (p: Omit<PaymentMethod, 'id'>) => void;
  removePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;
};

export const useAccount = create<AccountState>((set) => ({
  addresses: [
    {
      id: 'a1',
      label: 'Home',
      recipient: 'David Okpo',
      street: '15 Admiralty Way',
      city: 'Lekki Phase 1',
      state: 'Lagos',
      phone: '+234 800 000 0000',
      isDefault: true,
    },
  ],
  paymentMethods: [
    { id: 'p1', type: 'card', brand: 'visa', last4: '4242', label: 'Personal · Visa', isDefault: true },
  ],
  addAddress: (a) =>
    set((s) => {
      const id = `a-${Date.now()}`;
      let list = [...s.addresses, { ...a, id }];
      if (a.isDefault) list = list.map((x) => ({ ...x, isDefault: x.id === id }));
      return { addresses: list };
    }),
  removeAddress: (id) =>
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
  setDefaultAddress: (id) =>
    set((s) => ({
      addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    })),
  addPayment: (p) =>
    set((s) => {
      const id = `p-${Date.now()}`;
      let list = [...s.paymentMethods, { ...p, id }];
      if (p.isDefault) list = list.map((x) => ({ ...x, isDefault: x.id === id }));
      return { paymentMethods: list };
    }),
  removePayment: (id) =>
    set((s) => ({ paymentMethods: s.paymentMethods.filter((p) => p.id !== id) })),
  setDefaultPayment: (id) =>
    set((s) => ({
      paymentMethods: s.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })),
    })),
}));
