import { useId, type ReactNode } from 'react';
import { item } from '../data/catalog';
import { shade } from '../data/palette';
import type { FurnitureSlot } from '../state/types';
import { FURNITURE_ART, SLOT_BOX, type Sky } from './furniture';

const BACK_ORDER: FurnitureSlot[] = ['wallpaper', 'floor', 'window', 'wallDecor', 'door', 'doormat', 'rug', 'bed', 'dresser', 'plant', 'toy'];
const GLOW_ORDER: FurnitureSlot[] = ['lamp', 'ceiling'];

export interface HouseProps {
  room: Partial<Record<FurnitureSlot, string | undefined>>;
  sky?: Sky;
  night?: boolean;
  children?: ReactNode;
  className?: string;
  onSlotClick?: (slot: FurnitureSlot) => void;
  highlight?: FurnitureSlot;
}

export function renderFurniture(id: string | undefined, key: string, uid: string, sky: Sky, night: boolean) {
  const def = item(id);
  if (!def) return null;
  const art = FURNITURE_ART[def.art];
  if (!art) return null;
  return (
    <g key={key}>
      {art({ c: def.color, a: def.accent ?? shade(def.color, -0.5), id: `${uid}-${key}`, sky, night, emblem: def.emblem })}
    </g>
  );
}

export function House({ room, sky = 'day', night = false, children, className, onSlotClick, highlight }: HouseProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Birbhouse">
      <rect x={0} y={0} width={400} height={208} fill="#f6ecd9" />
      <rect x={0} y={206} width={400} height={94} fill="#cfa77a" />
      {BACK_ORDER.map((slot) => {
        const node = renderFurniture(room[slot], slot, uid, sky, night);
        if (slot === 'floor') {
          return (
            <g key={slot}>
              {node}
              <rect x={0} y={202} width={400} height={8} fill="#f3e8d6" stroke="#d8c6ab" strokeWidth={1} />
              <rect x={0} y={210} width={400} height={10} fill={`url(#${uid}-floorShade)`} />
            </g>
          );
        }
        return node;
      })}
      <defs>
        <linearGradient id={`${uid}-floorShade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.12} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </linearGradient>
      </defs>
      {night && <rect x={0} y={0} width={400} height={300} fill="#15204a" opacity={0.42} style={{ mixBlendMode: 'multiply' }} />}
      {GLOW_ORDER.map((slot) => renderFurniture(room[slot], slot, uid, sky, night))}
      {onSlotClick &&
        (Object.keys(SLOT_BOX) as FurnitureSlot[])
          .filter((s) => s !== 'wallpaper' && s !== 'floor')
          .map((slot) => {
            const [x, y, w, h] = SLOT_BOX[slot];
            return (
              <rect
                key={`hit-${slot}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={6}
                fill={highlight === slot ? 'rgba(124,196,164,0.18)' : 'transparent'}
                stroke={highlight === slot ? '#5fae8a' : 'transparent'}
                strokeWidth={2}
                strokeDasharray="6 4"
                style={{ cursor: 'pointer' }}
                onClick={() => onSlotClick(slot)}
              />
            );
          })}
      {children}
    </svg>
  );
}

/** Crop of a single furniture piece for shop/inventory thumbnails. */
export function FurnitureThumb({ id, className }: { id: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const def = item(id);
  if (!def) return null;
  const slot = def.slot as FurnitureSlot;
  if (slot === 'wallpaper' || slot === 'floor') {
    const [x, y] = slot === 'wallpaper' ? [40, 20] : [40, 212];
    return (
      <svg viewBox={`${x} ${y} 80 80`} className={className}>
        {renderFurniture(id, slot, uid, 'day', false)}
      </svg>
    );
  }
  const [x, y, w, h] = SLOT_BOX[slot];
  const size = Math.max(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pad = slot === 'ceiling' ? 0 : 6;
  const vb = slot === 'ceiling' ? `0 0 400 ${h}` : slot === 'rug' || slot === 'doormat' ? `${x - pad} ${cy - w / 2 - pad} ${w + pad * 2} ${w + pad * 2}` : `${cx - size / 2 - pad} ${cy - size / 2 - pad} ${size + pad * 2} ${size + pad * 2}`;
  return (
    <svg viewBox={vb} className={className}>
      {renderFurniture(id, slot, uid, 'day', false)}
    </svg>
  );
}
