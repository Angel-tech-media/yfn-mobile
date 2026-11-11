import { create } from 'zustand';

export type HomeTab = 'For you' | 'Following' | 'Shop drops' | 'News';

export const DEFAULT_HOME_TABS: readonly HomeTab[] = [
  'For you',
  'Following',
  'Shop drops',
  'News',
] as const;

type HomeTabsState = {
  activeTab: HomeTab;
  /** Timestamp (ms) when the user last viewed each tab. */
  lastSeenAt: Record<HomeTab, number>;
  /** Timestamp (ms) of the newest item / update in each tab's stream. */
  latestUpdatedAt: Record<HomeTab, number>;
  setActiveTab: (tab: HomeTab) => void;
  markSeen: (tab: HomeTab) => void;
  reportStreamUpdate: (tab: HomeTab, updatedAtMs: number) => void;
};

const now = Date.now();

export const useHomeTabs = create<HomeTabsState>((set) => ({
  activeTab: 'For you',
  lastSeenAt: {
    'For you': now,
    Following: now - 30 * 60_000,
    'Shop drops': now - 45 * 60_000,
    News: now - 60 * 60_000,
  },
  latestUpdatedAt: {
    'For you': now,
    Following: now - 10 * 60_000,
    'Shop drops': now - 5 * 60_000,
    News: now - 2 * 60_000,
  },
  setActiveTab: (tab) =>
    set((state) => ({
      activeTab: tab,
      lastSeenAt: {
        ...state.lastSeenAt,
        [tab]: Date.now(),
      },
    })),
  markSeen: (tab) =>
    set((state) => ({
      lastSeenAt: {
        ...state.lastSeenAt,
        [tab]: Date.now(),
      },
    })),
  reportStreamUpdate: (tab, updatedAtMs) =>
    set((state) => {
      if (!updatedAtMs || updatedAtMs <= (state.latestUpdatedAt[tab] ?? 0)) {
        return state;
      }
      return {
        latestUpdatedAt: {
          ...state.latestUpdatedAt,
          [tab]: updatedAtMs,
        },
      };
    }),
}));

/**
 * Dynamically orders the Home tabs so the freshest / unseen streams move closer to the left:
 * - "For you" stays anchored first as the primary home feed, OR if another tab has brand-new
 *   unseen updates, the remaining tabs ("Following", "Shop drops", "News") sort immediately after
 *   "For you" by:
 *   1. Unseen status (`latestUpdatedAt[tab] > lastSeenAt[tab]`) first
 *   2. Freshness (`latestUpdatedAt[tab]` descending — most recently updated closest to the left)
 *   3. Least recently seen (`lastSeenAt[tab]` ascending) as tiebreaker
 */
export function getDynamicHomeTabs(
  lastSeenAt: Record<HomeTab, number>,
  latestUpdatedAt: Record<HomeTab, number>,
): HomeTab[] {
  const dynamicRest: HomeTab[] = ['Following', 'Shop drops', 'News'];
  dynamicRest.sort((a, b) => {
    const aUnseen = (latestUpdatedAt[a] ?? 0) > (lastSeenAt[a] ?? 0) ? 1 : 0;
    const bUnseen = (latestUpdatedAt[b] ?? 0) > (lastSeenAt[b] ?? 0) ? 1 : 0;
    if (aUnseen !== bUnseen) return bUnseen - aUnseen;

    const aFresh = latestUpdatedAt[a] ?? 0;
    const bFresh = latestUpdatedAt[b] ?? 0;
    if (aFresh !== bFresh) return bFresh - aFresh;

    return (lastSeenAt[a] ?? 0) - (lastSeenAt[b] ?? 0);
  });

  return ['For you', ...dynamicRest];
}
