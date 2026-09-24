import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Birb } from '../art/Birb';
import { DyeBottle, ItemThumb } from '../art/misc';
import { DYE_PARTS, ITEM_MAP, PART_LABELS, type ItemDef } from '../data/catalog';
import { CLOTHING_SLOTS, SLOT_LABELS } from '../data/styles';
import { STAGES, unlockedParts } from '../game/constants';
import { defaultColors } from '../game/engine';
import { useStage } from '../state/hooks';
import { useGame } from '../state/store';
import type { BodyPart, ClothingSlot } from '../state/types';
import { Button, Chip, Empty, Page, SectionTitle, Segmented, Sheet, cx, inputClass } from '../ui/kit';

export default function Wardrobe() {
  const nav = useNavigate();
  const birb = useGame((s) => s.birb);
  const inventory = useGame((s) => s.inventory);
  const saved = useGame((s) => s.savedOutfits);
  const a = useGame((s) => s.actions);
  const stage = useStage();
  const [tab, setTab] = useState<'clothes' | 'colors' | 'saved'>('clothes');
  const [slot, setSlot] = useState<ClothingSlot>('head');
  const [part, setPart] = useState<BodyPart>('body');
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const parts = unlockedParts(birb.adventures);

  const owned = useMemo(() => {
    const out: ItemDef[] = [];
    for (const id of Object.keys(inventory)) {
      const it = ITEM_MAP[id];
      if (it) out.push(it);
    }
    return out;
  }, [inventory]);

  const clothes = owned.filter((it) => it.kind === 'clothing' && it.slot === slot);
  const dyes = owned.filter((it) => it.kind === 'dye' && it.slot === part);
  const partUnlocked = parts.includes(part);
  const unlockStage = STAGES.find((s) => s.unlocksParts.includes(part));

  return (
    <Page back title="Wardrobe" right={<Button size="sm" variant="soft" onClick={() => nav('/shop/outfits')}>🛍️ Shop</Button>}>
      <div className="rounded-[28px] bg-gradient-to-b from-sky-soft to-surface shadow-card">
        <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} className="w-56 h-56 mx-auto" />
      </div>
      <Segmented
        className="mt-3"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'clothes', label: '👕 Clothes' },
          { value: 'colors', label: '🎨 Colors' },
          { value: 'saved', label: '⭐ Outfits' },
        ]}
      />

      {tab === 'clothes' && (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-4 px-4">
            {CLOTHING_SLOTS.map((s) => (
              <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
                {SLOT_LABELS[s]}
                {birb.outfit[s] && ' •'}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <button onClick={() => a.equip(slot, undefined)} className={cx('aspect-square rounded-2xl bg-surface grid place-items-center text-2xl border-2', !birb.outfit[slot] ? 'border-accent' : 'border-transparent')}>
              🚫
            </button>
            {clothes.map((it) => (
              <button key={it.id} aria-label={it.name} onClick={() => a.equip(slot, birb.outfit[slot] === it.id ? undefined : it.id)} className={cx('aspect-square rounded-2xl bg-surface p-1 border-2', birb.outfit[slot] === it.id ? 'border-accent' : 'border-transparent')}>
                <ItemThumb id={it.id} colors={birb.colors} />
              </button>
            ))}
          </div>
          {!clothes.length && <p className="text-sm text-muted text-center mt-4">No {SLOT_LABELS[slot].toLowerCase()} yet—visit the shop!</p>}
        </>
      )}

      {tab === 'colors' && (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-4 px-4">
            {DYE_PARTS.map((p) => (
              <Chip key={p} active={part === p} onClick={() => setPart(p)}>
                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: birb.colors[p] }} />
                {PART_LABELS[p]}
                {!parts.includes(p) && ' 🔒'}
              </Chip>
            ))}
          </div>
          {partUnlocked ? (
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={() => a.setColor(part, 'default')} className={cx('aspect-square rounded-2xl bg-surface p-1 border-2 relative', birb.colors[part] === defaultColors(birb.eggColor)[part] ? 'border-accent' : 'border-transparent')}>
                <DyeBottle color={defaultColors(birb.eggColor)[part]} />
                <span className="absolute bottom-1 inset-x-0 text-[9px] font-black">Original</span>
              </button>
              {dyes.map((it) => (
                <button key={it.id} aria-label={it.name} onClick={() => a.setColor(part, it.id)} className={cx('aspect-square rounded-2xl bg-surface p-1 border-2', birb.colors[part] === it.color ? 'border-accent' : 'border-transparent')}>
                  <DyeBottle color={it.color} />
                </button>
              ))}
            </div>
          ) : (
            <Empty emoji="🔒" title={`${PART_LABELS[part]} color locked`}>
              Unlocks when {birb.name} becomes {/^[aeiou]/i.test(unlockStage?.label ?? '') ? 'an' : 'a'} {unlockStage?.label.toLowerCase()} ({(unlockStage?.startsAt ?? 0) - birb.adventures} more adventures).
            </Empty>
          )}
          {partUnlocked && !dyes.length && <p className="text-sm text-muted text-center mt-4">Buy dyes in the Dye Studio to recolor {birb.pronouns.possessive} {PART_LABELS[part].toLowerCase()}.</p>}
        </>
      )}

      {tab === 'saved' && (
        <>
          <Button block variant="soft" className="mt-3" onClick={() => setNaming(true)}>
            ⭐ Save current outfit
          </Button>
          <SectionTitle>Saved outfits</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {saved.map((o) => (
              <div key={o.id} className="rounded-3xl bg-surface shadow-card p-2 text-center">
                <Birb colors={birb.colors} outfit={o.data} scale={stage.scale} animate={false} className="w-full h-28" />
                <p className="font-bold text-sm truncate">{o.name}</p>
                <div className="flex gap-1 mt-1">
                  <Button size="sm" block onClick={() => a.applyLook('outfit', o.id)}>
                    Wear
                  </Button>
                  <Button size="sm" variant="ghost" aria-label="Delete outfit" onClick={() => a.deleteLook('outfit', o.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!saved.length && <p className="text-sm text-muted text-center">No saved outfits yet.</p>}
        </>
      )}

      <Sheet open={naming} onClose={() => setNaming(false)} title="Name this outfit">
        <input autoFocus className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cozy Sunday" />
        <Button
          block
          size="lg"
          className="mt-4"
          disabled={!name.trim()}
          onClick={() => {
            a.saveLook('outfit', name.trim());
            setName('');
            setNaming(false);
          }}
        >
          Save
        </Button>
      </Sheet>
    </Page>
  );
}
