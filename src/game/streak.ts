import { shiftDay, type DayKey } from '../lib/date';
import type { DayRecord } from '../state/types';

export interface StreakInput {
  days: Record<DayKey, DayRecord>;
  repairedDays: DayKey[];
  pausedDays: DayKey[];
  today: DayKey;
}

export interface StreakInfo {
  current: number;
  activeToday: boolean;
  /** A single missed day that a repair hammer could fix, if any. */
  repairable?: DayKey;
  /** Length of the streak that would be restored by repairing. */
  repairRestores?: number;
}

function counts(day: DayKey, input: StreakInput, repaired: Set<DayKey>): boolean {
  return !!input.days[day]?.active || repaired.has(day);
}

function runLength(from: DayKey, input: StreakInput, repaired: Set<DayKey>, paused: Set<DayKey>, limit = 5000): number {
  let d = from;
  let n = 0;
  for (let i = 0; i < limit; i++) {
    if (counts(d, input, repaired)) n++;
    else if (!paused.has(d)) break;
    d = shiftDay(d, -1);
  }
  return n;
}

export function computeStreak(input: StreakInput): StreakInfo {
  const repaired = new Set(input.repairedDays);
  const paused = new Set(input.pausedDays);
  const activeToday = counts(input.today, input, repaired);
  const yesterday = shiftDay(input.today, -1);
  const current = activeToday
    ? runLength(input.today, input, repaired, paused)
    : runLength(yesterday, input, repaired, paused);

  // Find the first gap day behind the current run; offer a repair when it's a single day
  // and recent (yesterday or the day before), with an existing run behind it.
  let d = activeToday ? input.today : yesterday;
  let guard = 0;
  while ((counts(d, input, repaired) || paused.has(d)) && guard++ < 5000) d = shiftDay(d, -1);
  const gap = d;
  const beforeGap = shiftDay(gap, -1);
  const recent = gap === yesterday || gap === shiftDay(input.today, -2);
  if (recent && counts(beforeGap, input, repaired)) {
    const restored = current + 1 + runLength(beforeGap, input, repaired, paused);
    return { current, activeToday, repairable: gap, repairRestores: restored };
  }
  return { current, activeToday };
}
