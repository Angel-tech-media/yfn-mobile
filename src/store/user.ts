import { create } from 'zustand';

export type Role = 'buyer' | 'vendor';

type UserState = {
  role: Role;
  hasStore: boolean;
  setRole: (role: Role) => void;
  toggleRole: () => void;
};

export const useUser = create<UserState>((set) => ({
  role: 'buyer',
  hasStore: true,
  setRole: (role) => set({ role }),
  toggleRole: () => set((s) => ({ role: s.role === 'buyer' ? 'vendor' : 'buyer' })),
}));
