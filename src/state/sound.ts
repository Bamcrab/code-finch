import { create } from 'zustand';
import { SOUNDS, SoundMixer } from '../lib/soundscapes';
import { gameActions } from './store';

interface SoundStore {
  layers: Record<string, number>;
  master: number;
  startedAt?: number;
  endsAt?: number;
  rewarded: boolean;
  toggle: (id: string) => void;
  setVolume: (id: string, v: number) => void;
  setMaster: (v: number) => void;
  setTimer: (minutes: number | undefined) => void;
  stop: () => void;
  check: () => void;
}

let mixer: SoundMixer | null = null;
let timer: number | undefined;

/** Minutes of listening before a session earns its reward. */
const REWARD_AFTER_MIN = 5;

export const useSound = create<SoundStore>((set, get) => ({
  layers: {},
  master: 0.8,
  rewarded: false,
  toggle: (id) => {
    const { layers, master } = get();
    if (!mixer) mixer = new SoundMixer(master);
    if (layers[id] !== undefined) {
      mixer.remove(id);
      const next = { ...layers };
      delete next[id];
      set({ layers: next });
      if (!Object.keys(next).length) get().stop();
      return;
    }
    mixer.add(id, 0.7);
    set({ layers: { ...layers, [id]: 0.7 }, startedAt: get().startedAt ?? Date.now() });
    if (!timer) timer = window.setInterval(() => get().check(), 5000);
  },
  setVolume: (id, v) => {
    mixer?.setVolume(id, v);
    set({ layers: { ...get().layers, [id]: v } });
  },
  setMaster: (v) => {
    mixer?.setMaster(v);
    set({ master: v });
  },
  setTimer: (minutes) => set({ endsAt: minutes ? Date.now() + minutes * 60_000 : undefined }),
  stop: () => {
    get().check();
    mixer?.stopAll();
    mixer = null;
    if (timer) clearInterval(timer);
    timer = undefined;
    set({ layers: {}, startedAt: undefined, endsAt: undefined, rewarded: false });
  },
  check: () => {
    const s = get();
    if (!s.startedAt) return;
    const now = Date.now();
    if (!s.rewarded && now - s.startedAt >= REWARD_AFTER_MIN * 60_000) {
      const names = Object.keys(s.layers)
        .map((id) => SOUNDS.find((x) => x.id === id)?.name ?? id)
        .join(' + ');
      gameActions().logActivity({
        type: 'soundscape',
        refId: Object.keys(s.layers)[0],
        title: names || 'Soundscape',
        seconds: Math.round((now - s.startedAt) / 1000),
        energy: 5,
        stones: 3,
        events: ['soundscape'],
      });
      set({ rewarded: true });
    }
    if (s.endsAt && now >= s.endsAt) {
      set({ endsAt: undefined });
      get().stop();
    }
  },
}));
