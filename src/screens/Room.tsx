import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Birb } from '../art/Birb';
import { House } from '../art/House';
import { ItemThumb } from '../art/misc';
import { ITEM_MAP, type ItemDef } from '../data/catalog';
import { FURNITURE_SLOTS, SLOT_LABELS } from '../data/styles';
import { useSky, useStage } from '../state/hooks';
import { useGame } from '../state/store';
import type { FurnitureSlot } from '../state/types';
import { Button, Chip, Page, SectionTitle, Segmented, Sheet, Toggle, cx, inputClass } from '../ui/kit';

const REQUIRED: FurnitureSlot[] = ['wallpaper', 'floor'];

export default function Room() {
  const nav = useNavigate();
  const room = useGame((s) => s.room);
  const inventory = useGame((s) => s.inventory);
  const saved = useGame((s) => s.savedRooms);
  const birb = useGame((s) => s.birb);
  const a = useGame((s) => s.actions);
  const stage = useStage();
  const { sky } = useSky();
  const [slot, setSlot] = useState<FurnitureSlot>('wallpaper');
  const [tab, setTab] = useState<'decorate' | 'saved'>('decorate');
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [night, setNight] = useState(false);

  const owned = useMemo(() => {
    const out: ItemDef[] = [];
    for (const id of Object.keys(inventory)) {
      const it = ITEM_MAP[id];
      if (it?.kind === 'furniture') out.push(it);
    }
    return out;
  }, [inventory]);
  const items = owned.filter((it) => it.slot === slot);

  return (
    <Page back title="Decorate" right={<Button size="sm" variant="soft" onClick={() => nav('/shop/furniture')}>🛍️ Shop</Button>}>
      <div className="rounded-[28px] overflow-hidden shadow-card">
        <House room={room} sky={night ? 'night' : sky === 'night' ? 'day' : sky} night={night} className="w-full" onSlotClick={(s) => { setSlot(s); setTab('decorate'); }} highlight={tab === 'decorate' ? slot : undefined}>
          <svg x={140} y={152} width={130} height={120} viewBox="-30 -40 260 240" overflow="visible" pointerEvents="none">
            <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} />
          </svg>
        </House>
      </div>
      <p className="text-xs text-muted text-center mt-2">Tap anything in the room to change it.</p>
      <div className="flex items-center gap-2 mt-2">
        <Segmented
          className="flex-1"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'decorate', label: '🛋️ Decorate' },
            { value: 'saved', label: '⭐ Saved rooms' },
          ]}
        />
      </div>
      <Toggle checked={night} onChange={setNight} label="Preview at night" />

      {tab === 'decorate' ? (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {FURNITURE_SLOTS.map((s) => (
              <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
                {SLOT_LABELS[s]}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {!REQUIRED.includes(slot) && (
              <button onClick={() => a.place(slot, undefined)} className={cx('aspect-square rounded-2xl bg-surface grid place-items-center text-2xl border-2', !room[slot] ? 'border-accent' : 'border-transparent')}>
                🚫
              </button>
            )}
            {items.map((it) => (
              <button key={it.id} aria-label={it.name} onClick={() => a.place(slot, it.id)} className={cx('aspect-square rounded-2xl bg-surface p-1 border-2 overflow-hidden', room[slot] === it.id ? 'border-accent' : 'border-transparent')}>
                <ItemThumb id={it.id} />
              </button>
            ))}
          </div>
          {!items.length && <p className="text-sm text-muted text-center mt-4">You don't own any {SLOT_LABELS[slot].toLowerCase()} yet.</p>}
        </>
      ) : (
        <>
          <Button block variant="soft" className="mt-1" onClick={() => setNaming(true)}>
            ⭐ Save this room
          </Button>
          <SectionTitle>Saved rooms</SectionTitle>
          <div className="flex flex-col gap-3">
            {saved.map((r) => (
              <div key={r.id} className="rounded-3xl bg-surface shadow-card overflow-hidden">
                <House room={r.data} className="w-full" />
                <div className="flex items-center gap-2 p-3">
                  <p className="font-black flex-1 truncate">{r.name}</p>
                  <Button size="sm" onClick={() => a.applyLook('room', r.id)}>
                    Use
                  </Button>
                  <Button size="sm" variant="ghost" aria-label="Delete room" onClick={() => a.deleteLook('room', r.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!saved.length && <p className="text-sm text-muted text-center">Save layouts to swap between them anytime.</p>}
        </>
      )}

      <Sheet open={naming} onClose={() => setNaming(false)} title="Name this room">
        <input autoFocus className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spooky season" />
        <Button
          block
          size="lg"
          className="mt-4"
          disabled={!name.trim()}
          onClick={() => {
            a.saveLook('room', name.trim());
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
