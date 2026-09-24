import type { DayKey } from '../lib/date';

export type { DayKey };

export type Mood = 1 | 2 | 3 | 4 | 5;
export type Stage = 'baby' | 'toddler' | 'child' | 'teen' | 'adult';
export type BodyPart = 'body' | 'belly' | 'beak' | 'headpatch' | 'wings' | 'cheeks' | 'feet';
export type ClothingSlot = 'head' | 'eyes' | 'neck' | 'body' | 'back';
export type FurnitureSlot =
  | 'wallpaper'
  | 'floor'
  | 'window'
  | 'door'
  | 'bed'
  | 'dresser'
  | 'rug'
  | 'doormat'
  | 'lamp'
  | 'wallDecor'
  | 'plant'
  | 'toy'
  | 'ceiling';
export type ItemKind = 'clothing' | 'furniture' | 'dye';
export type ShopId = 'outfits' | 'furniture' | 'colors' | 'travel';
export type TraitId = 'curious' | 'brave' | 'kind' | 'playful' | 'calm' | 'creative' | 'thoughtful' | 'silly';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type Effort = 1 | 2 | 3;

export interface Pronouns {
  subject: string;
  object: string;
  possessive: string;
}

export type Schedule =
  | { type: 'once'; date?: DayKey }
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] }
  | { type: 'timesPerWeek'; times: number }
  | { type: 'everyNDays'; n: number; anchor: DayKey }
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'interval'; every: number; unit: 'day' | 'week' | 'month' | 'year' }
  | { type: 'yearly'; month: number; day: number };

export type ActivityType =
  | 'breathe'
  | 'reflection'
  | 'soundscape'
  | 'timer'
  | 'movement'
  | 'quiz'
  | 'grounding'
  | 'emotion'
  | 'affirmation'
  | 'kindness'
  | 'mood';

export interface ActivityLink {
  type: ActivityType;
  refId?: string;
}

export interface Goal {
  id: string;
  title: string;
  emoji: string;
  kind: 'goal' | 'upkeep';
  areaId?: string;
  room?: string;
  schedule: Schedule;
  timeOfDay: TimeOfDay;
  timesPerDay: number;
  effort: Effort;
  link?: ActivityLink;
  reminder?: string;
  notes?: string;
  showOnHome: boolean;
  status: 'active' | 'paused' | 'archived';
  createdAt: number;
  createdDay: DayKey;
  snoozedUntil?: DayKey;
  /** Last day this goal was fully completed (drives interval scheduling). */
  lastDoneDay?: DayKey;
  totalDone: number;
  order: number;
}

export interface Area {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: 'active' | 'paused' | 'archived';
  builtin: boolean;
  order: number;
}

export interface GoalDay {
  count: number;
  skipped?: boolean;
  times: number[];
  retro?: boolean;
  /** Rewards granted so far today, so undo can take them back. */
  energy: number;
  stones: number;
  bonus?: number;
}

export interface DayRecord {
  day: DayKey;
  energy: number;
  stonesEarned: number;
  goals: Record<string, GoalDay>;
  goalOfDay?: string;
  goalOfDayPaid?: boolean;
  /** Counters that daily quests check against (goal, breathe, reflect, outfit…). */
  events: Record<string, number>;
  questsClaimed: string[];
  lowMood?: boolean;
  firstAidDismissed?: boolean;
  giftClaimed?: boolean;
  shopRefreshes: Partial<Record<ShopId, number>>;
  /** Did something same-day (drives streaks). */
  active: boolean;
  motivation?: Mood;
  satisfaction?: Mood;
  intention?: string;
  patPoints?: number;
}

export interface AdventureState {
  day: DayKey;
  status: 'charging' | 'adventuring' | 'home';
  startedAt?: number;
  endsAt?: number;
  destination?: string;
}

export type Opinion = 'love' | 'like' | 'neutral' | 'dislike';

export interface Discovery {
  id: string;
  day: DayKey;
  at: number;
  category: string;
  name: string;
  emoji: string;
  blurb: string;
  opinion: Opinion;
  locationId: string;
  locationSpecific: boolean;
  /** Set for location-specific discoveries (counts toward location completion). */
  locationDiscoveryId?: string;
  responses: { text: string; trait: TraitId }[];
  answered?: number;
  reflectionId?: string;
}

export interface PendingReturn {
  id: string;
  discoveryId: string;
  locationId: string;
  traveledTo?: string;
  stageUp?: Stage;
  micropetGrew?: string;
  stones: number;
}

export interface BirbState {
  name: string;
  pronouns: Pronouns;
  hatchedAt: number;
  eggColor: string;
  colors: Record<BodyPart, string>;
  startingTrait: TraitId;
  traits: Record<TraitId, number>;
  adventures: number;
  outfit: Partial<Record<ClothingSlot, string>>;
  activeMicropet?: string;
  inHouse: boolean;
}

export interface Micropet {
  id: string;
  species: string;
  variant: number;
  name: string;
  nature: string;
  hatchedAt: number;
  adventures: number;
  growable: boolean;
}

export interface Egg {
  receivedAt: number;
  linkedGoalId?: string;
  progress: number;
}

export interface MoodEntry {
  id: string;
  at: number;
  day: DayKey;
  mood: Mood;
  factors: string[];
  emotions: string[];
  note?: string;
  kind: 'log' | 'morning' | 'evening';
}

export interface ReflectionAnswer {
  question: string;
  text: string;
}

export interface Reflection {
  id: string;
  at: number;
  day: DayKey;
  promptId?: string;
  title: string;
  emoji: string;
  answers: ReflectionAnswer[];
  tags: string[];
  sentiment: number;
  discoveryId?: string;
  goalId?: string;
}

export interface ActivityEntry {
  id: string;
  at: number;
  day: DayKey;
  type: ActivityType;
  refId?: string;
  title: string;
  seconds?: number;
  energy: number;
  stones: number;
}

export interface QuizResult {
  id: string;
  at: number;
  day: DayKey;
  quizId: string;
  score: number;
  band: string;
  answers: number[];
}

export interface SavedLook<T> {
  id: string;
  name: string;
  data: T;
}

export interface ChallengeProgress {
  id: string;
  startedDay: DayKey;
  /** Day each step was completed, index-aligned with the challenge steps. */
  done: (DayKey | null)[];
  finishedDay?: DayKey;
}

export interface Settings {
  userName: string;
  dayStartHour: number;
  wakeTime: string;
  bedTime: string;
  weekStartsOn: 0 | 1;
  celebration: 'cheers' | 'reflect' | 'quiet';
  sound: boolean;
  theme: 'system' | 'light' | 'dark';
  notifications: boolean;
  streaksEnabled: boolean;
  autoTag: boolean;
}

export interface GameState {
  version: number;
  createdAt: number;
  onboarded: boolean;
  settings: Settings;
  birb: BirbState;
  stones: number;
  lifetimeStones: number;
  friendship: { points: number; pats: number };
  goals: Goal[];
  areas: Area[];
  days: Record<DayKey, DayRecord>;
  adventure: AdventureState;
  pendingReturns: PendingReturn[];
  discoveries: Discovery[];
  travel: {
    location: string;
    ticket?: string;
    freeTripUsed: boolean;
    visited: Record<string, { firstDay: DayKey; found: string[] }>;
  };
  inventory: Record<string, { at: number; source: 'shop' | 'event' | 'award' | 'starter' | 'challenge' }>;
  room: Partial<Record<FurnitureSlot, string>>;
  savedRooms: SavedLook<Partial<Record<FurnitureSlot, string>>>[];
  savedOutfits: SavedLook<Partial<Record<ClothingSlot, string>>>[];
  micropets: Micropet[];
  egg: Egg | null;
  moods: MoodEntry[];
  reflections: Reflection[];
  activities: ActivityEntry[];
  quizResults: QuizResult[];
  weeklyClaims: Record<string, Record<string, number>>;
  specialClaims: Record<string, number>;
  eventClaims: Record<string, number[]>;
  challenges: ChallengeProgress[];
  streak: { repairs: number; repairedDays: DayKey[]; pausedDays: DayKey[]; longest: number; milestone: number };
  pause: { from: DayKey; until: DayKey } | null;
  lastSeenDay: DayKey;
}
