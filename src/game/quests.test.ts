import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { ITEMS } from '../data/catalog';
import { mulberry32 } from '../lib/rng';
import type { GameState } from '../state/types';
import * as E from './engine';
import { dailyQuestsFor, SPECIAL_QUESTS, specialStatus, weeklyAreaDays } from './quests';
import { describeSchedule } from './schedule';
import { dyeRotation, rotation, travelOptions } from './shop';

const T0 = new Date(2026, 2, 10, 12, 0, 0).getTime();

function act<A extends unknown[]>(s: GameState, fn: (s: GameState, ctx: E.Ctx, ...a: A) => unknown, now: number, ...args: A) {
  const ctx = E.makeCtx(now, mulberry32(7));
  return produce(s, (d) => {
    E.sync(d as GameState, ctx);
    fn(d as GameState, ctx, ...args);
  });
}

function base(): GameState {
  return act(E.initialState(T0), E.hatch, T0, {
    userName: 'Max',
    birbName: 'Pip',
    pronouns: { subject: 'they', object: 'them', possessive: 'their' },
    eggColor: '#7fb8e6',
    trait: 'kind',
    wakeTime: '07:00',
    bedTime: '23:00',
    goals: [{ title: 'Water', emoji: '💧' }],
    areaOf: () => 'health',
  });
}

describe('quests', () => {
  it('picks three distinct daily quests, deterministic per day', () => {
    const s = base();
    const a = dailyQuestsFor('2026-03-10', s);
    expect(a).toHaveLength(3);
    expect(new Set(a.map((q) => q.id)).size).toBe(3);
    expect(dailyQuestsFor('2026-03-10', s).map((q) => q.id)).toEqual(a.map((q) => q.id));
  });

  it('only offers the upkeep quest when upkeep tasks exist', () => {
    const s = base();
    for (let d = 1; d <= 28; d++) {
      const day = `2026-03-${String(d).padStart(2, '0')}`;
      expect(dailyQuestsFor(day, s).some((q) => q.id === 'upkeep')).toBe(false);
    }
  });

  it('counts distinct days per area for weekly milestones and pays each tier once', () => {
    let s = base();
    const gid = s.goals[0].id;
    // Mon 2026-03-09 and Tue 03-10
    s = act(s, E.completeGoal, new Date(2026, 2, 9, 12).getTime(), gid);
    s = act(s, E.completeGoal, T0, gid);
    expect(weeklyAreaDays(s, '2026-03-10').health).toBe(2);
    const before = s.stones;
    s = act(s, E.claimWeekly, T0, 'health');
    expect(s.stones - before).toBe(20);
    s = act(s, E.claimWeekly, T0, 'health');
    expect(s.stones - before).toBe(20);
  });

  it('special quests ignore starter items', () => {
    const s = base();
    const decor = SPECIAL_QUESTS.find((q) => q.id === 'decor')!;
    expect(specialStatus(decor, s).value).toBe(0);
  });
});

describe('shop', () => {
  const ctx = { day: '2026-03-10', refreshes: 0, owned: {}, location: 'forest', month: 3, unlockedParts: [] as never[] };

  it('rotates 12 unowned items and changes on refresh', () => {
    const a = rotation('clothing', ctx);
    expect(a).toHaveLength(12);
    const b = rotation('clothing', { ...ctx, refreshes: 1 });
    expect(b.map((i) => i.id)).not.toEqual(a.map((i) => i.id));
    const owned = Object.fromEntries(a.map((i) => [i.id, true]));
    expect(rotation('clothing', { ...ctx, owned }).some((i) => owned[i.id])).toBe(false);
  });

  it('never sells the current month event items', () => {
    for (let r = 0; r < 20; r++) {
      expect(rotation('furniture', { ...ctx, refreshes: r }).some((i) => i.rarity === 'event' && i.eventMonth === 3)).toBe(false);
    }
  });

  it('only offers dyes for unlocked body parts', () => {
    const dyes = dyeRotation({ ...ctx, unlockedParts: ['beak', 'body'] });
    expect(dyes.length).toBeGreaterThan(0);
    expect(dyes.every((d) => d.slot === 'beak' || d.slot === 'body')).toBe(true);
  });

  it('travel includes the way home when away', () => {
    const opts = travelOptions('2026-03-10', 'paris');
    expect(opts[0].loc.id).toBe('forest');
    expect(opts.some((o) => o.loc.id === 'paris')).toBe(false);
  });

  it('every item has art and a sane price', () => {
    for (const it of ITEMS) {
      expect(it.price).toBeGreaterThanOrEqual(0);
      expect(it.art).toBeTruthy();
    }
  });
});

describe('schedule text', () => {
  it('describes schedules readably', () => {
    expect(describeSchedule({ type: 'interval', every: 3, unit: 'month' })).toBe('Every 3 months');
    expect(describeSchedule({ type: 'weekdays', days: [1, 2, 3, 4, 5] })).toBe('Weekdays');
    expect(describeSchedule({ type: 'monthly', dayOfMonth: 2 })).toBe('Monthly on the 2nd');
    expect(describeSchedule({ type: 'yearly', month: 10, day: 15 })).toBe('Every year on Oct 15');
  });
});
