import { addDays, addMonths, addWeeks, addYears, format, parseISO } from 'date-fns';
import {
  daysBetween,
  dayOfMonth,
  daysInMonth,
  shiftDay,
  weekKey,
  weekday,
  type DayKey,
} from '../lib/date';
import type { DayRecord, Goal, Schedule } from '../state/types';

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function describeSchedule(s: Schedule): string {
  switch (s.type) {
    case 'once':
      return s.date ? `Once, from ${format(parseISO(s.date), 'MMM d')}` : 'One time';
    case 'daily':
      return 'Every day';
    case 'weekdays': {
      const days = [...s.days].sort();
      if (days.length === 7) return 'Every day';
      if (days.join() === '1,2,3,4,5') return 'Weekdays';
      if (days.join() === '0,6') return 'Weekends';
      return days.map((d) => WEEKDAY_SHORT[d]).join(', ');
    }
    case 'timesPerWeek':
      return `${s.times}× a week`;
    case 'everyNDays':
      return s.n === 1 ? 'Every day' : `Every ${s.n} days`;
    case 'monthly':
      return `Monthly on the ${ordinal(s.dayOfMonth)}`;
    case 'interval': {
      if (s.every === 1) return `Every ${s.unit}`;
      return `Every ${s.every} ${s.unit}s`;
    }
    case 'yearly':
      return `Every year on ${MONTHS[s.month - 1]} ${s.day}`;
  }
}

function addUnit(day: DayKey, every: number, unit: 'day' | 'week' | 'month' | 'year'): DayKey {
  const d = parseISO(day);
  const out =
    unit === 'day'
      ? addDays(d, every)
      : unit === 'week'
        ? addWeeks(d, every)
        : unit === 'month'
          ? addMonths(d, every)
          : addYears(d, every);
  return format(out, 'yyyy-MM-dd');
}

function yearlyTarget(year: number, month: number, day: number): DayKey {
  const last = new Date(year, month, 0).getDate();
  return format(new Date(year, month - 1, Math.min(day, last)), 'yyyy-MM-dd');
}

/** Approximate cycle length in days, used for freshness meters. */
export function cycleDays(s: Schedule): number | undefined {
  switch (s.type) {
    case 'daily':
      return 1;
    case 'weekdays':
      return s.days.length ? 7 / s.days.length : undefined;
    case 'timesPerWeek':
      return 7 / s.times;
    case 'everyNDays':
      return s.n;
    case 'monthly':
      return 30;
    case 'interval':
      return s.unit === 'day' ? s.every : s.unit === 'week' ? s.every * 7 : s.unit === 'month' ? s.every * 30.4 : s.every * 365;
    case 'yearly':
      return 365;
    case 'once':
      return undefined;
  }
}

/**
 * The next day a goal becomes due, for schedules that depend on when it was last done.
 * Returns undefined for calendar-driven schedules.
 */
export function nextDueDay(goal: Goal, today: DayKey): DayKey | undefined {
  const s = goal.schedule;
  if (s.type === 'interval') {
    return goal.lastDoneDay ? addUnit(goal.lastDoneDay, s.every, s.unit) : goal.createdDay;
  }
  if (s.type === 'yearly') {
    const year = Number(today.slice(0, 4));
    const thisYear = yearlyTarget(year, s.month, s.day);
    if (goal.lastDoneDay && goal.lastDoneDay >= thisYear) return yearlyTarget(year + 1, s.month, s.day);
    // Not done since this year's date: due from it (or from last year's, if that was missed too).
    const lastYear = yearlyTarget(year - 1, s.month, s.day);
    if (thisYear > today && (!goal.lastDoneDay || goal.lastDoneDay < lastYear) && goal.createdDay <= lastYear) {
      return lastYear;
    }
    return thisYear;
  }
  if (s.type === 'once') return s.date ?? goal.createdDay;
  return undefined;
}

export interface DueContext {
  /** Day records, used to count completions this week for flexible goals. */
  days: Record<DayKey, DayRecord>;
  weekStartsOn: 0 | 1;
}

export function completionsThisWeek(goal: Goal, day: DayKey, ctx: DueContext, includeToday = true): number {
  const start = weekKey(day, ctx.weekStartsOn);
  const n = daysBetween(start, day);
  let total = 0;
  for (let i = 0; i <= n; i++) {
    const d = shiftDay(start, i);
    if (!includeToday && d === day) continue;
    const rec = ctx.days[d]?.goals[goal.id];
    if (rec && rec.count >= goal.timesPerDay) total++;
  }
  return total;
}

/** Is the goal scheduled for `day` (ignoring pause/snooze/status)? */
export function isScheduled(goal: Goal, day: DayKey, ctx: DueContext): boolean {
  const s = goal.schedule;
  switch (s.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return s.days.includes(weekday(day));
    case 'timesPerWeek':
      return completionsThisWeek(goal, day, ctx, false) < s.times;
    case 'everyNDays': {
      const diff = daysBetween(s.anchor, day);
      return diff >= 0 && diff % Math.max(1, s.n) === 0;
    }
    case 'monthly': {
      const dom = dayOfMonth(day);
      const dim = daysInMonth(day);
      return dom === s.dayOfMonth || (s.dayOfMonth > dim && dom === dim);
    }
    case 'interval':
    case 'yearly':
    case 'once': {
      if (s.type === 'once' && goal.totalDone > 0 && goal.lastDoneDay !== day) return false;
      const due = nextDueDay(goal, day);
      return !!due && day >= due;
    }
  }
}

/** Should this goal appear on the day's list? */
export function isVisibleOn(goal: Goal, day: DayKey, ctx: DueContext): boolean {
  if (goal.status !== 'active') return false;
  const rec = ctx.days[day]?.goals[goal.id];
  if (rec && (rec.count > 0 || rec.skipped)) return true;
  if (goal.snoozedUntil && goal.snoozedUntil > day) return false;
  if (goal.createdDay > day) return false;
  return isScheduled(goal, day, ctx);
}

export interface UpkeepStatus {
  /** Days until due; negative when overdue. Undefined when never done and never scheduled. */
  daysUntil: number;
  dueDay?: DayKey;
  /** 1 = just done, 0 = due/overdue. */
  freshness: number;
  label: string;
  tone: 'fresh' | 'soon' | 'due' | 'overdue';
}

export function upkeepStatus(goal: Goal, today: DayKey, ctx: DueContext): UpkeepStatus {
  const s = goal.schedule;
  let dueDay = nextDueDay(goal, today);
  if (!dueDay) {
    // Calendar schedule: scan ahead for the next scheduled day.
    for (let i = 0; i < 400; i++) {
      const d = shiftDay(today, i);
      if (isScheduled(goal, d, ctx)) {
        dueDay = d;
        break;
      }
    }
  }
  if (!dueDay) return { daysUntil: 999, freshness: 1, label: 'Not scheduled', tone: 'fresh' };
  const daysUntil = daysBetween(today, dueDay);
  const cycle = cycleDays(s) ?? 30;
  let freshness: number;
  if (goal.lastDoneDay && s.type !== 'once') {
    freshness = Math.max(0, Math.min(1, 1 - daysBetween(goal.lastDoneDay, today) / Math.max(1, cycle)));
  } else {
    freshness = daysUntil > 0 ? Math.min(1, daysUntil / Math.max(1, cycle)) : 0;
  }
  if (daysUntil < 0) {
    freshness = 0;
    return { daysUntil, dueDay, freshness, label: `Overdue ${-daysUntil}d`, tone: 'overdue' };
  }
  if (daysUntil === 0) return { daysUntil, dueDay, freshness: 0, label: 'Due today', tone: 'due' };
  const soonWindow = Math.max(2, Math.round(cycle * 0.15));
  const label = daysUntil === 1 ? 'Due tomorrow' : daysUntil < 60 ? `Due in ${daysUntil}d` : `Due ${format(parseISO(dueDay), 'MMM d')}`;
  return { daysUntil, dueDay, freshness, label, tone: daysUntil <= soonWindow ? 'soon' : 'fresh' };
}
