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

  /** Top up the eWallet (mock — real impl hits Paystack virtual account webhook). */
  topUp: (amount: number, source?: string) => void;

  /** Vendor side: release funds from escrow after delivery confirmation. */
  releaseFromEscrow: (input: { amount: number; orderId: string; vendor: string }) => void;

  /** Withdraw from wallet to bank — debits balance, logs a `withdrawal` row. */
  withdraw: (input: { amount: number; bank: string }) =>
    | { ok: true }
    | { ok: false; reason: 'insufficient' };
};

export const useWallet = create<WalletState>((set) => ({
  balance: 125400,
  inEscrow: 32200,
  accountNumber: '8126045320',
  bankName: 'Vibe / Paystack',
  recent: [
    { id: 't1', kind: 'escrow_in', label: 'Escrow • Aisha Threads', amount: 18500, when: 'Today · 14:02', orderId: 'ord-1' },
    { id: 't2', kind: 'referral', label: 'Referral earn • @sarahsboutique repost', amount: 50, when: 'Today · 11:28' },
    { id: 't3', kind: 'release', label: 'Released • GadgetFix', amount: 9200, when: 'Yesterday', orderId: 'ord-2' },
    { id: 't4', kind: 'topup', label: 'Wallet top-up • Paystack', amount: 25000, when: '2 days ago' },
    { id: 't5', kind: 'referral', label: 'Referral earn • @tolathreads repost', amount: 50, when: '2 days ago' },
    { id: 't6', kind: 'release', label: 'Released • Tola Threads', amount: 14500, when: '3 days ago', orderId: 'ord-5' },
    { id: 't7', kind: 'refund', label: 'Refund • Zara Cakes', amount: 4500, when: '1 week ago', orderId: 'ord-3' },
    { id: 't8', kind: 'topup', label: 'Wallet top-up • Bank transfer', amount: 50000, when: '1 week ago' },
    { id: 't9', kind: 'release', label: 'Released • Beauty by Femi', amount: 18990, when: '2 weeks ago', orderId: 'ord-6' },
    { id: 't10', kind: 'escrow_in', label: 'Escrow • Naija Kitchen', amount: 35000, when: '2 weeks ago', orderId: 'ord-7' },
    { id: 't11', kind: 'referral', label: 'Referral earn • @aishathreads repost', amount: 50, when: '3 weeks ago' },
    { id: 't12', kind: 'release', label: 'Released • Mide Studios', amount: 65000, when: '3 weeks ago', orderId: 'ord-8' },
  ],

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
