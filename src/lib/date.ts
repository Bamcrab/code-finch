import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';

/** A "birb day" key, `YYYY-MM-DD`. Days roll over at `dayStartHour`, not midnight. */
export type DayKey = string;

const HOUR = 3_600_000;

export function dayKey(ts: number, dayStartHour = 4): DayKey {
  return format(new Date(ts - dayStartHour * HOUR), 'yyyy-MM-dd');
}

export function parseDay(day: DayKey): Date {
  return parseISO(day);
}

export function shiftDay(day: DayKey, delta: number): DayKey {
  return format(addDays(parseISO(day), delta), 'yyyy-MM-dd');
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: DayKey, b: DayKey): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

export function weekday(day: DayKey): number {
  return parseISO(day).getDay();
}

export function weekKey(day: DayKey, weekStartsOn: 0 | 1 = 1): DayKey {
  return format(startOfWeek(parseISO(day), { weekStartsOn }), 'yyyy-MM-dd');
}

export function monthKey(day: DayKey): string {
  return day.slice(0, 7);
}

export function dayOfMonth(day: DayKey): number {
  return Number(day.slice(8, 10));
}

export function daysInMonth(day: DayKey): number {
  const d = parseISO(day);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function formatDay(day: DayKey, pattern = 'EEE, MMM d'): string {
  return format(parseISO(day), pattern);
}

export function dayRange(from: DayKey, to: DayKey): DayKey[] {
  const out: DayKey[] = [];
  const n = daysBetween(from, to);
  for (let i = 0; i <= n; i++) out.push(shiftDay(from, i));
  return out;
}

/** "HH:MM" → minutes after midnight. */
export function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesNow(ts: number): number {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
}

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export function dayPart(ts: number): DayPart {
  const h = new Date(ts).getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

/** True when the clock time is inside the sleep window [bed, wake). Handles windows crossing midnight. */
export function isSleepTime(ts: number, bedTime: string, wakeTime: string): boolean {
  const now = minutesNow(ts);
  const bed = hmToMinutes(bedTime);
  const wake = hmToMinutes(wakeTime);
  if (bed === wake) return false;
  return bed > wake ? now >= bed || now < wake : now >= bed && now < wake;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function relativeDays(n: number): string {
  if (n === 0) return 'today';
  if (n === 1) return 'yesterday';
  if (n === -1) return 'tomorrow';
  if (n < 0) return `in ${-n} days`;
  if (n < 14) return `${n} days ago`;
  if (n < 60) return `${Math.round(n / 7)} weeks ago`;
  if (n < 730) return `${Math.round(n / 30)} months ago`;
  return `${Math.round(n / 365)} years ago`;
}
