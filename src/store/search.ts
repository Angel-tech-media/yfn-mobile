import { create } from 'zustand';

type SearchState = {
  history: string[];
  addHistory: (query: string) => void;
  removeHistory: (query: string) => void;
  clearHistory: () => void;
};

export const useSearchHistory = create<SearchState>((set) => ({
  history: [],
  addHistory: (query: string) =>
    set((state) => {
      const q = query.trim();
      if (!q) return state;
      const filtered = state.history.filter((h) => h !== q);
      return { history: [q, ...filtered].slice(0, 15) };
    }),
  removeHistory: (query: string) =>
    set((state) => ({
      history: state.history.filter((h) => h !== query),
    })),
  clearHistory: () => set({ history: [] }),
}));
