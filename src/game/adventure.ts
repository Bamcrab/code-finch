import { CATEGORY_MAP, DISCOVERY_CATEGORIES, type DiscoveryCategory } from '../data/discoveries';
import { HOME_LOCATION, LOCATION_MAP } from '../data/locations';
import { pick, sample } from '../lib/rng';
import type { DayKey } from '../lib/date';
import type { Discovery, Opinion } from '../state/types';
import { MINUTES_PER_ENERGY, stageFor } from './constants';

export function neededEnergy(adventures: number): number {
  return stageFor(adventures).fullEnergy;
}

export function adventureDurationMs(adventures: number): number {
  return stageFor(adventures).adventureHours * 3_600_000;
}

/** How far to pull an adventure's end time in for `energy` extra points. */
export function energyToMs(energy: number): number {
  return energy * MINUTES_PER_ENERGY * 60_000;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  food: 3,
  drinks: 1.5,
  desserts: 2,
  books: 1.5,
  music: 1.5,
  movies: 1.5,
  games: 1.5,
  activities: 2,
  nature: 2.5,
  items: 1.5,
  places: 1.5,
};

function weightedCategory(rand: () => number): DiscoveryCategory {
  const total = DISCOVERY_CATEGORIES.reduce((s, c) => s + (CATEGORY_WEIGHTS[c.id] ?? 1), 0);
  let r = rand() * total;
  for (const c of DISCOVERY_CATEGORIES) {
    r -= CATEGORY_WEIGHTS[c.id] ?? 1;
    if (r <= 0) return c;
  }
  return DISCOVERY_CATEGORIES[0];
}

function categoryFor(id: string): DiscoveryCategory {
  if (id === 'shows') return CATEGORY_MAP.movies;
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.items;
}

function rollOpinion(rand: () => number, opinions: boolean): Opinion {
  const r = rand();
  if (!opinions) return r < 0.3 ? 'like' : 'neutral';
  if (r < 0.2) return 'love';
  if (r < 0.65) return 'like';
  if (r < 0.75) return 'neutral';
  return 'dislike';
}

export interface DiscoveryInput {
  rand: () => number;
  id: string;
  day: DayKey;
  now: number;
  locationId: string;
  /** Location-discovery ids already found at this location. */
  foundHere: string[];
  /** All previous discovery keys ("category:name") to prefer fresh ones. */
  seen: Set<string>;
}

export function generateDiscovery(input: DiscoveryInput): Discovery {
  const { rand } = input;
  const loc = LOCATION_MAP[input.locationId] ?? LOCATION_MAP[HOME_LOCATION];
  const unfound = loc.discoveries.filter((d) => !input.foundHere.includes(d.id));
  const locationChance = input.locationId === HOME_LOCATION ? 0.25 : 0.6;
  if (unfound.length && rand() < locationChance) {
    const ld = pick(rand, unfound);
    const cat = categoryFor(ld.category);
    return {
      id: input.id,
      day: input.day,
      at: input.now,
      category: cat.id,
      name: ld.name,
      emoji: ld.emoji,
      blurb: ld.blurb,
      opinion: rollOpinion(rand, cat.opinions),
      locationId: loc.id,
      locationSpecific: true,
      locationDiscoveryId: ld.id,
      responses: sample(rand, cat.responses, 2),
    };
  }
  const cat = weightedCategory(rand);
  const fresh = cat.items.filter((it) => !input.seen.has(`${cat.id}:${it.name}`));
  const it = pick(rand, fresh.length ? fresh : cat.items);
  return {
    id: input.id,
    day: input.day,
    at: input.now,
    category: cat.id,
    name: it.name,
    emoji: it.emoji,
    blurb: it.blurb,
    opinion: rollOpinion(rand, cat.opinions),
    locationId: loc.id,
    locationSpecific: false,
    responses: sample(rand, cat.responses, 2),
  };
}

export function discoveryKey(d: Pick<Discovery, 'category' | 'name'>): string {
  return `${d.category}:${d.name}`;
}
