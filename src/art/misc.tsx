import { useId } from 'react';
import { item } from '../data/catalog';
import { LOCATION_MAP } from '../data/locations';
import { shade } from '../data/palette';
import type { BodyPart, ClothingSlot } from '../state/types';
import { Birb } from './Birb';
import { FurnitureThumb } from './House';

export function Gem({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9ec4" />
          <stop offset="0.35" stopColor="#ffd86b" />
          <stop offset="0.65" stopColor="#8fe3b5" />
          <stop offset="1" stopColor="#8ab8ff" />
        </linearGradient>
      </defs>
      <path d="M 6 3 H 18 L 22 9 L 12 22 L 2 9 Z" fill={`url(#${id}g)`} stroke="#7a6aa8" strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M 2 9 H 22 M 8 3 L 6 9 L 12 22 L 18 9 L 16 3" fill="none" stroke="#fff" strokeWidth={1} opacity={0.7} />
    </svg>
  );
}

export function Bolt({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M 13 2 L 4 14 H 11 L 10 22 L 20 9 H 13 Z" fill="#ffc94a" stroke="#d89a1c" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  );
}

export function Egg({ color, progress = 0, total = 7, className, wobble = false }: { color: string; progress?: number; total?: number; className?: string; wobble?: boolean }) {
  const cracks = Math.floor((progress / total) * 4);
  return (
    <svg viewBox="0 0 100 120" className={className} role="img" aria-label="Egg">
      <ellipse cx={50} cy={112} rx={28} ry={5} fill="rgba(60,40,20,0.14)" />
      <g className={wobble ? 'egg-wobble' : undefined}>
        <path d="M 50 8 C 78 8 90 56 88 78 C 86 100 70 110 50 110 C 30 110 14 100 12 78 C 10 56 22 8 50 8 Z" fill={color} stroke={shade(color, 0.3)} strokeWidth={2.5} />
        <circle cx={34} cy={52} r={5} fill={shade(color, -0.35)} />
        <circle cx={64} cy={70} r={7} fill={shade(color, -0.35)} />
        <circle cx={46} cy={88} r={4} fill={shade(color, -0.35)} />
        <ellipse cx={36} cy={32} rx={6} ry={10} fill="#fff" opacity={0.35} transform="rotate(20 36 32)" />
        {cracks >= 1 && <path d="M 40 20 L 46 30 L 42 36" stroke="#5a4636" strokeWidth={2} fill="none" />}
        {cracks >= 2 && <path d="M 70 40 L 62 48 L 68 54" stroke="#5a4636" strokeWidth={2} fill="none" />}
        {cracks >= 3 && <path d="M 24 64 L 32 70 L 28 78 L 34 84" stroke="#5a4636" strokeWidth={2} fill="none" />}
      </g>
    </svg>
  );
}

export function DyeBottle({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <rect x={24} y={6} width={12} height={10} rx={2} fill="#b98a5e" />
      <path d="M 22 16 H 38 V 22 Q 50 28 50 40 Q 50 54 30 54 Q 10 54 10 40 Q 10 28 22 22 Z" fill="#eef6fb" stroke="#9fb5c4" strokeWidth={2} />
      <path d="M 12 38 Q 30 32 48 38 Q 48 52 30 52 Q 12 52 12 38 Z" fill={color} />
      <ellipse cx={20} cy={32} rx={3} ry={6} fill="#fff" opacity={0.6} />
    </svg>
  );
}

export const NEUTRAL_BIRB: Record<BodyPart, string> = {
  body: '#e6e1d8',
  belly: '#f8f5ef',
  headpatch: '#d8d2c6',
  wings: '#dcd6cb',
  cheeks: '#f3c4cc',
  beak: '#f0cf8a',
  feet: '#e0b98c',
};

const CLOTHING_CROP: Record<ClothingSlot, string> = {
  head: '20 -12 160 150',
  eyes: '30 40 140 130',
  neck: '20 70 160 150',
  body: '10 60 180 160',
  back: '-30 -10 260 220',
};

export function ItemThumb({ id, className = 'w-full h-full', colors }: { id: string; className?: string; colors?: Record<BodyPart, string> }) {
  const def = item(id);
  if (!def) return null;
  if (def.kind === 'dye') return <DyeBottle color={def.color} className={className} />;
  if (def.kind === 'clothing') {
    const slot = def.slot as ClothingSlot;
    return <Birb colors={colors ?? NEUTRAL_BIRB} outfit={{ [slot]: id }} animate={false} viewBox={CLOTHING_CROP[slot]} className={className} />;
  }
  return <FurnitureThumb id={id} className={className} />;
}

export function LocationScene({ locationId, className, children, fill = false }: { locationId: string; className?: string; children?: React.ReactNode; fill?: boolean }) {
  const loc = LOCATION_MAP[locationId] ?? LOCATION_MAP.forest;
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={loc.name} preserveAspectRatio={fill ? 'xMidYMax slice' : undefined}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={loc.sky[0]} />
          <stop offset="1" stopColor={loc.sky[1]} />
        </linearGradient>
      </defs>
      <rect width={400} height={300} fill={`url(#${id}sky)`} />
      <circle cx={320} cy={60} r={26} fill="#fff6c9" opacity={0.9} />
      <g fill="#fff" opacity={0.8}>
        <ellipse cx={90} cy={60} rx={34} ry={10} />
        <ellipse cx={108} cy={52} rx={20} ry={11} />
        <ellipse cx={240} cy={40} rx={26} ry={8} />
      </g>
      <path d="M 0 200 Q 80 150 170 190 T 400 180 V 300 H 0 Z" fill={loc.hill} />
      <text x={290} y={196} fontSize={72} textAnchor="middle">
        {loc.emoji}
      </text>
      <path d="M 0 236 Q 120 214 220 232 T 400 226 V 300 H 0 Z" fill={loc.ground} />
      {children}
    </svg>
  );
}
