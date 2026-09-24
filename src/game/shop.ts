import { ITEMS, type ItemDef } from '../data/catalog';
import { HOME_LOCATION, LOCATIONS, type LocationDef } from '../data/locations';
import { CLOTHING_STYLES, FURNITURE_STYLES, type StyleDef } from '../data/styles';
import type { DayKey } from '../lib/date';
import { randInt, sample, seeded } from '../lib/rng';
import type { BodyPart } from '../state/types';
import { SHOP_SLOTS, TRAVEL_HOME_PRICE, TRAVEL_PRICE } from './constants';

export interface ShopContext {
  day: DayKey;
  refreshes: number;
  owned: Record<string, unknown>;
  location: string;
  month: number;
  unlockedParts: BodyPart[];
}

function weightedSample(rand: () => number, items: ItemDef[], weight: (i: ItemDef) => number, n: number): ItemDef[] {
  const pool = items.map((it) => ({ it, key: Math.pow(rand(), 1 / Math.max(0.0001, weight(it))) }));
  pool.sort((a, b) => b.key - a.key);
  return pool.slice(0, n).map((p) => p.it);
}

function rotationWeight(it: ItemDef, month: number): number {
  if (it.rarity === 'event') {
    if (it.eventMonth === month) return 0; // current event items are earned, not sold
    const prev = month === 1 ? 12 : month - 1;
    if (it.eventMonth === prev) return 3;
    // Holiday items (Oct/Dec) only appear around their month.
    if ((it.eventMonth === 10 || it.eventMonth === 12) && it.eventMonth !== month + 1) return 0;
    return 0.35;
  }
  if (it.rarity === 'rare') return 0.5;
  return 1;
}

export function rotation(kind: 'clothing' | 'furniture', ctx: ShopContext): ItemDef[] {
  const rand = seeded(`shop:${kind}:${ctx.day}:${ctx.refreshes}`);
  const pool = ITEMS.filter(
    (it) =>
      it.kind === kind &&
      (it.rarity === 'common' || it.rarity === 'rare' || it.rarity === 'event') &&
      !(it.id in ctx.owned),
  );
  return weightedSample(rand, pool, (it) => rotationWeight(it, ctx.month), SHOP_SLOTS).filter(
    (it) => rotationWeight(it, ctx.month) > 0,
  );
}

export function locationItems(kind: 'clothing' | 'furniture', location: string): ItemDef[] {
  if (location === HOME_LOCATION) return [];
  return ITEMS.filter((it) => it.kind === kind && it.locationId === location);
}

export function everydayStyles(kind: 'clothing' | 'furniture'): StyleDef[] {
  return (kind === 'clothing' ? CLOTHING_STYLES : FURNITURE_STYLES).filter((s) => s.everyday);
}

export function dyeRotation(ctx: ShopContext): ItemDef[] {
  const rand = seeded(`shop:colors:${ctx.day}:${ctx.refreshes}`);
  const pool = ITEMS.filter(
    (it) => it.kind === 'dye' && ctx.unlockedParts.includes(it.slot as BodyPart) && !(it.id in ctx.owned),
  );
  return sample(rand, pool, SHOP_SLOTS);
}

export function travelOptions(day: DayKey, current: string): { loc: LocationDef; price: number }[] {
  const rand = seeded(`travel:${day}`);
  const away = LOCATIONS.filter((l) => l.id !== current && l.id !== HOME_LOCATION);
  const picks = sample(rand, away, current === HOME_LOCATION ? 9 : 8);
  const out = picks.map((loc) => ({ loc, price: TRAVEL_PRICE }));
  if (current !== HOME_LOCATION) {
    const home = LOCATIONS.find((l) => l.id === HOME_LOCATION)!;
    out.unshift({ loc: home, price: TRAVEL_HOME_PRICE });
  }
  return out;
}

export function dailyGiftAmount(day: DayKey): number {
  return randInt(seeded(`gift:${day}`), 65, 80);
}
