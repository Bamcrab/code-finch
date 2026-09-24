import { del as idbDel, get as idbGet, keys as idbKeys, set as idbSet } from 'idb-keyval';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as E from '../game/engine';
import type { GameState } from './types';
import { useUi } from './ui';

const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet<string>(name)) ?? null,
  setItem: (name, value) => idbSet(name, value),
  removeItem: (name) => idbDel(name),
};

type EngineFn = (s: GameState, ctx: E.Ctx, ...args: never[]) => unknown;
type Tail<F> = F extends (s: GameState, ctx: E.Ctx, ...args: infer A) => unknown ? A : never;
type Ret<F> = F extends (...args: never[]) => infer R ? R : never;

const ACTIONS = {
  hatch: E.hatch,
  updateBirb: E.updateBirb,
  updateSettings: E.updateSettings,
  addGoal: E.addGoal,
  updateGoal: E.updateGoal,
  setGoalStatus: E.setGoalStatus,
  deleteGoal: E.deleteGoal,
  completeGoal: E.completeGoal,
  undoGoal: E.undoGoal,
  skipGoal: E.skipGoal,
  snoozeGoal: E.snoozeGoal,
  setLastDone: E.setLastDone,
  setGoalOfDay: E.setGoalOfDay,
  addArea: E.addArea,
  updateArea: E.updateArea,
  deleteArea: E.deleteArea,
  logMood: E.logMood,
  setCheckIn: E.setCheckIn,
  dismissFirstAid: E.dismissFirstAid,
  saveReflection: E.saveReflection,
  updateReflection: E.updateReflection,
  deleteReflection: E.deleteReflection,
  logActivity: E.logActivity,
  saveQuiz: E.saveQuiz,
  answerDiscovery: E.answerDiscovery,
  finishReturn: E.finishReturn,
  chooseStageColor: E.chooseStageColor,
  pat: E.pat,
  equip: E.equip,
  setColor: E.setColor,
  place: E.place,
  saveLook: E.saveLook,
  applyLook: E.applyLook,
  deleteLook: E.deleteLook,
  buy: E.buy,
  sell: E.sell,
  refreshShop: E.refreshShop,
  claimGift: E.claimGift,
  buyTicket: E.buyTicket,
  takeEgg: E.takeEgg,
  linkEgg: E.linkEgg,
  updateMicropet: E.updateMicropet,
  setActiveMicropet: E.setActiveMicropet,
  releaseMicropet: E.releaseMicropet,
  claimDaily: E.claimDaily,
  claimWeekly: E.claimWeekly,
  claimSpecial: E.claimSpecial,
  claimEventTier: E.claimEventTier,
  joinChallenge: E.joinChallenge,
  leaveChallenge: E.leaveChallenge,
  completeChallengeStep: E.completeChallengeStep,
  repairStreak: E.repairStreak,
  startPause: E.startPause,
  endPause: E.endPause,
} satisfies Record<string, EngineFn>;

type Actions = { [K in keyof typeof ACTIONS]: (...args: Tail<(typeof ACTIONS)[K]>) => Ret<(typeof ACTIONS)[K]> };

export interface GameStore extends GameState {
  actions: Actions & {
    tick: () => void;
    importData: (json: string) => boolean;
    exportData: () => string;
    resetAll: () => void;
  };
}

const DATA_KEYS = Object.keys(E.initialState()) as (keyof GameState)[];

export function snapshot(s: GameState): GameState {
  const out = {} as Record<string, unknown>;
  for (const k of DATA_KEYS) out[k] = s[k];
  return out as unknown as GameState;
}

// ---- automatic daily backups (kept on-device, last 7 days) ----

const BACKUP_PREFIX = 'finch-backup:';
const BACKUPS_KEPT = 7;
let backedUpDay: string | undefined;

async function autoBackup(state: GameState, day: string) {
  if (!state.onboarded || backedUpDay === day) return;
  backedUpDay = day;
  try {
    const existing = (await idbKeys()).filter((k): k is string => typeof k === 'string' && k.startsWith(BACKUP_PREFIX));
    const key = BACKUP_PREFIX + day;
    if (!existing.includes(key)) await idbSet(key, JSON.stringify(snapshot(state)));
    const all = [...new Set([...existing, key])].sort();
    for (const old of all.slice(0, Math.max(0, all.length - BACKUPS_KEPT))) await idbDel(old);
  } catch {
    // Backups are best-effort.
  }
}

export async function listAutoBackups(): Promise<string[]> {
  const ks = await idbKeys();
  return ks
    .filter((k): k is string => typeof k === 'string' && k.startsWith(BACKUP_PREFIX))
    .map((k) => k.slice(BACKUP_PREFIX.length))
    .sort()
    .reverse();
}

export async function readAutoBackup(day: string): Promise<string | undefined> {
  return idbGet<string>(BACKUP_PREFIX + day);
}

export const useGame = create<GameStore>()(
  persist(
    immer((set, get) => {
      const wrap = <K extends keyof typeof ACTIONS>(fn: (typeof ACTIONS)[K]) =>
        ((...args: unknown[]) => {
          if (!useGame.persist.hasHydrated()) return undefined;
          const ctx = E.makeCtx();
          let result: unknown;
          set((draft) => {
            const s = draft as unknown as GameState;
            E.sync(s, ctx);
            result = (fn as unknown as (s: GameState, c: E.Ctx, ...a: unknown[]) => unknown)(s, ctx, ...args);
          });
          if (ctx.notices.length) useUi.getState().pushNotices(ctx.notices);
          return result;
        }) as Actions[K];

      const actions = Object.fromEntries(
        Object.entries(ACTIONS).map(([k, fn]) => [k, wrap(fn as never)]),
      ) as unknown as Actions;

      return {
        ...E.initialState(),
        actions: {
          ...actions,
          tick: () => {
            // Any set() before hydration would be persisted over the saved game. Never do that.
            if (!useGame.persist.hasHydrated()) return;
            const ctx = E.makeCtx();
            const s = get();
            const today = E.todayOf(s, ctx.now);
            void autoBackup(s, today);
            const due = s.adventure.status === 'adventuring' && (s.adventure.endsAt ?? Infinity) <= ctx.now;
            if (!due && s.adventure.day === today && s.days[today]) return;
            set((draft) => E.sync(draft as unknown as GameState, ctx));
            if (ctx.notices.length) useUi.getState().pushNotices(ctx.notices);
          },
          exportData: () => JSON.stringify({ app: 'finch-clone', exportedAt: new Date().toISOString(), state: snapshot(get()) }),
          importData: (json: string) => {
            try {
              const parsed = JSON.parse(json);
              const raw = parsed?.state ?? parsed;
              if (!E.isGameState(raw)) return false;
              const next = E.normalize(raw);
              set((draft) => {
                Object.assign(draft, next);
              });
              return true;
            } catch {
              return false;
            }
          },
          resetAll: () => {
            set((draft) => {
              Object.assign(draft, E.initialState());
            });
          },
        },
      };
    }),
    {
      name: 'finch-state',
      version: E.STATE_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => snapshot(s),
      merge: (persisted, current) => {
        if (!E.isGameState(persisted)) return current;
        return { ...current, ...E.normalize(persisted as GameState) };
      },
    },
  ),
);

export const useActions = () => useGame((s) => s.actions);
export const gameActions = () => useGame.getState().actions;
