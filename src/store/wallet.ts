import { create } from 'zustand';

export type WalletTx = {
  id: string;
  kind: 'escrow_in' | 'release' | 'topup' | 'refund' | 'referral';
  label: string;
  amount: number; // NGN, always positive — the sign is implied by `kind`
  when: string;
  orderId?: string;
};

type WalletState = {
  /** Cleared funds available to spend immediately. */
  balance: number;
  /** Funds locked in Vibe escrow on the buyer's behalf. */
  inEscrow: number;
  /** Account number assigned to the eWallet (for top-ups from a bank app). */
  accountNumber: string;
  bankName: string;
  recent: WalletTx[];

  /** Debit the eWallet for a purchase; pushes funds into escrow. */
  payFromWallet: (input: { amount: number; orderId: string; vendor: string }) =>
    | { ok: true }
    | { ok: false; reason: 'insufficient' };

  /** Top up the eWallet in local-only fallback contexts. */
  topUp: (amount: number, source?: string) => void;

  /** Vendor side: release funds from escrow after delivery confirmation. */
  releaseFromEscrow: (input: { amount: number; orderId: string; vendor: string }) => void;

  /** Withdraw from wallet to bank — debits balance, logs a `withdrawal` row. */
  withdraw: (input: { amount: number; bank: string }) =>
    | { ok: true }
    | { ok: false; reason: 'insufficient' };
};

export const useWallet = create<WalletState>((set) => ({
  balance: 0,
  inEscrow: 0,
  accountNumber: '',
  bankName: '',
  recent: [],

  payFromWallet: ({ amount, orderId, vendor }) => {
    let result: { ok: true } | { ok: false; reason: 'insufficient' } = { ok: true };
    set((s) => {
      if (s.balance < amount) {
        result = { ok: false, reason: 'insufficient' };
        return s;
      }
      const tx: WalletTx = {
        id: `t${Date.now()}`,
        kind: 'escrow_in',
        label: `Escrow • ${vendor}`,
        amount,
        when: 'just now',
        orderId,
      };
      return {
        balance: s.balance - amount,
        inEscrow: s.inEscrow + amount,
        recent: [tx, ...s.recent],
      };
    });
    return result;
  },

  topUp: (amount, source = 'Paystack') =>
    set((s) => {
      const tx: WalletTx = {
        id: `t${Date.now()}`,
        kind: 'topup',
        label: `Wallet top-up • ${source}`,
        amount,
        when: 'just now',
      };
      return {
        balance: s.balance + amount,
        recent: [tx, ...s.recent],
      };
    }),

  releaseFromEscrow: ({ amount, orderId, vendor }) =>
    set((s) => {
      const tx: WalletTx = {
        id: `t${Date.now()}`,
        kind: 'release',
        label: `Released • ${vendor}`,
        amount,
        when: 'just now',
        orderId,
      };
      return {
        inEscrow: Math.max(0, s.inEscrow - amount),
        recent: [tx, ...s.recent],
      };
    }),

  withdraw: ({ amount, bank }) => {
    let result: { ok: true } | { ok: false; reason: 'insufficient' } = { ok: true };
    set((s) => {
      if (s.balance < amount) {
        result = { ok: false, reason: 'insufficient' };
        return s;
      }
      const tx: WalletTx = {
        id: `t${Date.now()}`,
        kind: 'refund', // reuse closest existing kind for the row icon
        label: `Withdrawal • ${bank}`,
        amount,
        when: 'just now',
      };
      return {
        balance: s.balance - amount,
        recent: [tx, ...s.recent],
      };
    });
    return result;
  },
}));

export const useWalletBalance = () => useWallet((s) => s.balance);
export const useWalletEscrow = () => useWallet((s) => s.inEscrow);
