import { create } from 'zustand';

type CartyState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

/** Lets any screen open the Carty shopping assistant (e.g. from the Market "Ask Carty" field). */
export const useCarty = create<CartyState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
