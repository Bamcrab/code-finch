import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Birb, type Expression } from '../../art/Birb';
import { House } from '../../art/House';
import { LocationScene } from '../../art/misc';
import { item } from '../../data/catalog';
import { shade } from '../../data/palette';
import { Micropet } from '../../art/Micropet';
import { GREETINGS, HIGH_MOOD_LINES, IDLE_LINES, LOW_MOOD_LINES, PET_LINES, SLEEP_LINES, fill } from '../../data/dialogue';
import { HOME_LOCATION, LOCATION_MAP } from '../../data/locations';
import { MICROPET_GROW_ADVENTURES } from '../../game/constants';
import { chime } from '../../lib/audio';
import { dayPart } from '../../lib/date';
import { useLatestMood, useSky, useStage, useToday } from '../../state/hooks';
import { useGame } from '../../state/store';
import { cx } from '../../ui/kit';

interface Heart {
  id: number;
  x: number;
  y: number;
}

function pickLine(lines: readonly string[]) {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function Scene({ onBirbTap, hasStory }: { onBirbTap?: () => void; hasStory: boolean }) {
  const birb = useGame((s) => s.birb);
  const room = useGame((s) => s.room);
  const userName = useGame((s) => s.settings.userName);
  const adventure = useGame((s) => s.adventure);
  const location = useGame((s) => s.travel.location);
  const micropets = useGame((s) => s.micropets);
  const pat = useGame((s) => s.actions.pat);
  const updateBirb = useGame((s) => s.actions.updateBirb);
  const stage = useStage();
  const today = useToday();
  const mood = useLatestMood(today);
  const { sky, asleep } = useSky();

  const [line, setLine] = useState<string | null>(null);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [happy, setHappy] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; y: number; moved: number; last: number } | null>(null);
  const lineTimer = useRef<number | undefined>(undefined);

  const away = adventure.status === 'adventuring';
  const showLocation = !birb.inHouse && location !== HOME_LOCATION;
  const pet = micropets.find((m) => m.id === birb.activeMicropet);
  const vars = useMemo(() => ({ user: userName || 'friend', name: birb.name }), [userName, birb.name]);

  const say = useCallback(
    (text: string, ms = 4500) => {
      setLine(text);
      window.clearTimeout(lineTimer.current);
      lineTimer.current = window.setTimeout(() => setLine(null), ms);
    },
    [],
  );

  useEffect(() => {
    if (away) return;
    const t = window.setTimeout(() => {
      if (hasStory) say("I'm back! I have so much to tell you! ✨", 8000);
      else if (asleep) say(pickLine(SLEEP_LINES));
      else say(fill(pickLine(GREETINGS[dayPart(Date.now())]), vars));
    }, 600);
    return () => window.clearTimeout(t);
  }, [away, hasStory]); // eslint-disable-line react-hooks/exhaustive-deps

  const talk = () => {
    if (hasStory && onBirbTap) {
      onBirbTap();
      return;
    }
    if (asleep) {
      say(pickLine(SLEEP_LINES));
      return;
    }
    const pool = mood && mood.mood <= 2 ? [...LOW_MOOD_LINES, ...IDLE_LINES.slice(0, 4)] : mood && mood.mood >= 4 ? [...HIGH_MOOD_LINES, ...IDLE_LINES] : IDLE_LINES;
    say(fill(pickLine(pool), vars));
    chime('pat');
  };

  const addHeart = (clientX: number, clientY: number) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const h = { id: Date.now() + Math.random(), x: clientX - r.left, y: clientY - r.top };
    setHearts((hs) => [...hs.slice(-12), h]);
    window.setTimeout(() => setHearts((hs) => hs.filter((x) => x.id !== h.id)), 1100);
  };

  const onDown = (e: React.PointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY, moved: 0, last: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    p.moved += d;
    p.x = e.clientX;
    p.y = e.clientY;
    const now = Date.now();
    if (p.moved > 14 && now - p.last > 140) {
      p.last = now;
      addHeart(e.clientX, e.clientY);
      chime('pat');
      setHappy(true);
      const gained = pat();
      if (gained) say(pickLine(PET_LINES));
    }
  };
  const onUp = () => {
    const p = press.current;
    press.current = null;
    if (p && p.moved <= 14) talk();
    window.setTimeout(() => setHappy(false), 900);
  };

  const expression: Expression = asleep && !hasStory ? 'closed' : happy ? 'happy' : mood && mood.mood <= 2 ? 'sad' : 'open';
  const birbEl = (x: number, y: number, w: number) => (
    <svg x={x} y={y} width={w} height={(w * 240) / 260} viewBox="-30 -40 260 240" overflow="visible">
      <g onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ cursor: 'grab', touchAction: 'none' }}>
        <rect x={20} y={0} width={160} height={200} fill="transparent" />
        <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={expression} flap={happy} />
      </g>
    </svg>
  );
  const petEl = (x: number, y: number) =>
    pet && (
      <svg x={x} y={y} width={54} height={54} viewBox="0 0 100 100">
        <Micropet species={pet.species} variant={pet.variant} grown={pet.growable ? pet.adventures >= MICROPET_GROW_ADVENTURES : false} />
      </svg>
    );

  return (
    <div ref={wrap} className="relative aspect-[4/3] rounded-[28px] overflow-hidden shadow-card bg-surface-2 select-none">
      {showLocation ? (
        <LocationScene locationId={location} className="w-full h-full">
          {!away && birbEl(135, 150, 130)}
          {!away && petEl(86, 232)}
        </LocationScene>
      ) : (
        <House room={room} sky={sky} night={sky === 'night'} className="w-full h-full">
          {!away && (asleep && !hasStory ? birbEl(58, 92, 112) : birbEl(140, 152, 130))}
          {asleep && !away && !hasStory && (
            <g pointerEvents="none">
              {/* Tuck the sleeping birb in under a blanket matching the bed. */}
              <path d="M 72 190 Q 114 180 164 186 L 164 208 Q 118 212 72 208 Z" fill={item(room.bed)?.color ?? '#8cc8ec'} stroke={shade(item(room.bed)?.color ?? '#8cc8ec', 0.3)} strokeWidth={2} />
              <path d="M 74 196 Q 114 187 162 193" stroke={shade(item(room.bed)?.color ?? '#8cc8ec', -0.3)} strokeWidth={3} fill="none" />
              <text x={140} y={120} fontSize={18} fontWeight={900} fill="#8ea2d8" className="float">
                z Z z
              </text>
            </g>
          )}
          {!away && petEl(asleep ? 168 : 90, 234)}
          {away && (
            <g>
              <rect x={170} y={214} width={72} height={40} rx={6} fill="#fffaf0" stroke="#c9b48f" strokeWidth={2} transform="rotate(-4 206 234)" />
              <text x={206} y={232} fontSize={11} textAnchor="middle" fontWeight={800} fill="#6b5a4a" transform="rotate(-4 206 234)">
                Out exploring!
              </text>
              <text x={206} y={246} fontSize={10} textAnchor="middle" fill="#6b5a4a" transform="rotate(-4 206 234)">
                back soon ♥
              </text>
            </g>
          )}
        </House>
      )}

      {hearts.map((h) => (
        <span key={h.id} className="heart-float absolute text-xl" style={{ left: h.x, top: h.y - 10 }}>
          💗
        </span>
      ))}

      {line && !away && (
        <div
          className="pop-in absolute left-1/2 -translate-x-1/2 max-w-[80%] rounded-2xl bg-surface/95 px-3.5 py-2 text-sm font-bold shadow-card text-center"
          style={{ top: asleep && !hasStory ? '14%' : '22%' }}
          onClick={talk}
        >
          {line}
          <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-surface/95" />
        </div>
      )}
      {hasStory && !away && (
        <button onClick={onBirbTap} className="absolute right-3 top-3 pop-in rounded-full bg-warm text-white font-black px-3 h-9 shadow-card animate-bounce">
          ❗ Story time
        </button>
      )}

      {location !== HOME_LOCATION && !away && (
        <button
          onClick={() => updateBirb({ inHouse: !birb.inHouse })}
          className={cx('absolute left-3 top-3 rounded-full bg-surface/90 px-3 h-8 text-xs font-extrabold shadow-card')}
        >
          {birb.inHouse ? `📍 ${LOCATION_MAP[location]?.name}` : '🏠 Home'}
        </button>
      )}
    </div>
  );
}
