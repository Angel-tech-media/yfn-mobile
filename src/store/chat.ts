import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  threadId: string;
  text: string;
  ts: number;
  mine: boolean;
};

type State = {
  /** threadId → messages (oldest first). */
  threads: Record<string, ChatMessage[]>;
  send: (threadId: string, text: string) => ChatMessage;
};

export const useChat = create<State>((set) => ({
  threads: {},
  send: (threadId, text) => {
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      threadId,
      text,
      ts: Date.now(),
      mine: true,
    };
    set((s) => ({
      threads: {
        ...s.threads,
        [threadId]: [...(s.threads[threadId] ?? []), msg],
      },
    }));
    return msg;
  },
}));

export const useThreadMessages = (threadId: string) =>
  useChat((s) => s.threads[threadId] ?? []);
