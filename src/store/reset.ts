import { queryClient } from '../lib/query-client';

import { useAccount } from './account';
import { useCart } from './cart';
import { useChat } from './chat';
import { useEngagement } from './engagement';
import { useHiveChat } from './hive-chat';
import { useOrders } from './orders';
import { useSearchHistory } from './search';
import { useUserContent } from './user-content';
import { useWallet } from './wallet';
import { useWishlist } from './wishlist';

/**
 * Clears all local state stores and caches when switching accounts or signing out.
 */
export function resetAllStores() {
  // Clear React Query cache
  queryClient.clear();

  // Reset all Zustand stores
  useAccount.setState({ addresses: [], paymentMethods: [] });
  useCart.setState({ lines: [] });
  useChat.setState({ threads: {} });
  useEngagement.setState({
    likedPosts: {},
    savedPosts: {},
    followedVendors: {},
    reposts: {},
    repostedPosts: {},
  });
  useHiveChat.setState({ messages: {} });
  useOrders.setState({ orders: [] });
  useSearchHistory.setState({ history: [] });
  useUserContent.setState({ posts: [], stories: [], reels: [], products: [] });
  useWallet.setState({ balance: 0, inEscrow: 0, accountNumber: '', bankName: '', recent: [] });
  useWishlist.setState({ items: [] });
}
