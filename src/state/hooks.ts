import { useEffect, useMemo, useState } from 'react';
import { dayKey, isSleepTime, type DayKey } from '../lib/date';
import { isVisibleOn, upkeepStatus } from '../game/schedule';
import { stageFor } from '../game/constants';
import { currentStreak } from '../game/engine';
import type { DayRecord, Goal } from './types';
import { useGame } from './store';
import type { Sky } from '../art/furniture';

/** Current time, re-rendering every `ms`. */
export function useNow(ms = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function useToday(): DayKey {
  const start = useGame((s) => s.settings.dayStartHour);
  const now = useNow(60_000);
  return dayKey(now, start);
}

const EMPTY_DAY = (day: DayKey): DayRecord => ({
  day,
  energy: 0,
  stonesEarned: 0,
  goals: {},
  events: {},
  questsClaimed: [],
  shopRefreshes: {},
  active: false,
});

export function useDay(day: DayKey): DayRecord {
  const rec = useGame((s) => s.days[day]);
  return rec ?? EMPTY_DAY(day);
}

export function useVisibleGoals(day: DayKey): Goal[] {
  const goals = useGame((s) => s.goals);
  const days = useGame((s) => s.days);
  const weekStartsOn = useGame((s) => s.settings.weekStartsOn);
  return useMemo(() => {
    const ctx = { days, weekStartsOn };
    return goals.filter((g) => (g.kind === 'goal' || g.showOnHome) && isVisibleOn(g, day, ctx));
  }, [goals, days, weekStartsOn, day]);
}

export function useUpkeep(day: DayKey) {
  const goals = useGame((s) => s.goals);
  const days = useGame((s) => s.days);
  const weekStartsOn = useGame((s) => s.settings.weekStartsOn);
  return useMemo(() => {
    const ctx = { days, weekStartsOn };
    return goals
      .filter((g) => g.kind === 'upkeep' && g.status !== 'archived')
      .map((g) => ({ goal: g, status: upkeepStatus(g, day, ctx), doneToday: (days[day]?.goals[g.id]?.count ?? 0) >= g.timesPerDay }))
      .sort((a, b) => a.status.daysUntil - b.status.daysUntil);
  }, [goals, days, weekStartsOn, day]);
}

export function useStage() {
  const adventures = useGame((s) => s.birb.adventures);
  return stageFor(adventures);
}

export function useStreak() {
  const days = useGame((s) => s.days);
  const streak = useGame((s) => s.streak);
  const settings = useGame((s) => s.settings);
  const now = useNow(60_000);
  return useMemo(() => currentStreak({ days, streak, settings }, now), [days, streak, settings, now]);
}

export function useSky(): { sky: Sky; asleep: boolean } {
  const now = useNow(60_000);
  const bed = useGame((s) => s.settings.bedTime);
  const wake = useGame((s) => s.settings.wakeTime);
  const h = new Date(now).getHours();
  const asleep = isSleepTime(now, bed, wake);
  const sky: Sky = asleep || h >= 21 || h < 5 ? 'night' : h >= 18 ? 'sunset' : 'day';
  return { sky, asleep };
}

export function useLatestMood(day: DayKey) {
  const moods = useGame((s) => s.moods);
  return useMemo(() => {
    for (let i = moods.length - 1; i >= 0; i--) if (moods[i].day === day) return moods[i];
    return undefined;
  }, [moods, day]);
}

export function usePronouns() {
  return useGame((s) => s.birb.pronouns);
}
