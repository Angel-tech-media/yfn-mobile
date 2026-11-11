import { queryClient } from '../lib/query-client';

/**
 * Clears all local state stores and caches when switching accounts or signing out.
 * Lazy requires ensure no circular dependency cycles are created across stores.
 */
export function resetAllStores() {
  // Clear React Query cache
  queryClient.clear();

  // Reset all Zustand stores lazily
  try {
    const { useAccount } = require('./account');
    useAccount.setState({ addresses: [], paymentMethods: [] });
  } catch (_) {}

  try {
    const { useCart } = require('./cart');
    useCart.setState({ lines: [] });
  } catch (_) {}

  try {
    const { useChat } = require('./chat');
    useChat.setState({ threads: {} });
  } catch (_) {}

  try {
    const { useEngagement } = require('./engagement');
    useEngagement.setState({
      likedPosts: {},
      savedPosts: {},
      followedVendors: {},
      reposts: {},
      repostedPosts: {},
    });
  } catch (_) {}

  try {
  } catch (_) {}

  try {
    const { useOrders } = require('./orders');
    useOrders.setState({ orders: [] });
  } catch (_) {}

  try {
    const { useSearchHistory } = require('./search');
    useSearchHistory.setState({ history: [] });
  } catch (_) {}

  try {
    const { useUserContent } = require('./user-content');
    useUserContent.setState({ posts: [], stories: [], reels: [], products: [] });
  } catch (_) {}

  try {
    const { useWallet } = require('./wallet');
    useWallet.setState({ balance: 0, inEscrow: 0, accountNumber: '', bankName: '', recent: [] });
  } catch (_) {}

  try {
    const { useWishlist } = require('./wishlist');
    useWishlist.setState({ items: [] });
  } catch (_) {}
}
