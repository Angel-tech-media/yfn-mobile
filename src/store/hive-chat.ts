import { create } from 'zustand';

export type HiveMessage = {
  id: string;
  /** Slug path of the community, e.g. "books/romance/christian" */
  community: string;
  author: string;
  initial: string;
  text: string;
  time: string;
  mine?: boolean;
  bot?: boolean;
};

type State = {
  /** Map of communitySlug → messages (oldest first). */
  messages: Record<string, HiveMessage[]>;
  send: (community: string, text: string) => HiveMessage;
};

export const useHiveChat = create<State>((set, get) => ({
  messages: {},
  send: (community, text) => {
    const msg: HiveMessage = {
      id: `m-${Date.now()}`,
      community,
      author: 'You',
      initial: 'Y',
      text,
      time: 'now',
      mine: true,
    };
    set((s) => ({
      messages: {
        ...s.messages,
        [community]: [...(s.messages[community] ?? []), msg],
      },
    }));
    return msg;
  },
}));

const EMPTY: HiveMessage[] = [];
export const useCommunityMessages = (community: string) =>
  useHiveChat((s) => s.messages[community] ?? EMPTY);
