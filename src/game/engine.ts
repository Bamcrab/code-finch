/**
 * All game-state mutations. Every function takes the (immer-draft) state and a context carrying
 * the clock, RNG and a notice queue for the UI. The zustand store wraps these one-to-one.
 */
import { AREA_DEFS, type GoalSuggestion } from '../data/areas';
import { item as itemDef, sellPrice, DYE_PARTS } from '../data/catalog';
import { CHALLENGE_MAP, awardItemId } from '../data/challenges';
import { EVENT_TIERS, eventForMonth } from '../data/events';
import { HOME_LOCATION, LOCATION_MAP } from '../data/locations';
import { MICROPET_SPECIES, NATURES, SPECIES_MAP } from '../data/micropets';
import { PROMPT_MAP } from '../data/reflections';
import { shade } from '../data/palette';
import { STARTER_ROOM } from '../data/styles';
import { dayKey, dayRange, monthKey, shiftDay, weekKey, type DayKey } from '../lib/date';
import { uid } from '../lib/rng';
import type {
  ActivityType,
  Area,
  BirbState,
  BodyPart,
  ClothingSlot,
  DayRecord,
  FurnitureSlot,
  GameState,
  Goal,
  Mood,
  MoodEntry,
  Pronouns,
  ReflectionAnswer,
  ShopId,
  TraitId,
} from '../state/types';
import { adventureDurationMs, discoveryKey, energyToMs, generateDiscovery, neededEnergy } from './adventure';
import {
  ADVENTURE_BASE_STONES,
  BASE_GOAL_ENERGY,
  BASE_GOAL_STONES,
  DAILY_QUEST_STONES,
  EGG_HATCH_COUNT,
  LOW_MOOD_GOAL_ENERGY,
  LOW_MOOD_GOAL_STONES,
  MAX_PAT_POINTS_PER_DAY,
  MICROPET_GROW_ADVENTURES,
  PATS_PER_POINT,
  SPECIAL_QUEST_STONES,
  STREAK_MAX_REPAIRS,
  TRAITS,
  WEEKLY_TIERS,
  friendshipLevel,
  refreshCost,
  stageFor,
  streakBonus,
  unlockedParts,
} from './constants';
import { dailyQuestsFor, questProgress, SPECIAL_QUESTS, specialStatus, weeklyAreaDays, eventActiveDays } from './quests';
import { dailyGiftAmount } from './shop';
import { computeStreak } from './streak';
import { extractTags, sentiment } from './text';

export const STATE_VERSION = 1;

export type Notice =
  | { kind: 'reward'; energy: number; stones: number; label?: string }
  | { kind: 'celebrate'; emoji: string; title: string; body?: string }
  | { kind: 'reflect'; goalId: string; title: string; emoji: string }
  | { kind: 'info'; text: string; emoji?: string };

export interface Ctx {
  now: number;
  rand: () => number;
  notices: Notice[];
}

export function makeCtx(now = Date.now(), rand: () => number = Math.random): Ctx {
  return { now, rand, notices: [] };
}

// ---------------------------------------------------------------- initial state

const TRAIT_ZERO = Object.fromEntries(TRAITS.map((t) => [t.id, 0])) as Record<TraitId, number>;

export function defaultColors(egg: string): Record<BodyPart, string> {
  return {
    body: egg,
    belly: shade(egg, -0.45),
    headpatch: shade(egg, 0.12),
    wings: shade(egg, 0.08),
    cheeks: '#f5a3b5',
    beak: '#f5b945',
    feet: '#e9a15f',
  };
}

export function defaultAreas(): Area[] {
  return AREA_DEFS.map((a, i) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    color: a.color,
    status: 'active',
    builtin: true,
    order: i,
  }));
}

export function initialState(now = Date.now()): GameState {
  const today = dayKey(now, 4);
  const inventory: GameState['inventory'] = {};
  for (const id of Object.values(STARTER_ROOM)) inventory[id] = { at: now, source: 'starter' };
  return {
    version: STATE_VERSION,
    createdAt: now,
    onboarded: false,
    settings: {
      userName: '',
      dayStartHour: 4,
      wakeTime: '07:30',
      bedTime: '22:30',
      weekStartsOn: 1,
      celebration: 'cheers',
      sound: true,
      theme: 'system',
      notifications: false,
      streaksEnabled: true,
      autoTag: true,
    },
    birb: {
      name: '',
      pronouns: { subject: 'they', object: 'them', possessive: 'their' },
      hatchedAt: now,
      eggColor: '#7fb8e6',
      colors: defaultColors('#7fb8e6'),
      startingTrait: 'curious',
      traits: { ...TRAIT_ZERO },
      adventures: 0,
      outfit: {},
      inHouse: true,
    },
    stones: 100,
    lifetimeStones: 100,
    friendship: { points: 0, pats: 0 },
    goals: [],
    areas: defaultAreas(),
    days: {},
    adventure: { day: today, status: 'charging' },
    pendingReturns: [],
    discoveries: [],
    travel: { location: HOME_LOCATION, freeTripUsed: false, visited: { [HOME_LOCATION]: { firstDay: today, found: [] } } },
    inventory,
    room: { ...STARTER_ROOM },
    savedRooms: [],
    savedOutfits: [],
    micropets: [],
    egg: null,
    moods: [],
    reflections: [],
    activities: [],
    quizResults: [],
    weeklyClaims: {},
    specialClaims: {},
    eventClaims: {},
    challenges: [],
    streak: { repairs: STREAK_MAX_REPAIRS, repairedDays: [], pausedDays: [], longest: 0, milestone: 0 },
    pause: null,
    lastSeenDay: today,
  };
}

// ---------------------------------------------------------------- helpers

export function todayOf(s: Pick<GameState, 'settings'>, now: number): DayKey {
  return dayKey(now, s.settings.dayStartHour);
}

function newDay(day: DayKey): DayRecord {
  return { day, energy: 0, stonesEarned: 0, goals: {}, events: {}, questsClaimed: [], shopRefreshes: {}, active: false };
}

export function ensureDay(s: GameState, day: DayKey): DayRecord {
  if (!s.days[day]) s.days[day] = newDay(day);
  return s.days[day];
}

function addStones(s: GameState, rec: DayRecord | undefined, n: number) {
  if (n <= 0) return;
  s.stones += n;
  s.lifetimeStones += n;
  if (rec) rec.stonesEarned += n;
}

function spend(s: GameState, n: number): boolean {
  if (s.stones < n) return false;
  s.stones -= n;
  return true;
}

function bumpEvent(rec: DayRecord, event: string, n = 1) {
  rec.events[event] = (rec.events[event] ?? 0) + n;
}

export function currentStreak(s: Pick<GameState, 'days' | 'streak' | 'settings'>, now: number) {
  return computeStreak({
    days: s.days,
    repairedDays: s.streak.repairedDays,
    pausedDays: s.streak.pausedDays,
    today: todayOf(s, now),
  });
}

function markActive(s: GameState, ctx: Ctx, rec: DayRecord) {
  if (rec.active) return;
  rec.active = true;
  if (rec.day !== todayOf(s, ctx.now)) return;
  const info = currentStreak(s, ctx.now);
  if (info.current > s.streak.longest) s.streak.longest = info.current;
  const milestone = Math.floor(info.current / 30);
  if (milestone < s.streak.milestone) s.streak.milestone = milestone;
  if (milestone > s.streak.milestone) {
    s.streak.milestone = milestone;
    if (s.streak.repairs < STREAK_MAX_REPAIRS) s.streak.repairs++;
  }
  if (s.settings.streaksEnabled && [3, 7, 14, 30, 50, 100, 200, 365, 500, 1000].includes(info.current)) {
    ctx.notices.push({
      kind: 'celebrate',
      emoji: '🔥',
      title: `${info.current}-day streak!`,
      body: `You've shown up for yourself ${info.current} days in a row.`,
    });
  }
}

interface Reward {
  energy?: number;
  stones?: number;
  events?: string[];
  active?: boolean;
  label?: string;
  silent?: boolean;
}

/** Grant rewards for today: stones, energy (which drives adventures), quest events, streak activity. */
export function grant(s: GameState, ctx: Ctx, r: Reward) {
  const today = todayOf(s, ctx.now);
  const rec = ensureDay(s, today);
  const stones = r.stones ?? 0;
  const energy = r.energy ?? 0;
  addStones(s, rec, stones);
  for (const e of r.events ?? []) bumpEvent(rec, e);
  if (r.active !== false && (energy > 0 || (r.events?.length ?? 0) > 0)) markActive(s, ctx, rec);
  if (energy > 0) addEnergy(s, ctx, rec, energy);
  if (!r.silent && (energy > 0 || stones > 0)) ctx.notices.push({ kind: 'reward', energy, stones, label: r.label });
}

function addEnergy(s: GameState, ctx: Ctx, rec: DayRecord, energy: number) {
  const before = rec.energy;
  rec.energy += energy;
  const adv = s.adventure;
  if (adv.status === 'charging') {
    const need = neededEnergy(s.birb.adventures);
    if (rec.energy >= need) startAdventure(s, ctx, rec, rec.energy - Math.max(before, need));
  } else if (adv.status === 'adventuring' && adv.endsAt) {
    adv.endsAt = Math.max(ctx.now, adv.endsAt - energyToMs(energy));
    if (adv.endsAt <= ctx.now) completeAdventure(s, ctx, ctx.now);
  }
}

function startAdventure(s: GameState, ctx: Ctx, rec: DayRecord, extraEnergy: number) {
  const adv = s.adventure;
  adv.status = 'adventuring';
  adv.startedAt = ctx.now;
  if (s.travel.ticket) {
    adv.destination = s.travel.ticket;
    s.travel.ticket = undefined;
  } else {
    adv.destination = undefined;
  }
  const duration = adventureDurationMs(s.birb.adventures) - energyToMs(Math.max(0, extraEnergy));
  adv.endsAt = ctx.now + Math.max(10 * 60_000, duration);
  const streak = currentStreak(s, ctx.now).current;
  const bonus = ADVENTURE_BASE_STONES + (friendshipLevel(s.friendship.points)?.bonus ?? 0) + streakBonus(streak);
  addStones(s, rec, bonus);
  bumpEvent(rec, 'adventure');
  const where = adv.destination ? `flying to ${LOCATION_MAP[adv.destination]?.name ?? 'somewhere new'}` : 'off on an adventure';
  ctx.notices.push({
    kind: 'celebrate',
    emoji: adv.destination ? '✈️' : '🎒',
    title: `${s.birb.name || 'Your birb'} is ${where}!`,
    body: `Full energy reached. +${bonus} 💎. Keep completing goals to bring them home sooner.`,
  });
}

export function completeAdventure(s: GameState, ctx: Ctx, at: number) {
  const adv = s.adventure;
  if (adv.status !== 'adventuring') return;
  const dest = adv.destination;
  const day = adv.day;
  if (dest) {
    s.travel.location = dest;
    if (!s.travel.visited[dest]) s.travel.visited[dest] = { firstDay: day, found: [] };
  }
  const loc = s.travel.location;
  const stageBefore = stageFor(s.birb.adventures);
  s.birb.adventures += 1;
  const stageAfter = stageFor(s.birb.adventures);
  s.friendship.points += 1;

  let grew: string | undefined;
  const pet = s.micropets.find((m) => m.id === s.birb.activeMicropet);
  if (pet) {
    pet.adventures += 1;
    if (pet.growable && pet.adventures === MICROPET_GROW_ADVENTURES) grew = pet.id;
  }

  const seen = new Set(s.discoveries.map(discoveryKey));
  const disc = generateDiscovery({
    rand: ctx.rand,
    id: uid(),
    day,
    now: at,
    locationId: loc,
    foundHere: s.travel.visited[loc]?.found ?? [],
    seen,
  });
  if (disc.locationDiscoveryId) {
    const v = s.travel.visited[loc] ?? (s.travel.visited[loc] = { firstDay: day, found: [] });
    if (!v.found.includes(disc.locationDiscoveryId)) v.found.push(disc.locationDiscoveryId);
  }
  s.discoveries.push(disc);
  s.pendingReturns.push({
    id: uid(),
    discoveryId: disc.id,
    locationId: loc,
    traveledTo: dest,
    stageUp: stageAfter.id !== stageBefore.id ? stageAfter.id : undefined,
    micropetGrew: grew,
    stones: 0,
  });
  adv.status = 'home';
  adv.endsAt = at;
}

/** Bring the state up to date with the clock: finish adventures and roll over days. */
export function sync(s: GameState, ctx: Ctx) {
  const today = todayOf(s, ctx.now);
  const adv = s.adventure;
  if (adv.status === 'adventuring' && adv.endsAt && adv.endsAt <= ctx.now) completeAdventure(s, ctx, adv.endsAt);
  if (adv.day !== today) {
    if (s.adventure.status === 'adventuring') completeAdventure(s, ctx, ctx.now);
    recordPausedDays(s, today);
    s.adventure = { day: today, status: 'charging' };
    for (const g of s.goals) {
      if (g.schedule.type === 'once' && g.totalDone > 0 && g.status === 'active' && (g.lastDoneDay ?? '') < today) {
        g.status = 'archived';
      }
    }
  }
  ensureDay(s, today);
  s.lastSeenDay = today;
}

function recordPausedDays(s: GameState, today: DayKey) {
  if (!s.pause) return;
  const yesterday = shiftDay(today, -1);
  const end = s.pause.until < yesterday ? s.pause.until : yesterday;
  if (end >= s.pause.from) {
    for (const d of dayRange(s.pause.from, end)) if (!s.streak.pausedDays.includes(d)) s.streak.pausedDays.push(d);
  }
  if (today > s.pause.until) s.pause = null;
}

// ---------------------------------------------------------------- onboarding & profile

export interface HatchInput {
  userName: string;
  birbName: string;
  pronouns: Pronouns;
  eggColor: string;
  trait: TraitId;
  wakeTime: string;
  bedTime: string;
  goals: GoalSuggestion[];
  areaOf: (g: GoalSuggestion) => string | undefined;
}

export function hatch(s: GameState, ctx: Ctx, input: HatchInput) {
  s.onboarded = true;
  s.createdAt = ctx.now;
  s.settings.userName = input.userName.trim();
  s.settings.wakeTime = input.wakeTime;
  s.settings.bedTime = input.bedTime;
  s.birb.name = input.birbName.trim() || 'Birb';
  s.birb.pronouns = input.pronouns;
  s.birb.eggColor = input.eggColor;
  s.birb.colors = defaultColors(input.eggColor);
  s.birb.startingTrait = input.trait;
  s.birb.traits[input.trait] = 3;
  s.birb.hatchedAt = ctx.now;
  const today = todayOf(s, ctx.now);
  s.adventure = { day: today, status: 'charging' };
  s.travel.visited = { [HOME_LOCATION]: { firstDay: today, found: [] } };
  for (const g of input.goals) addGoal(s, ctx, { ...suggestionToGoal(g, today), areaId: input.areaOf(g) });
  ensureDay(s, today);
}

export function updateBirb(s: GameState, _ctx: Ctx, patch: Partial<Pick<BirbState, 'name' | 'pronouns' | 'inHouse'>>) {
  Object.assign(s.birb, patch);
}

export function updateSettings(s: GameState, _ctx: Ctx, patch: Partial<GameState['settings']>) {
  Object.assign(s.settings, patch);
}

// ---------------------------------------------------------------- goals

export type GoalInput = Partial<Omit<Goal, 'id' | 'createdAt' | 'createdDay' | 'totalDone' | 'order'>> & {
  title: string;
};

export function suggestionToGoal(g: GoalSuggestion, today: DayKey): GoalInput {
  return {
    title: g.title,
    emoji: g.emoji,
    timeOfDay: g.timeOfDay ?? 'anytime',
    schedule: g.schedule?.type === 'everyNDays' ? { ...g.schedule, anchor: today } : (g.schedule ?? { type: 'daily' }),
    link: g.link,
    timesPerDay: g.timesPerDay ?? 1,
  };
}

export function addGoal(s: GameState, ctx: Ctx, input: GoalInput): string {
  const id = uid();
  const today = todayOf(s, ctx.now);
  s.goals.push({
    id,
    title: input.title.trim() || 'New goal',
    emoji: input.emoji || '⭐',
    kind: input.kind ?? 'goal',
    areaId: input.areaId,
    room: input.room,
    schedule: input.schedule ?? { type: 'daily' },
    timeOfDay: input.timeOfDay ?? 'anytime',
    timesPerDay: Math.max(1, Math.min(100, input.timesPerDay ?? 1)),
    effort: input.effort ?? 1,
    link: input.link,
    reminder: input.reminder,
    notes: input.notes,
    showOnHome: input.showOnHome ?? true,
    status: 'active',
    createdAt: ctx.now,
    createdDay: today,
    lastDoneDay: input.lastDoneDay,
    totalDone: 0,
    order: s.goals.length,
  });
  return id;
}

export function updateGoal(s: GameState, _ctx: Ctx, id: string, patch: Partial<Goal>) {
  const g = s.goals.find((x) => x.id === id);
  if (!g) return;
  Object.assign(g, patch);
  if (patch.timesPerDay !== undefined) g.timesPerDay = Math.max(1, Math.min(100, patch.timesPerDay));
}

export function setGoalStatus(s: GameState, _ctx: Ctx, id: string, status: Goal['status']) {
  const g = s.goals.find((x) => x.id === id);
  if (g) g.status = status;
}

export function deleteGoal(s: GameState, _ctx: Ctx, id: string) {
  s.goals = s.goals.filter((g) => g.id !== id);
  if (s.egg?.linkedGoalId === id) s.egg = { ...s.egg, linkedGoalId: undefined, progress: 0 };
}

function lastFullDay(s: GameState, g: Goal): DayKey | undefined {
  let best: DayKey | undefined;
  for (const [day, rec] of Object.entries(s.days)) {
    const gd = rec.goals[g.id];
    if (gd && gd.count >= g.timesPerDay && (!best || day > best)) best = day;
  }
  return best;
}

export function completeGoal(s: GameState, ctx: Ctx, id: string, day?: DayKey) {
  const g = s.goals.find((x) => x.id === id);
  if (!g) return;
  const today = todayOf(s, ctx.now);
  const d = day ?? today;
  const rec = ensureDay(s, d);
  const gd = rec.goals[g.id] ?? (rec.goals[g.id] = { count: 0, times: [], energy: 0, stones: 0 });
  if (gd.count >= g.timesPerDay) return;
  gd.count += 1;
  gd.times.push(ctx.now);
  gd.skipped = false;
  const full = gd.count >= g.timesPerDay;

  if (d === today) {
    const low = !!rec.lowMood;
    const energy = (low ? LOW_MOOD_GOAL_ENERGY : BASE_GOAL_ENERGY) * g.effort;
    let stones = (low ? LOW_MOOD_GOAL_STONES : BASE_GOAL_STONES) * g.effort;
    if (full && rec.goalOfDay === g.id && !rec.goalOfDayPaid) {
      const bonus = 10 + Math.floor(ctx.rand() * 16);
      gd.bonus = bonus;
      rec.goalOfDayPaid = true;
      stones += bonus;
    }
    gd.energy += energy;
    gd.stones += stones;
    const events = ['goal'];
    if (g.kind === 'upkeep' && full) events.push('upkeep');
    grant(s, ctx, { energy, stones, events, label: g.title });
  } else {
    gd.retro = true;
    gd.stones += BASE_GOAL_STONES;
    addStones(s, rec, BASE_GOAL_STONES);
    ctx.notices.push({ kind: 'reward', energy: 0, stones: BASE_GOAL_STONES, label: `${g.title} (logged for ${d})` });
  }

  if (full) {
    g.totalDone += 1;
    if (!g.lastDoneDay || d > g.lastDoneDay) g.lastDoneDay = d;
    g.snoozedUntil = undefined;
    if (s.egg?.linkedGoalId === g.id) advanceEgg(s, ctx);
    if (s.settings.celebration === 'reflect' && d === today) {
      ctx.notices.push({ kind: 'reflect', goalId: g.id, title: g.title, emoji: g.emoji });
    }
  }
}

export function undoGoal(s: GameState, ctx: Ctx, id: string, day?: DayKey) {
  const g = s.goals.find((x) => x.id === id);
  if (!g) return;
  const today = todayOf(s, ctx.now);
  const d = day ?? today;
  const rec = s.days[d];
  const gd = rec?.goals[g.id];
  if (!rec || !gd || gd.count <= 0) return;
  const wasFull = gd.count >= g.timesPerDay;
  const eBack = Math.round(gd.energy / gd.count);
  let sBack = Math.round((gd.stones - (gd.bonus ?? 0)) / gd.count);
  if (wasFull && gd.bonus) {
    sBack += gd.bonus;
    gd.stones -= gd.bonus;
    gd.bonus = undefined;
    rec.goalOfDayPaid = false;
  }
  gd.count -= 1;
  gd.times.pop();
  gd.energy = Math.max(0, gd.energy - eBack);
  gd.stones = Math.max(0, gd.stones - sBack);
  s.stones = Math.max(0, s.stones - sBack);
  rec.stonesEarned = Math.max(0, rec.stonesEarned - sBack);
  if (d === today) {
    rec.energy = Math.max(0, rec.energy - eBack);
    rec.events.goal = Math.max(0, (rec.events.goal ?? 0) - 1);
    if (wasFull && g.kind === 'upkeep') rec.events.upkeep = Math.max(0, (rec.events.upkeep ?? 0) - 1);
  }
  if (wasFull) {
    g.totalDone = Math.max(0, g.totalDone - 1);
    g.lastDoneDay = lastFullDay(s, g);
    if (s.egg?.linkedGoalId === g.id && s.egg.progress > 0) s.egg.progress -= 1;
  }
  if (gd.count === 0 && !gd.skipped) delete rec.goals[g.id];
}

export function skipGoal(s: GameState, ctx: Ctx, id: string, skipped = true) {
  const rec = ensureDay(s, todayOf(s, ctx.now));
  const gd = rec.goals[id] ?? (rec.goals[id] = { count: 0, times: [], energy: 0, stones: 0 });
  gd.skipped = skipped;
  if (!skipped && gd.count === 0) delete rec.goals[id];
}

export function snoozeGoal(s: GameState, _ctx: Ctx, id: string, until: DayKey | undefined) {
  const g = s.goals.find((x) => x.id === id);
  if (g) g.snoozedUntil = until;
}

/** Mark an upkeep task as done on some past date without rewards (e.g. "I did this last month"). */
export function setLastDone(s: GameState, _ctx: Ctx, id: string, day: DayKey | undefined) {
  const g = s.goals.find((x) => x.id === id);
  if (g) g.lastDoneDay = day;
}

export function setGoalOfDay(s: GameState, ctx: Ctx, id: string | undefined) {
  const rec = ensureDay(s, todayOf(s, ctx.now));
  if (rec.goalOfDayPaid) return;
  rec.goalOfDay = id;
}

// ---------------------------------------------------------------- areas

export function addArea(s: GameState, _ctx: Ctx, a: Pick<Area, 'name' | 'emoji' | 'color'>): string {
  const id = uid();
  s.areas.push({ ...a, id, status: 'active', builtin: false, order: s.areas.length });
  return id;
}

export function updateArea(s: GameState, _ctx: Ctx, id: string, patch: Partial<Area>) {
  const a = s.areas.find((x) => x.id === id);
  if (a) Object.assign(a, patch);
}

export function deleteArea(s: GameState, _ctx: Ctx, id: string) {
  s.areas = s.areas.filter((a) => a.id !== id);
  for (const g of s.goals) if (g.areaId === id) g.areaId = undefined;
}

// ---------------------------------------------------------------- mood, reflections, activities

export function logMood(
  s: GameState,
  ctx: Ctx,
  entry: { mood: Mood; factors?: string[]; emotions?: string[]; note?: string; kind?: MoodEntry['kind'] },
): string {
  const today = todayOf(s, ctx.now);
  const rec = ensureDay(s, today);
  const id = uid();
  s.moods.push({
    id,
    at: ctx.now,
    day: today,
    mood: entry.mood,
    factors: entry.factors ?? [],
    emotions: entry.emotions ?? [],
    note: entry.note,
    kind: entry.kind ?? 'log',
  });
  const wasLow = !!rec.lowMood;
  rec.lowMood = entry.mood <= 2;
  if (rec.lowMood && !wasLow) rec.firstAidDismissed = false;
  if (entry.emotions?.length) bumpEvent(rec, 'emotion');
  grant(s, ctx, { events: ['mood'], silent: true });
  return id;
}

export function setCheckIn(s: GameState, ctx: Ctx, patch: Partial<Pick<DayRecord, 'motivation' | 'satisfaction' | 'intention'>>) {
  Object.assign(ensureDay(s, todayOf(s, ctx.now)), patch);
}

export function dismissFirstAid(s: GameState, ctx: Ctx) {
  ensureDay(s, todayOf(s, ctx.now)).firstAidDismissed = true;
}

export interface ReflectionInput {
  promptId?: string;
  title: string;
  emoji: string;
  answers: ReflectionAnswer[];
  discoveryId?: string;
  goalId?: string;
  day?: DayKey;
}

export function saveReflection(s: GameState, ctx: Ctx, input: ReflectionInput): string {
  const today = todayOf(s, ctx.now);
  const text = input.answers.map((a) => a.text).join('\n');
  const id = uid();
  s.reflections.push({
    id,
    at: ctx.now,
    day: input.day ?? today,
    promptId: input.promptId,
    title: input.title,
    emoji: input.emoji,
    answers: input.answers,
    tags: extractTags(text, s.settings.autoTag),
    sentiment: sentiment(text),
    discoveryId: input.discoveryId,
    goalId: input.goalId,
  });
  if (input.discoveryId) {
    const d = s.discoveries.find((x) => x.id === input.discoveryId);
    if (d) d.reflectionId = id;
  }
  const events = ['reflection'];
  const cats = PROMPT_MAP[input.promptId ?? '']?.categories ?? [];
  if (input.promptId === 'gratitude-jar' || input.promptId === 'savor' || cats.includes('kindness')) events.push('gratitude');
  const long = text.trim().length >= 150;
  if (!input.day || input.day === today) {
    grant(s, ctx, { energy: 5, stones: 3 + (long ? 3 : 0), events, label: 'Reflection' });
  }
  return id;
}

export function updateReflection(s: GameState, _ctx: Ctx, id: string, answers: ReflectionAnswer[]) {
  const r = s.reflections.find((x) => x.id === id);
  if (!r) return;
  r.answers = answers;
  const text = answers.map((a) => a.text).join('\n');
  r.tags = extractTags(text, s.settings.autoTag);
  r.sentiment = sentiment(text);
}

export function deleteReflection(s: GameState, _ctx: Ctx, id: string) {
  s.reflections = s.reflections.filter((r) => r.id !== id);
}

export interface ActivityInput {
  type: ActivityType;
  refId?: string;
  title: string;
  seconds?: number;
  energy: number;
  stones: number;
  events?: string[];
}

export function logActivity(s: GameState, ctx: Ctx, a: ActivityInput) {
  const today = todayOf(s, ctx.now);
  s.activities.push({
    id: uid(),
    at: ctx.now,
    day: today,
    type: a.type,
    refId: a.refId,
    title: a.title,
    seconds: a.seconds,
    energy: a.energy,
    stones: a.stones,
  });
  grant(s, ctx, { energy: a.energy, stones: a.stones, events: a.events ?? [a.type], label: a.title });
}

export function saveQuiz(s: GameState, ctx: Ctx, r: { quizId: string; answers: number[]; score: number; band: string; title: string }) {
  const today = todayOf(s, ctx.now);
  s.quizResults.push({ id: uid(), at: ctx.now, day: today, quizId: r.quizId, score: r.score, band: r.band, answers: r.answers });
  logActivity(s, ctx, { type: 'quiz', refId: r.quizId, title: r.title, energy: 5, stones: 3, events: ['quiz'] });
}

// ---------------------------------------------------------------- birb interactions

export function answerDiscovery(s: GameState, _ctx: Ctx, discoveryId: string, idx: number) {
  const d = s.discoveries.find((x) => x.id === discoveryId);
  if (!d || d.answered !== undefined) return;
  d.answered = idx;
  const trait = d.responses[idx]?.trait;
  if (trait) s.birb.traits[trait] = (s.birb.traits[trait] ?? 0) + 1;
}

export function finishReturn(s: GameState, _ctx: Ctx, returnId: string) {
  s.pendingReturns = s.pendingReturns.filter((r) => r.id !== returnId);
}

/** Free color pick offered when growing into a stage that unlocks new body parts. */
export function chooseStageColor(s: GameState, ctx: Ctx, dyeId: string) {
  const it = itemDef(dyeId);
  if (!it || it.kind !== 'dye') return;
  s.inventory[dyeId] = { at: ctx.now, source: 'award' };
  s.birb.colors[it.slot as BodyPart] = it.color;
}

export function pat(s: GameState, ctx: Ctx): boolean {
  const rec = ensureDay(s, todayOf(s, ctx.now));
  s.friendship.pats += 1;
  if (!rec.events.pet) bumpEvent(rec, 'pet');
  if (s.friendship.pats % PATS_PER_POINT === 0 && (rec.patPoints ?? 0) < MAX_PAT_POINTS_PER_DAY) {
    rec.patPoints = (rec.patPoints ?? 0) + 1;
    const before = friendshipLevel(s.friendship.points);
    s.friendship.points += 1;
    const after = friendshipLevel(s.friendship.points);
    if (after && after.level !== before?.level) {
      ctx.notices.push({
        kind: 'celebrate',
        emoji: after.heart,
        title: `You and ${s.birb.name} are now ${after.name}!`,
        body: `Adventures now earn +${after.bonus} bonus stones.`,
      });
    }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- wardrobe & room

export function equip(s: GameState, ctx: Ctx, slot: ClothingSlot, id: string | undefined) {
  if (id && !s.inventory[id]) return;
  if (s.birb.outfit[slot] === id) return;
  if (id) s.birb.outfit[slot] = id;
  else delete s.birb.outfit[slot];
  bumpEvent(ensureDay(s, todayOf(s, ctx.now)), 'outfit');
}

export function setColor(s: GameState, ctx: Ctx, part: BodyPart, dyeId: string | 'default') {
  if (dyeId === 'default') {
    s.birb.colors[part] = defaultColors(s.birb.eggColor)[part];
  } else {
    const it = itemDef(dyeId);
    if (!it || !s.inventory[dyeId] || it.slot !== part) return;
    if (!unlockedParts(s.birb.adventures).includes(part)) return;
    s.birb.colors[part] = it.color;
  }
  bumpEvent(ensureDay(s, todayOf(s, ctx.now)), 'outfit');
}

export function place(s: GameState, ctx: Ctx, slot: FurnitureSlot, id: string | undefined) {
  if (id && !s.inventory[id]) return;
  if (s.room[slot] === id) return;
  if (id) s.room[slot] = id;
  else delete s.room[slot];
  bumpEvent(ensureDay(s, todayOf(s, ctx.now)), 'interior');
}

export function saveLook(s: GameState, _ctx: Ctx, kind: 'room' | 'outfit', name: string) {
  if (kind === 'room') s.savedRooms.push({ id: uid(), name, data: { ...s.room } });
  else s.savedOutfits.push({ id: uid(), name, data: { ...s.birb.outfit } });
}

export function applyLook(s: GameState, ctx: Ctx, kind: 'room' | 'outfit', id: string) {
  const today = ensureDay(s, todayOf(s, ctx.now));
  if (kind === 'room') {
    const look = s.savedRooms.find((l) => l.id === id);
    if (!look) return;
    s.room = Object.fromEntries(Object.entries(look.data).filter(([, v]) => v && s.inventory[v]));
    bumpEvent(today, 'interior');
  } else {
    const look = s.savedOutfits.find((l) => l.id === id);
    if (!look) return;
    s.birb.outfit = Object.fromEntries(Object.entries(look.data).filter(([, v]) => v && s.inventory[v]));
    bumpEvent(today, 'outfit');
  }
}

export function deleteLook(s: GameState, _ctx: Ctx, kind: 'room' | 'outfit', id: string) {
  if (kind === 'room') s.savedRooms = s.savedRooms.filter((l) => l.id !== id);
  else s.savedOutfits = s.savedOutfits.filter((l) => l.id !== id);
}

// ---------------------------------------------------------------- shops

export function buy(s: GameState, ctx: Ctx, id: string): boolean {
  const it = itemDef(id);
  if (!it || s.inventory[id]) return false;
  if (!spend(s, it.price)) return false;
  s.inventory[id] = { at: ctx.now, source: 'shop' };
  ctx.notices.push({ kind: 'info', emoji: '🛍️', text: `Bought ${it.name}` });
  return true;
}

export function sell(s: GameState, ctx: Ctx, id: string): boolean {
  const it = itemDef(id);
  if (!it || !s.inventory[id] || it.rarity === 'award') return false;
  for (const [slot, v] of Object.entries(s.birb.outfit)) if (v === id) delete s.birb.outfit[slot as ClothingSlot];
  for (const [slot, v] of Object.entries(s.room)) if (v === id) delete s.room[slot as FurnitureSlot];
  if (it.kind === 'dye' && s.birb.colors[it.slot as BodyPart] === it.color) {
    s.birb.colors[it.slot as BodyPart] = defaultColors(s.birb.eggColor)[it.slot as BodyPart];
  }
  delete s.inventory[id];
  const value = sellPrice(it);
  addStones(s, undefined, value);
  ctx.notices.push({ kind: 'info', emoji: '💎', text: `Sold ${it.name} for ${value}` });
  return true;
}

export function refreshShop(s: GameState, ctx: Ctx, shop: ShopId): boolean {
  const rec = ensureDay(s, todayOf(s, ctx.now));
  const n = rec.shopRefreshes[shop] ?? 0;
  if (!spend(s, refreshCost(n))) return false;
  rec.shopRefreshes[shop] = n + 1;
  return true;
}

export function claimGift(s: GameState, ctx: Ctx): number {
  const today = todayOf(s, ctx.now);
  const rec = ensureDay(s, today);
  if (rec.giftClaimed) return 0;
  rec.giftClaimed = true;
  const amount = dailyGiftAmount(today);
  addStones(s, rec, amount);
  ctx.notices.push({ kind: 'reward', energy: 0, stones: amount, label: 'Daily gift from the shop' });
  return amount;
}

export function buyTicket(s: GameState, ctx: Ctx, locationId: string, price: number): boolean {
  if (stageFor(s.birb.adventures).startsAt < 22 || s.travel.ticket || locationId === s.travel.location) return false;
  const cost = s.travel.freeTripUsed ? price : 0;
  if (!spend(s, cost)) return false;
  s.travel.freeTripUsed = true;
  s.travel.ticket = locationId;
  const when = s.adventure.status === 'charging' ? 'as soon as energy is full' : 'on the next adventure';
  ctx.notices.push({ kind: 'info', emoji: '🎫', text: `Ticket booked to ${LOCATION_MAP[locationId]?.name}! Departing ${when}.` });
  return true;
}

// ---------------------------------------------------------------- micropets

export function takeEgg(s: GameState, ctx: Ctx) {
  if (!s.egg) s.egg = { receivedAt: ctx.now, progress: 0 };
}

export function linkEgg(s: GameState, _ctx: Ctx, goalId: string | undefined) {
  if (!s.egg) return;
  s.egg.linkedGoalId = goalId;
  s.egg.progress = 0;
}

function advanceEgg(s: GameState, ctx: Ctx) {
  if (!s.egg) return;
  s.egg.progress += 1;
  if (s.egg.progress >= EGG_HATCH_COUNT) {
    const owned = new Set(s.micropets.map((m) => m.species));
    const pool = MICROPET_SPECIES.filter((sp) => !sp.eventOnly);
    const fresh = pool.filter((sp) => !owned.has(sp.id));
    const list = fresh.length && ctx.rand() < 0.8 ? fresh : pool;
    const sp = list[Math.floor(ctx.rand() * list.length)];
    const pet = addMicropet(s, ctx, sp.id, Math.floor(ctx.rand() * 3));
    s.egg = null;
    ctx.notices.push({ kind: 'celebrate', emoji: '🥚', title: `Your egg hatched!`, body: `Meet ${pet.name} the ${sp.kind}!` });
  } else {
    ctx.notices.push({
      kind: 'info',
      emoji: '🥚',
      text: `Egg progress ${s.egg.progress}/${EGG_HATCH_COUNT}`,
    });
  }
}

function addMicropet(s: GameState, ctx: Ctx, species: string, variant: number) {
  const sp = SPECIES_MAP[species];
  const pet = {
    id: uid(),
    species,
    variant,
    name: sp?.name ?? 'Pal',
    nature: NATURES[Math.floor(ctx.rand() * NATURES.length)],
    hatchedAt: ctx.now,
    adventures: 0,
    growable: true,
  };
  s.micropets.push(pet);
  if (!s.birb.activeMicropet) s.birb.activeMicropet = pet.id;
  return pet;
}

export function updateMicropet(s: GameState, _ctx: Ctx, id: string, patch: { name?: string; growable?: boolean }) {
  const m = s.micropets.find((x) => x.id === id);
  if (m) Object.assign(m, patch);
}

export function setActiveMicropet(s: GameState, _ctx: Ctx, id: string | undefined) {
  s.birb.activeMicropet = id;
}

export function releaseMicropet(s: GameState, _ctx: Ctx, id: string) {
  s.micropets = s.micropets.filter((m) => m.id !== id);
  if (s.birb.activeMicropet === id) s.birb.activeMicropet = undefined;
}

// ---------------------------------------------------------------- quests

export function claimDaily(s: GameState, ctx: Ctx, questId: string) {
  const today = todayOf(s, ctx.now);
  const rec = ensureDay(s, today);
  const q = dailyQuestsFor(today, s).find((x) => x.id === questId);
  if (!q || rec.questsClaimed.includes(questId) || questProgress(q, s, today) < q.target) return;
  rec.questsClaimed.push(questId);
  addStones(s, rec, DAILY_QUEST_STONES);
  ctx.notices.push({ kind: 'reward', energy: 0, stones: DAILY_QUEST_STONES, label: 'Daily quest' });
}

export function claimWeekly(s: GameState, ctx: Ctx, areaId: string) {
  const today = todayOf(s, ctx.now);
  const wk = weekKey(today, s.settings.weekStartsOn);
  const days = weeklyAreaDays(s, today)[areaId] ?? 0;
  const claimed = s.weeklyClaims[wk]?.[areaId] ?? 0;
  let total = 0;
  let tier = claimed;
  while (tier < WEEKLY_TIERS.length && days >= WEEKLY_TIERS[tier].days) {
    total += WEEKLY_TIERS[tier].stones;
    tier++;
  }
  if (!total) return;
  (s.weeklyClaims[wk] ??= {})[areaId] = tier;
  addStones(s, ensureDay(s, today), total);
  ctx.notices.push({ kind: 'reward', energy: 0, stones: total, label: 'Weekly milestone' });
}

export function claimSpecial(s: GameState, ctx: Ctx, questId: string) {
  const q = SPECIAL_QUESTS.find((x) => x.id === questId);
  if (!q) return;
  const st = specialStatus(q, s);
  if (!st.claimable) return;
  s.specialClaims[q.id] = st.claimed + 1;
  addStones(s, ensureDay(s, todayOf(s, ctx.now)), SPECIAL_QUEST_STONES);
  ctx.notices.push({ kind: 'reward', energy: 0, stones: SPECIAL_QUEST_STONES, label: q.label(st.target!) });
}

export function claimEventTier(s: GameState, ctx: Ctx, tier: number) {
  const today = todayOf(s, ctx.now);
  const mk = monthKey(today);
  const claimed = (s.eventClaims[mk] ??= []);
  if (claimed.includes(tier) || eventActiveDays(s, today) < EVENT_TIERS[tier]) return;
  const ev = eventForMonth(Number(mk.slice(5, 7)));
  claimed.push(tier);
  if (tier < ev.items.length) {
    const it = ev.items[tier];
    s.inventory[it.id] = { at: ctx.now, source: 'event' };
    ctx.notices.push({ kind: 'celebrate', emoji: ev.emoji, title: `${it.name} unlocked!`, body: `A gift from the ${ev.name} event.` });
  } else {
    const sp = SPECIES_MAP[ev.micropet];
    addMicropet(s, ctx, ev.micropet, 0);
    ctx.notices.push({ kind: 'celebrate', emoji: '🐾', title: `${sp?.name ?? 'A micropet'} joined your family!`, body: `The ${ev.name} micropet is yours.` });
  }
}

// ---------------------------------------------------------------- challenges

export function joinChallenge(s: GameState, ctx: Ctx, id: string) {
  const def = CHALLENGE_MAP[id];
  if (!def || s.challenges.some((c) => c.id === id && !c.finishedDay)) return;
  s.challenges = s.challenges.filter((c) => c.id !== id);
  s.challenges.push({ id, startedDay: todayOf(s, ctx.now), done: def.steps.map(() => null) });
}

export function leaveChallenge(s: GameState, _ctx: Ctx, id: string) {
  s.challenges = s.challenges.filter((c) => !(c.id === id && !c.finishedDay));
}

export function completeChallengeStep(s: GameState, ctx: Ctx, id: string, idx: number): boolean {
  const def = CHALLENGE_MAP[id];
  const prog = s.challenges.find((c) => c.id === id && !c.finishedDay);
  if (!def || !prog || prog.done[idx]) return false;
  const today = todayOf(s, ctx.now);
  if (prog.done.includes(today)) return false;
  prog.done[idx] = today;
  const events = ['goal', 'challenge'];
  if (def.area === 'home') events.push('upkeep');
  grant(s, ctx, { energy: BASE_GOAL_ENERGY, stones: 5, events, label: def.steps[idx].title });
  if (prog.done.every(Boolean)) {
    prog.finishedDay = today;
    s.inventory[awardItemId(id)] = { at: ctx.now, source: 'challenge' };
    addStones(s, ensureDay(s, today), 100);
    ctx.notices.push({
      kind: 'celebrate',
      emoji: def.emoji,
      title: `${def.name} complete!`,
      body: 'You earned a wall award for your birbhouse and 100 bonus stones.',
    });
  }
  return true;
}

// ---------------------------------------------------------------- streak & pause

export function repairStreak(s: GameState, ctx: Ctx): boolean {
  const info = currentStreak(s, ctx.now);
  if (!info.repairable || s.streak.repairs <= 0) return false;
  s.streak.repairs -= 1;
  s.streak.repairedDays.push(info.repairable);
  const after = currentStreak(s, ctx.now);
  if (after.current > s.streak.longest) s.streak.longest = after.current;
  ctx.notices.push({ kind: 'celebrate', emoji: '🔨', title: 'Streak repaired!', body: `Your streak is back to ${after.current} days.` });
  return true;
}

export function startPause(s: GameState, ctx: Ctx, days: number) {
  const today = todayOf(s, ctx.now);
  s.pause = { from: today, until: shiftDay(today, Math.max(1, Math.min(7, days)) - 1) };
}

export function endPause(s: GameState, ctx: Ctx) {
  if (!s.pause) return;
  const today = todayOf(s, ctx.now);
  const yesterday = shiftDay(today, -1);
  const end = s.pause.until < yesterday ? s.pause.until : yesterday;
  if (end >= s.pause.from) {
    for (const d of dayRange(s.pause.from, end)) if (!s.streak.pausedDays.includes(d)) s.streak.pausedDays.push(d);
  }
  s.pause = null;
}

// ---------------------------------------------------------------- data

export function isGameState(x: unknown): x is GameState {
  const o = x as GameState;
  return !!o && typeof o === 'object' && typeof o.version === 'number' && !!o.birb && Array.isArray(o.goals) && !!o.days;
}

/** Fill any fields added after a save was made. */
export function normalize(raw: GameState): GameState {
  const base = initialState(raw.createdAt ?? Date.now());
  const s: GameState = { ...base, ...raw };
  s.settings = { ...base.settings, ...raw.settings };
  s.birb = { ...base.birb, ...raw.birb, colors: { ...base.birb.colors, ...raw.birb?.colors } };
  s.streak = { ...base.streak, ...raw.streak };
  s.travel = { ...base.travel, ...raw.travel };
  for (const part of DYE_PARTS) if (!s.birb.colors[part]) s.birb.colors[part] = defaultColors(s.birb.eggColor)[part];
  s.version = STATE_VERSION;
  return s;
}
