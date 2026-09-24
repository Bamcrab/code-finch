import type { BodyPart, Effort, Stage, TraitId } from '../state/types';

export interface StageInfo {
  id: Stage;
  label: string;
  /** Adventures completed before reaching this stage. */
  startsAt: number;
  fullEnergy: number;
  adventureHours: number;
  scale: number;
  /** Body parts whose color can be changed from this stage on. */
  unlocksParts: BodyPart[];
}

export const STAGES: StageInfo[] = [
  { id: 'baby', label: 'Baby', startsAt: 0, fullEnergy: 15, adventureHours: 8, scale: 0.72, unlocksParts: [] },
  { id: 'toddler', label: 'Toddler', startsAt: 7, fullEnergy: 20, adventureHours: 7, scale: 0.8, unlocksParts: ['beak', 'body'] },
  { id: 'child', label: 'Child', startsAt: 22, fullEnergy: 25, adventureHours: 6, scale: 0.88, unlocksParts: ['headpatch', 'wings'] },
  { id: 'teen', label: 'Teen', startsAt: 42, fullEnergy: 30, adventureHours: 6, scale: 0.94, unlocksParts: ['cheeks', 'feet'] },
  { id: 'adult', label: 'Adult', startsAt: 67, fullEnergy: 35, adventureHours: 6, scale: 1, unlocksParts: ['belly'] },
];

export function stageFor(adventures: number): StageInfo {
  let s = STAGES[0];
  for (const st of STAGES) if (adventures >= st.startsAt) s = st;
  return s;
}

export function nextStage(adventures: number): StageInfo | undefined {
  return STAGES.find((s) => s.startsAt > adventures);
}

export function unlockedParts(adventures: number): BodyPart[] {
  return STAGES.filter((s) => adventures >= s.startsAt).flatMap((s) => s.unlocksParts);
}

/** Minutes shaved off an adventure per point of energy earned after it starts. */
export const MINUTES_PER_ENERGY = 2;

export const BASE_GOAL_ENERGY = 5;
export const BASE_GOAL_STONES = 3;
export const LOW_MOOD_GOAL_ENERGY = 7;
export const LOW_MOOD_GOAL_STONES = 4;
export const EFFORT_LABEL: Record<Effort, string> = { 1: 'Light', 2: 'Medium', 3: 'Big' };

export const ADVENTURE_BASE_STONES = 15;
export const DAILY_QUEST_STONES = 25;
export const SPECIAL_QUEST_STONES = 100;
export const WEEKLY_TIERS = [
  { days: 2, stones: 20 },
  { days: 4, stones: 50 },
  { days: 6, stones: 100 },
];
export const DAILY_QUEST_COUNT = 3;
export const EGG_HATCH_COUNT = 7;
export const MICROPET_GROW_ADVENTURES = 7;
export const PATS_PER_POINT = 15;
export const MAX_PAT_POINTS_PER_DAY = 2;
export const STREAK_MAX_REPAIRS = 2;
export const TRAVEL_PRICE = 300;
export const TRAVEL_HOME_PRICE = 200;
export const SHOP_SLOTS = 12;
export const SELL_RATE = 0.5;

/** Cost of the n-th manual refresh of a shop in a day (0-based). First one is free. */
export function refreshCost(n: number): number {
  if (n <= 0) return 0;
  return 10 + (n - 1) * 25;
}

export interface FriendshipLevel {
  level: number;
  name: string;
  points: number;
  bonus: number;
  heart: string;
}

export const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
  { level: 1, name: 'Pals', points: 1, bonus: 2, heart: '🤍' },
  { level: 2, name: 'Play Pals', points: 2, bonus: 4, heart: '💗' },
  { level: 3, name: 'Buddies', points: 4, bonus: 6, heart: '❤️' },
  { level: 4, name: 'Best Buds', points: 8, bonus: 8, heart: '❤️' },
  { level: 5, name: 'Friendzies', points: 15, bonus: 10, heart: '💜' },
  { level: 6, name: 'Besties', points: 30, bonus: 14, heart: '💜' },
  { level: 7, name: 'Uber Besties', points: 80, bonus: 22, heart: '💙' },
  { level: 8, name: 'Twinzies', points: 165, bonus: 35, heart: '💙' },
  { level: 9, name: 'Soulmates', points: 340, bonus: 50, heart: '💛' },
  { level: 10, name: 'Uber Soulmates', points: 730, bonus: 75, heart: '💛' },
];

export function friendshipLevel(points: number): FriendshipLevel | undefined {
  let lvl: FriendshipLevel | undefined;
  for (const l of FRIENDSHIP_LEVELS) if (points >= l.points) lvl = l;
  return lvl;
}

export function nextFriendshipLevel(points: number): FriendshipLevel | undefined {
  return FRIENDSHIP_LEVELS.find((l) => l.points > points);
}

export function streakBonus(streak: number): number {
  return Math.floor(Math.min(streak, 60) / 3);
}

export interface TraitInfo {
  id: TraitId;
  label: string;
  emoji: string;
  blurb: string;
}

export const TRAITS: TraitInfo[] = [
  { id: 'curious', label: 'Curious', emoji: '🔍', blurb: 'Always wondering how things work.' },
  { id: 'brave', label: 'Brave', emoji: '🦸', blurb: 'Happy to try new things, even scary ones.' },
  { id: 'kind', label: 'Kind', emoji: '💗', blurb: 'Notices when others need a hug.' },
  { id: 'playful', label: 'Playful', emoji: '🎈', blurb: 'Turns everything into a game.' },
  { id: 'calm', label: 'Calm', emoji: '🍃', blurb: 'Enjoys slow moments and quiet places.' },
  { id: 'creative', label: 'Creative', emoji: '🎨', blurb: 'Full of ideas and doodles.' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '💭', blurb: 'Thinks deeply about big questions.' },
  { id: 'silly', label: 'Silly', emoji: '🤪', blurb: 'Loves a good joke (and a bad one).' },
];

export const MOODS = [
  { value: 1, label: 'Awful', emoji: '😣', color: '#d9645f' },
  { value: 2, label: 'Bad', emoji: '😞', color: '#eea27f' },
  { value: 3, label: 'Okay', emoji: '😐', color: '#e9dcc5' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#9fd3a8' },
  { value: 5, label: 'Great', emoji: '😄', color: '#4fae78' },
] as const;

export const PRONOUN_PRESETS = [
  { subject: 'they', object: 'them', possessive: 'their' },
  { subject: 'she', object: 'her', possessive: 'her' },
  { subject: 'he', object: 'him', possessive: 'his' },
  { subject: 'it', object: 'it', possessive: 'its' },
];

export const EGG_COLORS = [
  { id: 'blue', label: 'Blue', color: '#7fb8e6' },
  { id: 'orange', label: 'Orange', color: '#f4a86a' },
  { id: 'pink', label: 'Pink', color: '#f3a6c0' },
  { id: 'green', label: 'Green', color: '#8fd19e' },
  { id: 'purple', label: 'Purple', color: '#b7a1e3' },
  { id: 'gray', label: 'Gray', color: '#b9bec7' },
];
