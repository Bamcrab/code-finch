import { ITEM_MAP } from '../data/catalog';
import { EVENT_TIERS } from '../data/events';
import { dayRange, monthKey, shiftDay, weekKey, type DayKey } from '../lib/date';
import { seeded, shuffle } from '../lib/rng';
import type { GameState, Goal } from '../state/types';
import { DAILY_QUEST_COUNT, FRIENDSHIP_LEVELS, STAGES, WEEKLY_TIERS } from './constants';

export interface DailyQuestDef {
  id: string;
  title: string;
  emoji: string;
  event: string;
  target: number;
  /** Route that helps complete it. */
  to?: string;
  weight?: number;
  requires?: (s: GameState) => boolean;
}

export const DAILY_QUESTS: DailyQuestDef[] = [
  { id: 'goal1', title: 'Complete a goal', emoji: '✅', event: 'goal', target: 1, to: '/', weight: 3 },
  { id: 'goal3', title: 'Complete 3 goals', emoji: '🎯', event: 'goal', target: 3, to: '/', weight: 2 },
  {
    id: 'upkeep',
    title: 'Finish a home upkeep task',
    emoji: '🧰',
    event: 'upkeep',
    target: 1,
    to: '/upkeep',
    weight: 2,
    requires: (s) => s.goals.some((g) => g.kind === 'upkeep' && g.status === 'active'),
  },
  { id: 'outfit', title: 'Change {birb}\'s outfit', emoji: '👒', event: 'outfit', target: 1, to: '/birb/wardrobe' },
  { id: 'interior', title: 'Change one interior item', emoji: '🛋️', event: 'interior', target: 1, to: '/birb/room' },
  { id: 'breathe', title: 'Do a breathing exercise', emoji: '🌬️', event: 'breathe', target: 1, to: '/care/breathe' },
  { id: 'reflect', title: 'Write a reflection', emoji: '📝', event: 'reflection', target: 1, to: '/care/reflect' },
  { id: 'gratitude', title: 'Practice gratitude', emoji: '🙏', event: 'gratitude', target: 1, to: '/care/reflect/gratitude-jar' },
  { id: 'mood', title: 'Log your mood', emoji: '😊', event: 'mood', target: 1, to: '/mood' },
  { id: 'emotion', title: 'Name your emotion', emoji: '🫶', event: 'emotion', target: 1, to: '/care/emotion' },
  { id: 'affirm', title: 'Repeat an affirmation 3 times', emoji: '💬', event: 'affirmation', target: 1, to: '/care/affirmation' },
  { id: 'adventure', title: 'Send {birb} on an adventure', emoji: '🎒', event: 'adventure', target: 1, to: '/', weight: 2 },
  { id: 'pet', title: 'Pet {birb}', emoji: '🤲', event: 'pet', target: 1, to: '/' },
  { id: 'movement', title: 'Do a movement exercise', emoji: '🤸', event: 'movement', target: 1, to: '/care/move' },
  { id: 'sound', title: 'Listen to a soundscape', emoji: '🎧', event: 'soundscape', target: 1, to: '/care/sounds' },
  { id: 'kindness', title: 'Do an act of kindness', emoji: '💌', event: 'kindness', target: 1, to: '/care/kindness' },
  { id: 'timer', title: 'Use a focus timer', emoji: '⏱️', event: 'timer', target: 1, to: '/care/timer' },
  { id: 'ground', title: 'Try a grounding exercise', emoji: '🪨', event: 'grounding', target: 1, to: '/care/grounding' },
];

export function dailyQuestsFor(day: DayKey, s: GameState): DailyQuestDef[] {
  const rand = seeded(`quests:${day}`);
  const eligible = DAILY_QUESTS.filter((q) => !q.requires || q.requires(s));
  // Weighted shuffle: repeat entries by weight, then take unique ids in order.
  const bag = eligible.flatMap((q) => Array.from({ length: q.weight ?? 1 }, () => q));
  const out: DailyQuestDef[] = [];
  for (const q of shuffle(rand, bag)) {
    if (out.some((o) => o.id === q.id || (o.event === q.event && o.event === 'goal'))) continue;
    out.push(q);
    if (out.length === DAILY_QUEST_COUNT) break;
  }
  return out;
}

export function questProgress(q: DailyQuestDef, s: GameState, day: DayKey): number {
  return Math.min(q.target, s.days[day]?.events[q.event] ?? 0);
}

// ---------- Weekly milestones ----------

export function goalArea(g: Goal): string | undefined {
  return g.areaId ?? (g.kind === 'upkeep' ? 'home' : undefined);
}

/** Distinct days this week with at least one completion per area. */
export function weeklyAreaDays(s: GameState, today: DayKey): Record<string, number> {
  const start = weekKey(today, s.settings.weekStartsOn);
  const areaOf = new Map(s.goals.map((g) => [g.id, goalArea(g)]));
  const out: Record<string, number> = {};
  for (const d of dayRange(start, today)) {
    const rec = s.days[d];
    if (!rec) continue;
    const areas = new Set<string>();
    for (const [gid, gd] of Object.entries(rec.goals)) {
      if (gd.count <= 0) continue;
      const a = areaOf.get(gid);
      if (a) areas.add(a);
    }
    for (const a of areas) out[a] = (out[a] ?? 0) + 1;
  }
  return out;
}

export function weeklyClaimable(s: GameState, today: DayKey, areaId: string): number {
  const wk = weekKey(today, s.settings.weekStartsOn);
  const claimed = s.weeklyClaims[wk]?.[areaId] ?? 0;
  const days = weeklyAreaDays(s, today)[areaId] ?? 0;
  let tiers = 0;
  for (const t of WEEKLY_TIERS) if (days >= t.days) tiers++;
  return Math.max(0, tiers - claimed);
}

// ---------- Special quests ----------

export interface SpecialQuestDef {
  id: string;
  emoji: string;
  tiers: number[];
  label: (target: number) => string;
  value: (s: GameState) => number;
}

const COLLECT = [1, 5, 10, 20, 50, 75, 100, 150, 200, 300, 400, 500];

export const SPECIAL_QUESTS: SpecialQuestDef[] = [
  {
    id: 'growth',
    emoji: '🐣',
    tiers: STAGES.slice(1).map((s) => s.startsAt),
    label: (t) => `Grow into ${/^[aeiou]/i.test(STAGES.find((s) => s.startsAt === t)?.label ?? '') ? 'an' : 'a'} ${STAGES.find((s) => s.startsAt === t)?.label ?? 'adult'} (${t} adventures)`,
    value: (s) => s.birb.adventures,
  },
  {
    id: 'friendship',
    emoji: '💞',
    tiers: FRIENDSHIP_LEVELS.map((l) => l.points),
    label: (t) => `Become ${FRIENDSHIP_LEVELS.find((l) => l.points === t)?.name ?? 'friends'} (${plural(t, 'friendship point')})`,
    value: (s) => s.friendship.points,
  },
  {
    id: 'goals',
    emoji: '✅',
    tiers: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    label: (t) => `Complete ${plural(t, 'goal')}`,
    value: (s) => s.goals.reduce((n, g) => n + g.totalDone, 0),
  },
  {
    id: 'upkeep',
    emoji: '🏠',
    tiers: [1, 5, 10, 25, 50, 100, 200, 400, 800],
    label: (t) => `Finish ${plural(t, 'home upkeep task')}`,
    value: (s) => s.goals.filter((g) => g.kind === 'upkeep').reduce((n, g) => n + g.totalDone, 0),
  },
  {
    id: 'reflections',
    emoji: '📝',
    tiers: [1, 5, 10, 25, 50, 100, 200, 365],
    label: (t) => `Write ${plural(t, 'reflection')}`,
    value: (s) => s.reflections.length,
  },
  {
    id: 'clothing',
    emoji: '👕',
    tiers: COLLECT,
    label: (t) => `Collect ${t} piece${t === 1 ? '' : 's'} of clothing`,
    value: (s) => Object.entries(s.inventory).filter(([id, v]) => v.source !== 'starter' && isClothingId(id)).length,
  },
  {
    id: 'decor',
    emoji: '🛋️',
    tiers: COLLECT,
    label: (t) => `Collect ${plural(t, 'decoration')}`,
    value: (s) => Object.entries(s.inventory).filter(([id, v]) => v.source !== 'starter' && isFurnitureId(id)).length,
  },
  {
    id: 'micropets',
    emoji: '🐾',
    tiers: [1, 3, 5, 8, 11, 15, 20, 25],
    label: (t) => `Meet ${plural(t, 'micropet')}`,
    value: (s) => s.micropets.length,
  },
  {
    id: 'locations',
    emoji: '🗺️',
    tiers: [2, 3, 5, 7, 10, 13, 16, 20, 23],
    label: (t) => `Visit ${plural(t, 'location')}`,
    value: (s) => Object.keys(s.travel.visited).length,
  },
  {
    id: 'discoveries',
    emoji: '🔎',
    tiers: [5, 10, 25, 50, 100, 200, 365],
    label: (t) => `Make ${t} discover${t === 1 ? 'y' : 'ies'}`,
    value: (s) => s.discoveries.length,
  },
];

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function isClothingId(id: string) {
  return ITEM_MAP[id]?.kind === 'clothing';
}
function isFurnitureId(id: string) {
  return ITEM_MAP[id]?.kind === 'furniture';
}

export function specialStatus(q: SpecialQuestDef, s: GameState) {
  const claimed = s.specialClaims[q.id] ?? 0;
  const value = q.value(s);
  const target = q.tiers[claimed];
  return {
    claimed,
    value,
    target,
    done: target === undefined,
    claimable: target !== undefined && value >= target,
    prev: claimed > 0 ? q.tiers[claimed - 1] : 0,
  };
}

// ---------- Seasonal event ----------

export function eventActiveDays(s: GameState, today: DayKey): number {
  const mk = monthKey(today);
  let n = 0;
  for (let d = `${mk}-01`; d <= today; d = shiftDay(d, 1)) if (s.days[d]?.active) n++;
  return n;
}

export function eventClaimableTiers(s: GameState, today: DayKey): number[] {
  const mk = monthKey(today);
  const days = eventActiveDays(s, today);
  const claimed = new Set(s.eventClaims[mk] ?? []);
  return EVENT_TIERS.map((t, i) => (days >= t && !claimed.has(i) ? i : -1)).filter((i) => i >= 0);
}
