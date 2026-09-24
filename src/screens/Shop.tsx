import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Birb } from '../art/Birb';
import { House } from '../art/House';
import { ItemThumb, LocationScene } from '../art/misc';
import { ITEMS, ITEM_MAP, PART_LABELS, sellPrice, type ItemDef } from '../data/catalog';
import { HOME_LOCATION, LOCATION_MAP } from '../data/locations';
import { PALETTE } from '../data/palette';
import { SLOT_LABELS, type StyleDef } from '../data/styles';
import { STAGES, refreshCost, unlockedParts } from '../game/constants';
import { dailyGiftAmount, dyeRotation, everydayStyles, locationItems, rotation, travelOptions } from '../game/shop';
import { useDay, useStage, useToday } from '../state/hooks';
import { useGame } from '../state/store';
import type { BodyPart, ClothingSlot, FurnitureSlot, ShopId } from '../state/types';
import { Button, Card, Chip, Confirm, Empty, Page, Price, SectionTitle, Segmented, Sheet, StonesPill, cx } from '../ui/kit';
import { IconRefresh } from '../ui/icons';

const SHOPS: { id: ShopId; label: string; emoji: string; keeper: string; hello: string }[] = [
  { id: 'outfits', label: 'Outfits', emoji: '👒', keeper: '🦔 Mr. Hedge', hello: 'Fresh threads every day! Take a look, dear.' },
  { id: 'furniture', label: 'Furniture', emoji: '🛋️', keeper: '🐦 Robin', hello: 'Let\'s make your nest the coziest in the forest!' },
  { id: 'colors', label: 'Dyes', emoji: '🎨', keeper: '🦜 Pico', hello: 'A little color can change everything.' },
  { id: 'travel', label: 'Travel', emoji: '✈️', keeper: '🕊️ Gull', hello: 'Where to next, adventurer?' },
];

/** Inventory as of the start of today, so items bought today stay visible (as Owned) in the rotation. */
function ownedBeforeDay(inventory: Record<string, { at: number }>, today: string, dayStartHour: number) {
  const start = new Date(`${today}T00:00`).getTime() + dayStartHour * 3_600_000;
  return Object.fromEntries(Object.entries(inventory).filter(([, v]) => v.at < start));
}

function ItemCard({ it, owned, onClick }: { it: ItemDef; owned: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx('relative rounded-3xl bg-surface shadow-card p-2 text-center active:scale-[0.97] transition', owned && 'opacity-60')}>
      {it.rarity === 'rare' && <span className="absolute left-2 top-2 text-xs">✨</span>}
      {it.rarity === 'event' && <span className="absolute left-2 top-2 text-xs">🎉</span>}
      {it.rarity === 'location' && <span className="absolute left-2 top-2 text-xs">📍</span>}
      <div className="aspect-square rounded-2xl bg-surface-2 overflow-hidden">
        <ItemThumb id={it.id} />
      </div>
      <p className="text-[11px] font-bold leading-tight mt-1.5 line-clamp-2 min-h-7">{it.name}</p>
      <div className="text-xs mt-0.5">{owned ? <span className="font-black text-accent">Owned</span> : <Price amount={it.price} />}</div>
    </button>
  );
}

function Preview({ it }: { it: ItemDef }) {
  const birb = useGame((s) => s.birb);
  const room = useGame((s) => s.room);
  const stage = useStage();
  if (it.kind === 'clothing') {
    return <Birb colors={birb.colors} outfit={{ ...birb.outfit, [it.slot as ClothingSlot]: it.id }} scale={stage.scale} expression="happy" className="w-56 h-56 mx-auto" />;
  }
  if (it.kind === 'dye') {
    return <Birb colors={{ ...birb.colors, [it.slot as BodyPart]: it.color }} outfit={birb.outfit} scale={stage.scale} className="w-56 h-56 mx-auto" />;
  }
  return (
    <div className="rounded-3xl overflow-hidden shadow-card">
      <House room={{ ...room, [it.slot as FurnitureSlot]: it.id }} className="w-full" highlight={it.slot as FurnitureSlot} onSlotClick={() => undefined} />
    </div>
  );
}

function BuySheet({ it, onClose }: { it: ItemDef; onClose: () => void }) {
  const stones = useGame((s) => s.stones);
  const owned = useGame((s) => !!s.inventory[it.id]);
  const a = useGame((s) => s.actions);
  const nav = useNavigate();
  return (
    <Sheet open onClose={onClose} title={it.name}>
      <Preview it={it} />
      <p className="text-center text-sm text-muted mt-3">
        {SLOT_LABELS[it.slot] ?? PART_LABELS[it.slot as BodyPart]} · {it.rarity === 'everyday' ? 'Everyday collection' : it.rarity}
      </p>
      {owned ? (
        <Button block size="lg" className="mt-4" variant="soft" onClick={() => nav(it.kind === 'furniture' ? '/birb/room' : '/birb/wardrobe')}>
          You own this · {it.kind === 'furniture' ? 'Decorate' : 'Wear it'}
        </Button>
      ) : (
        <Button
          block
          size="lg"
          className="mt-4"
          disabled={stones < it.price}
          onClick={() => {
            if (a.buy(it.id)) onClose();
          }}
        >
          {stones < it.price ? `Need ${it.price - stones} more` : 'Buy for'} <Price amount={it.price} />
        </Button>
      )}
    </Sheet>
  );
}

function EverydaySheet({ style, onClose }: { style: StyleDef; onClose: () => void }) {
  const inventory = useGame((s) => s.inventory);
  const [color, setColor] = useState(() => style.colors.find((c) => !inventory[`${style.id}:${c}`]) ?? style.colors[0]);
  const it = ITEM_MAP[`${style.id}:${color}`];
  const stones = useGame((s) => s.stones);
  const a = useGame((s) => s.actions);
  const owned = !!inventory[it.id];
  return (
    <Sheet open onClose={onClose} title={style.name}>
      <Preview it={it} />
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {style.colors.map((c) => (
          <button key={c} aria-label={PALETTE[c].name} onClick={() => setColor(c)} className={cx('w-9 h-9 rounded-full border-4 relative', color === c ? 'border-accent' : 'border-surface')} style={{ background: PALETTE[c].hex }}>
            {inventory[`${style.id}:${c}`] && <span className="absolute -right-1 -top-1 text-[10px]">✅</span>}
          </button>
        ))}
      </div>
      <p className="text-center font-bold mt-2">{it.name}</p>
      <Button block size="lg" className="mt-4" disabled={owned || stones < it.price} onClick={() => a.buy(it.id)}>
        {owned ? 'Owned' : stones < it.price ? `Need ${it.price - stones} more` : 'Buy for'} {!owned && <Price amount={it.price} />}
      </Button>
    </Sheet>
  );
}

function SellSheet({ kind, onClose }: { kind: 'clothing' | 'furniture' | 'dye'; onClose: () => void }) {
  const inventory = useGame((s) => s.inventory);
  const sell = useGame((s) => s.actions.sell);
  const [confirm, setConfirm] = useState<ItemDef | null>(null);
  const items = Object.keys(inventory)
    .map((id) => ITEM_MAP[id])
    .filter((it): it is ItemDef => !!it && it.kind === kind && it.rarity !== 'award');
  return (
    <Sheet open onClose={onClose} title="Sell items (half price)">
      {items.length ? (
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => (
            <button key={it.id} onClick={() => setConfirm(it)} className="rounded-2xl bg-surface p-2 text-center">
              <div className="aspect-square rounded-xl bg-surface-2 overflow-hidden">
                <ItemThumb id={it.id} />
              </div>
              <p className="text-[11px] font-bold truncate mt-1">{it.name}</p>
              <Price amount={sellPrice(it)} className="text-xs" />
            </button>
          ))}
        </div>
      ) : (
        <Empty emoji="🧺" title="Nothing to sell" />
      )}
      {confirm && (
        <Confirm
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => sell(confirm.id)}
          title={`Sell ${confirm.name}?`}
          body={`You'll get ${sellPrice(confirm)} stones. It will be removed from your collection.`}
          confirmLabel="Sell"
        />
      )}
    </Sheet>
  );
}

function CatalogSheet({ kind, onClose }: { kind: 'clothing' | 'furniture'; onClose: () => void }) {
  const inventory = useGame((s) => s.inventory);
  const slots = kind === 'clothing' ? ['head', 'eyes', 'neck', 'body', 'back'] : ['wallpaper', 'floor', 'window', 'door', 'bed', 'dresser', 'rug', 'doormat', 'lamp', 'wallDecor', 'plant', 'toy', 'ceiling'];
  const [slot, setSlot] = useState(slots[0]);
  const [preview, setPreview] = useState<ItemDef | null>(null);
  const list = ITEMS.filter((i) => i.kind === kind && i.slot === slot);
  const ownedCount = ITEMS.filter((i) => i.kind === kind && inventory[i.id]).length;
  const total = ITEMS.filter((i) => i.kind === kind).length;
  return (
    <Sheet open onClose={onClose} title={`Catalog · ${ownedCount}/${total} collected`}>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {slots.map((s) => (
          <Chip key={s} active={slot === s} onClick={() => setSlot(s)} className="h-8 text-xs">
            {SLOT_LABELS[s]}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {list.map((it) => (
          <button key={it.id} onClick={() => setPreview(it)} className={cx('aspect-square rounded-xl bg-surface p-1 relative', !inventory[it.id] && 'opacity-60')}>
            <ItemThumb id={it.id} />
            {inventory[it.id] && <span className="absolute right-0.5 top-0.5 text-[10px]">✅</span>}
          </button>
        ))}
      </div>
      {preview && (
        <Sheet open onClose={() => setPreview(null)} title={preview.name}>
          <Preview it={preview} />
          <p className="text-center text-sm text-muted mt-3">
            {inventory[preview.id]
              ? 'In your collection'
              : preview.rarity === 'everyday'
                ? 'Always available in the Everyday collection'
                : preview.rarity === 'location'
                  ? `Sold only in ${LOCATION_MAP[preview.locationId!]?.name}`
                  : preview.rarity === 'event'
                    ? 'A seasonal event item—sometimes returns to the shop'
                    : 'Watch for it in the daily rotation'}
          </p>
        </Sheet>
      )}
    </Sheet>
  );
}

function GoodsShop({ shop }: { shop: 'outfits' | 'furniture' }) {
  const kind = shop === 'outfits' ? 'clothing' : 'furniture';
  const today = useToday();
  const day = useDay(today);
  const inventory = useGame((s) => s.inventory);
  const location = useGame((s) => s.travel.location);
  const stones = useGame((s) => s.stones);
  const a = useGame((s) => s.actions);
  const [buying, setBuying] = useState<ItemDef | null>(null);
  const [everyday, setEveryday] = useState<StyleDef | null>(null);
  const [selling, setSelling] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const dayStartHour = useGame((s) => s.settings.dayStartHour);
  const refreshes = day.shopRefreshes[shop] ?? 0;
  const ownedBefore = useMemo(() => ownedBeforeDay(inventory, today, dayStartHour), [inventory, today, dayStartHour]);
  const items = useMemo(
    () => rotation(kind, { day: today, refreshes, owned: ownedBefore, location, month: Number(today.slice(5, 7)), unlockedParts: [] }),
    [kind, today, refreshes, ownedBefore, location],
  );
  const locItems = locationItems(kind, location);
  const cost = refreshCost(refreshes);

  return (
    <>
      {shop === 'outfits' && !day.giftClaimed && (
        <Card className="flex items-center gap-3 mb-3 bg-energy-soft">
          <span className="text-3xl">🎁</span>
          <div className="flex-1">
            <p className="font-black">Daily gift!</p>
            <p className="text-sm text-muted">Mr. Hedge saved some stones for you.</p>
          </div>
          <Button size="sm" onClick={() => a.claimGift()}>
            Claim <Price amount={dailyGiftAmount(today)} />
          </Button>
        </Card>
      )}
      <div className="flex items-center justify-between gap-2">
        <SectionTitle className="mt-2">Today's picks</SectionTitle>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setCatalog(true)}>
            📖
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelling(true)}>
            💰 Sell
          </Button>
          <Button size="sm" variant="soft" disabled={stones < cost} onClick={() => a.refreshShop(shop)}>
            <IconRefresh className="w-4 h-4" /> {cost ? <Price amount={cost} /> : 'Free'}
          </Button>
        </div>
      </div>
      {locItems.length > 0 && (
        <>
          <p className="text-xs font-black text-muted mb-2 px-1">📍 Only in {LOCATION_MAP[location]?.name}</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {locItems.map((it) => (
              <ItemCard key={it.id} it={it} owned={!!inventory[it.id]} onClick={() => setBuying(it)} />
            ))}
          </div>
        </>
      )}
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <ItemCard key={it.id} it={it} owned={!!inventory[it.id]} onClick={() => setBuying(it)} />
        ))}
      </div>
      <SectionTitle>Everyday collection</SectionTitle>
      <p className="text-xs text-muted -mt-1 mb-2 px-1">Always in stock, in any color.</p>
      <div className="grid grid-cols-3 gap-2">
        {everydayStyles(kind).map((st) => {
          const first = ITEM_MAP[`${st.id}:${st.colors[0]}`];
          const ownedN = st.colors.filter((c) => inventory[`${st.id}:${c}`]).length;
          return (
            <button key={st.id} onClick={() => setEveryday(st)} className="rounded-3xl bg-surface shadow-card p-2 text-center active:scale-[0.97] transition">
              <div className="aspect-square rounded-2xl bg-surface-2 overflow-hidden">
                <ItemThumb id={first.id} />
              </div>
              <p className="text-[11px] font-bold leading-tight mt-1.5 truncate">{st.name}</p>
              <p className="text-[10px] text-muted">
                {ownedN}/{st.colors.length} · <Price amount={st.price} />
              </p>
            </button>
          );
        })}
      </div>
      {buying && <BuySheet it={buying} onClose={() => setBuying(null)} />}
      {everyday && <EverydaySheet style={everyday} onClose={() => setEveryday(null)} />}
      {selling && <SellSheet kind={kind} onClose={() => setSelling(false)} />}
      {catalog && <CatalogSheet kind={kind} onClose={() => setCatalog(false)} />}
    </>
  );
}

function DyeShop() {
  const today = useToday();
  const day = useDay(today);
  const adventures = useGame((s) => s.birb.adventures);
  const inventory = useGame((s) => s.inventory);
  const stones = useGame((s) => s.stones);
  const a = useGame((s) => s.actions);
  const [buying, setBuying] = useState<ItemDef | null>(null);
  const [selling, setSelling] = useState(false);
  const dayStartHour = useGame((s) => s.settings.dayStartHour);
  const parts = useMemo(() => unlockedParts(adventures), [adventures]);
  const refreshes = day.shopRefreshes.colors ?? 0;
  const ownedBefore = useMemo(() => ownedBeforeDay(inventory, today, dayStartHour), [inventory, today, dayStartHour]);
  const items = useMemo(() => dyeRotation({ day: today, refreshes, owned: ownedBefore, location: '', month: 0, unlockedParts: parts }), [today, refreshes, ownedBefore, parts]);
  const toddler = STAGES[1];
  if (!parts.length) {
    return <Empty emoji="🎨" title="The Dye Studio is closed for babies">It opens when your birb becomes a toddler—{toddler.startsAt - adventures} more adventure{toddler.startsAt - adventures === 1 ? '' : 's'} to go!</Empty>;
  }
  const cost = refreshCost(refreshes);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <SectionTitle className="mt-2">Today's dyes</SectionTitle>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setSelling(true)}>
            💰 Sell
          </Button>
          <Button size="sm" variant="soft" disabled={stones < cost} onClick={() => a.refreshShop('colors')}>
            <IconRefresh className="w-4 h-4" /> {cost ? <Price amount={cost} /> : 'Free'}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted mb-2 px-1">Unlocked: {parts.map((p) => PART_LABELS[p]).join(', ')}. More parts unlock as your birb grows.</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <ItemCard key={it.id} it={it} owned={!!inventory[it.id]} onClick={() => setBuying(it)} />
        ))}
      </div>
      {buying && <BuySheet it={buying} onClose={() => setBuying(null)} />}
      {selling && <SellSheet kind="dye" onClose={() => setSelling(false)} />}
    </>
  );
}

function TravelShop() {
  const today = useToday();
  const travel = useGame((s) => s.travel);
  const adventure = useGame((s) => s.adventure);
  const birbName = useGame((s) => s.birb.name);
  const stones = useGame((s) => s.stones);
  const buyTicket = useGame((s) => s.actions.buyTicket);
  const adventures = useGame((s) => s.birb.adventures);
  const stage = useStage();
  const [picked, setPicked] = useState<{ id: string; price: number } | null>(null);
  const child = STAGES[2];
  if (stage.startsAt < child.startsAt) {
    return <Empty emoji="✈️" title="Travel unlocks when your birb is a child">{child.startsAt - adventures} more adventures to go. Until then, Finchie Forest is full of discoveries!</Empty>;
  }
  const options = travelOptions(today, travel.location);
  const pickedLoc = picked ? LOCATION_MAP[picked.id] : undefined;
  return (
    <>
      <Card className="flex items-center gap-3 mt-2">
        <span className="text-3xl">{LOCATION_MAP[travel.location]?.emoji}</span>
        <div className="flex-1">
          <p className="text-xs font-black text-muted uppercase">Currently in</p>
          <p className="font-black">{LOCATION_MAP[travel.location]?.name}</p>
        </div>
        {travel.ticket && <span className="text-sm font-bold text-accent">🎫 {LOCATION_MAP[travel.ticket]?.name}</span>}
      </Card>
      {travel.ticket ? (
        <p className="text-sm text-muted mt-3 px-1">
          You have a ticket to {LOCATION_MAP[travel.ticket]?.name}! {birbName} will fly there {adventure.status === 'charging' ? 'as soon as energy is full' : 'on the next adventure'}.
        </p>
      ) : (
        <>
          <SectionTitle>Today's flights</SectionTitle>
          <div className="flex flex-col gap-2">
            {options.map(({ loc, price }) => {
              const v = travel.visited[loc.id];
              const pct = v ? Math.round((v.found.length / Math.max(1, loc.discoveries.length)) * 100) : 0;
              const cost = travel.freeTripUsed ? price : 0;
              return (
                <button key={loc.id} onClick={() => setPicked({ id: loc.id, price })} className="flex items-center gap-3 rounded-3xl bg-surface shadow-card p-3 text-left active:scale-[0.99] transition">
                  <span className="w-12 h-12 rounded-2xl grid place-items-center text-2xl" style={{ background: loc.sky[0] }}>
                    {loc.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-black block">
                      {loc.name} <span className="text-xs text-muted font-bold">{loc.region}</span>
                    </span>
                    <span className="text-xs text-muted block truncate">{loc.blurb}</span>
                    <span className="text-[11px] font-bold text-accent">{v ? `${pct}% discovered` : 'Never visited'}</span>
                  </span>
                  <Price amount={cost} className="text-sm" />
                </button>
              );
            })}
          </div>
          {!travel.freeTripUsed && <p className="text-xs text-accent font-bold mt-2 px-1">✨ Your first flight is free!</p>}
        </>
      )}
      {picked && pickedLoc && (
        <Sheet open onClose={() => setPicked(null)} title={`${pickedLoc.emoji} ${pickedLoc.name}`}>
          <div className="rounded-3xl overflow-hidden">
            <LocationScene locationId={pickedLoc.id} className="w-full" />
          </div>
          <p className="mt-3">{pickedLoc.blurb}</p>
          {pickedLoc.items.length > 0 && (
            <>
              <p className="font-black text-sm mt-4 mb-2">Exclusive items sold there</p>
              <div className="grid grid-cols-4 gap-2">
                {pickedLoc.items.map((i) => (
                  <div key={i.id} className="aspect-square rounded-2xl bg-surface p-1">
                    <ItemThumb id={i.id} />
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="text-xs text-muted mt-3">Flights are one-way and count as an adventure. You'll depart once today's energy is full.</p>
          <Button
            block
            size="lg"
            className="mt-4"
            disabled={stones < (travel.freeTripUsed ? picked.price : 0)}
            onClick={() => {
              if (buyTicket(picked.id, picked.price)) setPicked(null);
            }}
          >
            Fly to {pickedLoc.name} · <Price amount={travel.freeTripUsed ? picked.price : 0} />
          </Button>
        </Sheet>
      )}
    </>
  );
}

export default function Shop() {
  const { tab } = useParams();
  const nav = useNavigate();
  const stones = useGame((s) => s.stones);
  const location = useGame((s) => s.travel.location);
  const shop = (SHOPS.find((s) => s.id === tab) ?? SHOPS[0]).id;
  const info = SHOPS.find((s) => s.id === shop)!;
  return (
    <Page title="Shop" right={<StonesPill amount={stones} />}>
      <Segmented value={shop} onChange={(v) => nav(`/shop/${v}`, { replace: true })} options={SHOPS.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }))} />
      <div className="flex items-center gap-2 mt-3 rounded-2xl bg-surface px-3 py-2">
        <span className="font-black text-sm shrink-0">{info.keeper}:</span>
        <span className="text-sm text-muted italic truncate">“{info.hello}”</span>
        {location !== HOME_LOCATION && shop !== 'travel' && <span className="ml-auto text-xs font-bold shrink-0">📍{LOCATION_MAP[location]?.name}</span>}
      </div>
      <div className="mt-2">
        {shop === 'outfits' && <GoodsShop shop="outfits" />}
        {shop === 'furniture' && <GoodsShop shop="furniture" />}
        {shop === 'colors' && <DyeShop />}
        {shop === 'travel' && <TravelShop />}
      </div>
    </Page>
  );
}
