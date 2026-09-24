import { create } from 'zustand';
import type { Notice } from '../game/engine';

export type UiNotice = Notice & { id: number };

interface UiStore {
  notices: UiNotice[];
  /** Big celebration modals are queued and shown one at a time. */
  celebrations: UiNotice[];
  pushNotices: (n: Notice[]) => void;
  dismiss: (id: number) => void;
  dismissCelebration: (id: number) => void;
}

let seq = 1;

export const useUi = create<UiStore>((set) => ({
  notices: [],
  celebrations: [],
  pushNotices: (list) =>
    set((s) => {
      const toasts: UiNotice[] = [];
      const cels: UiNotice[] = [];
      for (const n of list) {
        const withId = { ...n, id: seq++ } as UiNotice;
        if (n.kind === 'celebrate' || n.kind === 'reflect') cels.push(withId);
        else toasts.push(withId);
      }
      return { notices: [...s.notices, ...toasts].slice(-4), celebrations: [...s.celebrations, ...cels] };
    }),
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  dismissCelebration: (id) => set((s) => ({ celebrations: s.celebrations.filter((n) => n.id !== id) })),
}));
