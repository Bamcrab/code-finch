import type { BodyPart, ClothingSlot, FurnitureSlot, ItemKind } from '../state/types';
import { CHALLENGES, awardItemId } from './challenges';
import { EVENTS } from './events';
import { LOCATIONS } from './locations';
import { PALETTE, hex } from './palette';
import { CLOTHING_STYLES, FURNITURE_STYLES, type StyleDef } from './styles';

export type Rarity = 'everyday' | 'common' | 'rare' | 'location' | 'event' | 'award';

export interface ItemDef {
  id: string;
  kind: ItemKind;
  slot: ClothingSlot | FurnitureSlot | BodyPart;
  name: string;
  art: string;
  color: string;
  accent?: string;
  emblem?: string;
  price: number;
  rarity: Rarity;
  styleId?: string;
  colorKey?: string;
  locationId?: string;
  eventMonth?: number;
  challengeId?: string;
}

const CLOTHING_SLOT_SET = new Set(['head', 'eyes', 'neck', 'body', 'back']);

function styleKind(style: StyleDef): ItemKind {
  return CLOTHING_SLOT_SET.has(style.slot) ? 'clothing' : 'furniture';
}

function fromStyles(styles: StyleDef[]): ItemDef[] {
  const out: ItemDef[] = [];
  for (const s of styles) {
    for (const c of s.colors) {
      out.push({
        id: `${s.id}:${c}`,
        kind: styleKind(s),
        slot: s.slot,
        name: `${PALETTE[c]?.name ?? c} ${s.name}`,
        art: s.id,
        color: hex(c),
        accent: s.accent ? hex(s.accent) : undefined,
        price: s.price,
        rarity: s.everyday ? 'everyday' : s.rare ? 'rare' : 'common',
        styleId: s.id,
        colorKey: c,
      });
    }
  }
  return out;
}

const ALL_STYLES = [...CLOTHING_STYLES, ...FURNITURE_STYLES];
const STYLE_MAP: Record<string, StyleDef> = Object.fromEntries(ALL_STYLES.map((s) => [s.id, s]));

export function styleOf(art: string): StyleDef | undefined {
  return STYLE_MAP[art];
}

function special(
  id: string,
  name: string,
  art: string,
  color: string,
  accent: string | undefined,
  price: number,
  rarity: Rarity,
  extra: Partial<ItemDef>,
): ItemDef {
  const style = STYLE_MAP[art];
  return {
    id,
    kind: style ? styleKind(style) : 'furniture',
    slot: style?.slot ?? 'wallDecor',
    name,
    art,
    color: hex(color),
    accent: accent ? hex(accent) : style?.accent ? hex(style.accent) : undefined,
    price,
    rarity,
    ...extra,
  };
}

const locationItems: ItemDef[] = LOCATIONS.flatMap((loc) =>
  loc.items.map((it) =>
    special(it.id, it.name, it.art, it.color, it.accent, it.price, 'location', { locationId: loc.id }),
  ),
);

const eventItems: ItemDef[] = EVENTS.flatMap((ev) =>
  ev.items.map((it) =>
    special(it.id, it.name, it.art, it.color, it.accent, 600, 'event', { eventMonth: ev.month }),
  ),
);

const awardItems: ItemDef[] = CHALLENGES.map((c) => ({
  id: awardItemId(c.id),
  kind: 'furniture' as const,
  slot: 'wallDecor' as const,
  name: `${c.name} Award`,
  art: 'wd-badge',
  color: hex(c.color),
  accent: hex('gold'),
  emblem: c.emoji,
  price: 0,
  rarity: 'award' as const,
  challengeId: c.id,
}));

export const DYE_PARTS: BodyPart[] = ['body', 'belly', 'beak', 'headpatch', 'wings', 'cheeks', 'feet'];
export const PART_LABELS: Record<BodyPart, string> = {
  body: 'Body',
  belly: 'Tummy',
  beak: 'Beak',
  headpatch: 'Headpatch',
  wings: 'Wings',
  cheeks: 'Cheeks',
  feet: 'Feet',
};

const DYE_EXCLUDE: Partial<Record<BodyPart, string[]>> = {
  cheeks: ['black', 'charcoal', 'navy', 'forest', 'gray', 'brown', 'white', 'silver'],
  belly: ['black'],
};

const dyeItems: ItemDef[] = DYE_PARTS.flatMap((part) =>
  Object.entries(PALETTE)
    .filter(([key]) => !DYE_EXCLUDE[part]?.includes(key))
    .map(([key, p]) => ({
      id: `dye:${part}:${key}`,
      kind: 'dye' as const,
      slot: part,
      name: `${p.name} ${PART_LABELS[part]} Dye`,
      art: 'dye',
      color: p.hex,
      price: 150 + ((key.length * 37 + part.length * 11) % 5) * 50,
      rarity: 'common' as const,
      colorKey: key,
    })),
);

export const ITEMS: ItemDef[] = [
  ...fromStyles(CLOTHING_STYLES),
  ...fromStyles(FURNITURE_STYLES),
  ...locationItems,
  ...eventItems,
  ...awardItems,
  ...dyeItems,
];

export const ITEM_MAP: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function item(id: string | undefined): ItemDef | undefined {
  return id ? ITEM_MAP[id] : undefined;
}

export function sellPrice(it: ItemDef): number {
  return Math.floor(it.price * 0.5);
}
