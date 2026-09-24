import { describe, expect, it } from 'vitest';
import { ITEMS } from '../data/catalog';
import { MICROPET_SPECIES } from '../data/micropets';
import { CLOTHING_ART } from './clothing';
import { FURNITURE_ART } from './furniture';

describe('art coverage', () => {
  it('every clothing and furniture item has a drawing', () => {
    const missing = ITEMS.filter((it) => it.kind !== 'dye').filter((it) => !(it.kind === 'clothing' ? CLOTHING_ART[it.art] : FURNITURE_ART[it.art]));
    expect(missing.map((m) => m.id)).toEqual([]);
  });

  it('every micropet species has three color variants', () => {
    for (const sp of MICROPET_SPECIES) expect(sp.variants).toHaveLength(3);
  });
});
