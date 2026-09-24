import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { dayKey, shiftDay } from '../lib/date';
import { mulberry32 } from '../lib/rng';
import type { GameState, Goal } from '../state/types';
import * as E from './engine';
import { isVisibleOn, upkeepStatus } from './schedule';
import { computeStreak } from './streak';

const HOUR = 3_600_000;
// 2026-03-10 12:00 local
const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();

function run<A extends unknown[], R>(
  s: GameState,
  fn: (s: GameState, ctx: E.Ctx, ...a: A) => R,
  now: number,
  ...args: A
): { s: GameState; ctx: E.Ctx; r: R } {
  const ctx = E.makeCtx(now, mulberry32(42));
  let r!: R;
  const next = produce(s, (d) => {
    E.sync(d as GameState, ctx);
    r = fn(d as GameState, ctx, ...args);
  });
  return { s: next, ctx, r };
}

function fresh(): GameState {
  let s = E.initialState(T0);
  s = run(s, E.hatch, T0, {
    userName: 'Max',
    birbName: 'Pip',
    pronouns: { subject: 'they', object: 'them', possessive: 'their' },
    eggColor: '#7fb8e6',
    trait: 'curious',
    wakeTime: '07:00',
    bedTime: '23:00',
    goals: [],
    areaOf: () => undefined,
  }).s;
  return s;
}

function withGoal(s: GameState, input: E.GoalInput, now = T0): { s: GameState; id: string } {
  const res = run(s, E.addGoal, now, input);
  return { s: res.s, id: res.r };
}

describe('goals and energy', () => {
  it('awards 5 energy and 3 stones per goal and starts an adventure at full energy', () => {
    let s = fresh();
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = withGoal(s, { title: `g${i}` });
      s = r.s;
      ids.push(r.id);
    }
    const stones0 = s.stones;
    s = run(s, E.completeGoal, T0, ids[0]).s;
    s = run(s, E.completeGoal, T0, ids[1]).s;
    const today = dayKey(T0, 4);
    expect(s.days[today].energy).toBe(10);
    expect(s.adventure.status).toBe('charging');
    const res = run(s, E.completeGoal, T0 + 1000, ids[2]);
    s = res.s;
    expect(s.days[today].energy).toBe(15); // baby needs 15
    expect(s.adventure.status).toBe('adventuring');
    expect(s.adventure.endsAt! - s.adventure.startedAt!).toBe(8 * HOUR);
    expect(s.stones).toBeGreaterThan(stones0 + 9); // goal stones + adventure bonus
    expect(res.ctx.notices.some((n) => n.kind === 'celebrate')).toBe(true);
  });

  it('extra energy shortens the adventure by 2 minutes per point', () => {
    let s = fresh();
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = withGoal(s, { title: `g${i}` });
      s = r.s;
      ids.push(r.id);
    }
    for (let i = 0; i < 3; i++) s = run(s, E.completeGoal, T0, ids[i]).s;
    const endsBefore = s.adventure.endsAt!;
    s = run(s, E.completeGoal, T0, ids[3]).s;
    expect(endsBefore - s.adventure.endsAt!).toBe(10 * 60_000);
  });

  it('completes the adventure after its duration and queues a discovery', () => {
    let s = fresh();
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = withGoal(s, { title: `g${i}` });
      s = r.s;
      ids.push(r.id);
    }
    for (const id of ids) s = run(s, E.completeGoal, T0, id).s;
    s = run(s, () => undefined, T0 + 8 * HOUR + 1000).s;
    expect(s.adventure.status).toBe('home');
    expect(s.birb.adventures).toBe(1);
    expect(s.pendingReturns).toHaveLength(1);
    expect(s.discoveries).toHaveLength(1);
    expect(s.friendship.points).toBe(1);
  });

  it('an adventure still running at rollover finishes and the new day starts charging', () => {
    let s = fresh();
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = withGoal(s, { title: `g${i}` });
      s = r.s;
      ids.push(r.id);
    }
    const late = new Date(2026, 2, 10, 23, 0).getTime();
    for (const id of ids) s = run(s, E.completeGoal, late, id).s;
    expect(s.adventure.status).toBe('adventuring');
    const nextMorning = new Date(2026, 2, 11, 5, 0).getTime();
    s = run(s, () => undefined, nextMorning).s;
    expect(s.adventure.status).toBe('charging');
    expect(s.adventure.day).toBe('2026-03-11');
    expect(s.pendingReturns).toHaveLength(1);
  });

  it('low mood boosts goal rewards to 7 energy / 4 stones', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'water' });
    s = run(r.s, E.logMood, T0, { mood: 2 }).s;
    s = run(s, E.completeGoal, T0, r.id).s;
    const today = dayKey(T0, 4);
    expect(s.days[today].energy).toBe(7);
    expect(s.days[today].goals[r.id].stones).toBe(4);
  });

  it('effort multiplies rewards', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'gutters', effort: 3 });
    s = run(r.s, E.completeGoal, T0, r.id).s;
    expect(s.days[dayKey(T0, 4)].energy).toBe(15);
  });

  it('undo takes back energy and stones', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'a' });
    s = r.s;
    const stones0 = s.stones;
    s = run(s, E.completeGoal, T0, r.id).s;
    s = run(s, E.undoGoal, T0, r.id).s;
    expect(s.stones).toBe(stones0);
    expect(s.days[dayKey(T0, 4)].energy).toBe(0);
    expect(s.goals[0].totalDone).toBe(0);
    expect(s.goals[0].lastDoneDay).toBeUndefined();
  });

  it('multi-count goals only count as done after all taps', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'water', timesPerDay: 3 });
    s = r.s;
    s = run(s, E.completeGoal, T0, r.id).s;
    s = run(s, E.completeGoal, T0, r.id).s;
    expect(s.goals[0].totalDone).toBe(0);
    s = run(s, E.completeGoal, T0, r.id).s;
    expect(s.goals[0].totalDone).toBe(1);
    s = run(s, E.completeGoal, T0, r.id).s; // over-tapping is ignored
    expect(s.days[dayKey(T0, 4)].goals[r.id].count).toBe(3);
  });

  it('goal of the day pays a bonus once', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'a' });
    s = run(r.s, E.setGoalOfDay, T0, r.id).s;
    const before = s.stones;
    s = run(s, E.completeGoal, T0, r.id).s;
    expect(s.stones - before).toBeGreaterThanOrEqual(13);
    expect(s.days[dayKey(T0, 4)].goalOfDayPaid).toBe(true);
  });
});

describe('scheduling', () => {
  const ctxDays = (s: GameState) => ({ days: s.days, weekStartsOn: 1 as const });

  it('interval upkeep is due after the interval passes', () => {
    let s = fresh();
    const r = withGoal(s, {
      title: 'Filter',
      kind: 'upkeep',
      schedule: { type: 'interval', every: 3, unit: 'month' },
      lastDoneDay: '2026-01-01',
    });
    s = r.s;
    const g = s.goals.find((x) => x.id === r.id)!;
    expect(isVisibleOn(g, '2026-03-10', ctxDays(s))).toBe(false);
    expect(isVisibleOn(g, '2026-04-01', ctxDays(s))).toBe(true);
    const st = upkeepStatus(g, '2026-04-11', ctxDays(s));
    expect(st.tone).toBe('overdue');
    expect(st.daysUntil).toBe(-10);
  });

  it('completing interval upkeep resets it', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'Sheets', kind: 'upkeep', schedule: { type: 'interval', every: 1, unit: 'week' } });
    s = run(r.s, E.completeGoal, T0, r.id).s;
    const g = s.goals[0];
    const today = dayKey(T0, 4);
    expect(g.lastDoneDay).toBe(today);
    expect(isVisibleOn(g, shiftDay(today, 1), ctxDays(s))).toBe(false);
    expect(isVisibleOn(g, shiftDay(today, 7), ctxDays(s))).toBe(true);
  });

  it('weekday goals only show on their days', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'Gym', schedule: { type: 'weekdays', days: [1, 3] } });
    s = r.s;
    const g = s.goals[0];
    expect(isVisibleOn(g, '2026-03-16', ctxDays(s))).toBe(true); // Monday
    expect(isVisibleOn(g, '2026-03-17', ctxDays(s))).toBe(false);
  });

  it('times-per-week goals disappear once the quota is met', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'Run', schedule: { type: 'timesPerWeek', times: 1 } });
    s = run(r.s, E.completeGoal, T0, r.id).s;
    const g = s.goals[0];
    const today = dayKey(T0, 4);
    expect(isVisibleOn(g, today, ctxDays(s))).toBe(true); // still shown (done today)
    expect(isVisibleOn(g, shiftDay(today, 1), ctxDays(s))).toBe(false);
  });

  it('yearly tasks come due on their date', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'Faucets', kind: 'upkeep', schedule: { type: 'yearly', month: 10, day: 15 } });
    s = r.s;
    const g = s.goals[0];
    expect(isVisibleOn(g, '2026-10-14', ctxDays(s))).toBe(false);
    expect(isVisibleOn(g, '2026-10-15', ctxDays(s))).toBe(true);
    expect(upkeepStatus(g, '2026-03-10', ctxDays(s)).dueDay).toBe('2026-10-15');
  });

  it('snoozed goals hide until the snooze day', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'x' });
    s = run(r.s, E.snoozeGoal, T0, r.id, '2026-03-12').s;
    expect(isVisibleOn(s.goals[0], '2026-03-11', ctxDays(s))).toBe(false);
    expect(isVisibleOn(s.goals[0], '2026-03-12', ctxDays(s))).toBe(true);
  });
});

describe('streaks', () => {
  it('counts consecutive active days and offers a repair for a single gap', () => {
    const days: GameState['days'] = {};
    const mk = (d: string) => ({ day: d, energy: 0, stonesEarned: 0, goals: {}, events: {}, questsClaimed: [], shopRefreshes: {}, active: true });
    for (const d of ['2026-03-05', '2026-03-06', '2026-03-07', '2026-03-09']) days[d] = mk(d);
    const info = computeStreak({ days, repairedDays: [], pausedDays: [], today: '2026-03-09' });
    expect(info.current).toBe(1);
    expect(info.repairable).toBe('2026-03-08');
    expect(info.repairRestores).toBe(5);
    const fixed = computeStreak({ days, repairedDays: ['2026-03-08'], pausedDays: [], today: '2026-03-09' });
    expect(fixed.current).toBe(5);
  });

  it('paused days bridge without counting', () => {
    const days: GameState['days'] = {};
    const mk = (d: string) => ({ day: d, energy: 0, stonesEarned: 0, goals: {}, events: {}, questsClaimed: [], shopRefreshes: {}, active: true });
    for (const d of ['2026-03-01', '2026-03-02', '2026-03-06']) days[d] = mk(d);
    const info = computeStreak({
      days,
      repairedDays: [],
      pausedDays: ['2026-03-03', '2026-03-04', '2026-03-05'],
      today: '2026-03-06',
    });
    expect(info.current).toBe(3);
  });
});

describe('economy', () => {
  it('buys and sells items at half price', () => {
    let s = fresh();
    s = { ...s, stones: 1000 };
    s = run(s, E.buy, T0, 'beanie:red').s;
    expect(s.inventory['beanie:red']).toBeTruthy();
    expect(s.stones).toBe(850);
    s = run(s, E.equip, T0, 'head', 'beanie:red').s;
    s = run(s, E.sell, T0, 'beanie:red').s;
    expect(s.stones).toBe(925);
    expect(s.birb.outfit.head).toBeUndefined();
  });

  it('first shop refresh is free, then escalates', () => {
    let s = fresh();
    s = { ...s, stones: 100 };
    s = run(s, E.refreshShop, T0, 'outfits').s;
    expect(s.stones).toBe(100);
    s = run(s, E.refreshShop, T0, 'outfits').s;
    expect(s.stones).toBe(90);
    s = run(s, E.refreshShop, T0, 'outfits').s;
    expect(s.stones).toBe(55);
  });

  it('hatches a micropet after 7 linked completions', () => {
    let s = fresh();
    const r = withGoal(s, { title: 'Walk' });
    s = run(r.s, E.takeEgg, T0).s;
    s = run(s, E.linkEgg, T0, r.id).s;
    for (let i = 0; i < 7; i++) {
      const t = T0 + i * 24 * HOUR;
      s = run(s, E.completeGoal, t, r.id).s;
    }
    expect(s.egg).toBeNull();
    expect(s.micropets).toHaveLength(1);
    expect(s.birb.activeMicropet).toBe(s.micropets[0].id);
  });

  it('challenges allow one step per day and award a badge at the end', () => {
    let s = fresh();
    s = run(s, E.joinChallenge, T0, 'spring-clean').s;
    expect(run(s, E.completeChallengeStep, T0, 'spring-clean', 0).r).toBe(true);
    s = run(s, E.completeChallengeStep, T0, 'spring-clean', 0).s;
    expect(run(s, E.completeChallengeStep, T0, 'spring-clean', 1).r).toBe(false);
    for (let i = 1; i < 14; i++) s = run(s, E.completeChallengeStep, T0 + i * 24 * HOUR, 'spring-clean', i).s;
    expect(s.inventory['award-spring-clean']).toBeTruthy();
    expect(s.challenges[0].finishedDay).toBeTruthy();
  });
});

describe('types sanity', () => {
  it('goal defaults', () => {
    const s = withGoal(fresh(), { title: '  Tidy  ' }).s;
    const g: Goal = s.goals[0];
    expect(g.title).toBe('Tidy');
    expect(g.timesPerDay).toBe(1);
    expect(g.status).toBe('active');
  });
});
