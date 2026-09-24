import type { ReactNode } from 'react';
import { shade } from '../data/palette';
import type { FurnitureSlot } from '../state/types';

export type Sky = 'day' | 'sunset' | 'night';

export interface FurnitureProps {
  c: string;
  a: string;
  id: string;
  sky: Sky;
  night: boolean;
  emblem?: string;
}
export type FurnitureArt = (p: FurnitureProps) => ReactNode;

/** Region of the 400x300 room each slot occupies (used for thumbnails). */
export const SLOT_BOX: Record<FurnitureSlot, [number, number, number, number]> = {
  ceiling: [0, 0, 400, 56],
  wallpaper: [0, 0, 400, 206],
  floor: [0, 206, 400, 94],
  window: [56, 22, 100, 104],
  wallDecor: [176, 32, 70, 72],
  door: [300, 72, 80, 138],
  lamp: [4, 78, 52, 138],
  bed: [44, 130, 132, 96],
  dresser: [178, 112, 80, 102],
  plant: [254, 132, 46, 86],
  rug: [108, 234, 196, 56],
  doormat: [294, 204, 92, 26],
  toy: [298, 228, 70, 66],
};

const dk = (c: string, n = 0.2) => shade(c, n);
const lt = (c: string, n = 0.3) => shade(c, -n);
const WOOD = '#b98a5e';
const OUT = '#5a4636';

const SKY: Record<Sky, [string, string]> = {
  day: ['#8fd0f2', '#e2f4fb'],
  sunset: ['#f39a78', '#fbd9a2'],
  night: ['#1c2552', '#3d4c84'],
};

/** Sky scene drawn into a window's glass area. */
function SkyView({ id, sky, x, y, w, h, clip }: { id: string; sky: Sky; x: number; y: number; w: number; h: number; clip: ReactNode }) {
  const [top, bottom] = SKY[sky];
  const gid = `${id}-skyg`;
  const cid = `${id}-skyc`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <clipPath id={cid}>{clip}</clipPath>
      </defs>
      <g clipPath={`url(#${cid})`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${gid})`} />
        {sky === 'night' ? (
          <g>
            <circle cx={x + w * 0.7} cy={y + h * 0.3} r={Math.min(w, h) * 0.12} fill="#fdf3c4" />
            <circle cx={x + w * 0.66} cy={y + h * 0.27} r={Math.min(w, h) * 0.12} fill={top} />
            {[
              [0.2, 0.2],
              [0.35, 0.45],
              [0.15, 0.6],
              [0.5, 0.15],
              [0.85, 0.6],
              [0.55, 0.7],
            ].map(([sx, sy], i) => (
              <circle key={i} cx={x + w * sx} cy={y + h * sy} r={1.3} fill="#fff" className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </g>
        ) : (
          <g>
            <circle cx={x + w * 0.72} cy={y + h * (sky === 'sunset' ? 0.78 : 0.3)} r={Math.min(w, h) * 0.13} fill={sky === 'sunset' ? '#ffd27a' : '#ffe57a'} />
            <g fill="#fff" opacity={0.9}>
              <ellipse cx={x + w * 0.3} cy={y + h * 0.4} rx={w * 0.16} ry={h * 0.07} />
              <ellipse cx={x + w * 0.4} cy={y + h * 0.36} rx={w * 0.1} ry={h * 0.07} />
            </g>
          </g>
        )}
        <path d={`M ${x} ${y + h * 0.85} Q ${x + w * 0.3} ${y + h * 0.72} ${x + w * 0.6} ${y + h * 0.84} T ${x + w} ${y + h * 0.8} L ${x + w} ${y + h} L ${x} ${y + h} Z`} fill={sky === 'night' ? '#2c4a3f' : '#8cc98a'} />
      </g>
    </g>
  );
}

function pattern(id: string, w: number, h: number, children: ReactNode, rotate = 0) {
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse" patternTransform={rotate ? `rotate(${rotate})` : undefined}>
      {children}
    </pattern>
  );
}

function Wall({ id, fill, children }: { id: string; fill?: string; children?: ReactNode }) {
  return (
    <g>
      {children && <defs>{children}</defs>}
      <rect x={0} y={0} width={400} height={208} fill={fill ?? `url(#${id}-wp)`} />
    </g>
  );
}

function Floor({ id, children, fill }: { id: string; children?: ReactNode; fill?: string }) {
  return (
    <g>
      {children && <defs>{children}</defs>}
      <rect x={0} y={206} width={400} height={94} fill={fill ?? `url(#${id}-fl)`} />
    </g>
  );
}

function star(x: number, y: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(x + Math.cos(rad) * rr).toFixed(1)},${(y + Math.sin(rad) * rr).toFixed(1)}`);
  }
  return pts.join(' ');
}

function heart(x: number, y: number, s: number): string {
  return `M ${x} ${y + s * 0.9} C ${x - s * 1.4} ${y} ${x - s} ${y - s} ${x} ${y - s * 0.35} C ${x + s} ${y - s} ${x + s * 1.4} ${y} ${x} ${y + s * 0.9} Z`;
}

function Pot({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w - w * 0.12} ${y + h} L ${x + w * 0.12} ${y + h} Z`} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={x - 2} y={y - 5} width={w + 4} height={7} rx={2} fill={dk(c, 0.1)} stroke={dk(c, 0.3)} strokeWidth={1.5} />
    </g>
  );
}

function Glow({ x, y, r, id }: { x: number; y: number; r: number; id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity={0.75} />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-glow)`} style={{ mixBlendMode: 'screen' }} />
    </g>
  );
}

export const FURNITURE_ART: Record<string, FurnitureArt> = {
  // ------------------------------------------------------------ wallpaper
  'wp-plain': ({ c }) => <Wall id="" fill={c} />,
  'wp-stripes': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 28, 28, <><rect width={28} height={28} fill={c} /><rect width={12} height={28} fill={a} opacity={0.45} /></>)}
    </Wall>
  ),
  'wp-dots': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 30, 30, <><rect width={30} height={30} fill={c} /><circle cx={7} cy={7} r={4} fill={a} opacity={0.7} /><circle cx={22} cy={22} r={4} fill={a} opacity={0.7} /></>)}
    </Wall>
  ),
  'wp-stars': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 46, 46, <><rect width={46} height={46} fill={c} /><polygon points={star(11, 12, 6)} fill={a} /><polygon points={star(34, 32, 4)} fill={a} opacity={0.8} /><circle cx={36} cy={8} r={1.5} fill={a} /><circle cx={10} cy={36} r={1.2} fill={a} /></>)}
    </Wall>
  ),
  'wp-hearts': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 40, 40, <><rect width={40} height={40} fill={c} /><path d={heart(10, 10, 5)} fill={a} opacity={0.75} /><path d={heart(30, 30, 5)} fill={a} opacity={0.75} /></>)}
    </Wall>
  ),
  'wp-gingham': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 24, 24, <><rect width={24} height={24} fill={a} /><rect width={12} height={24} fill={c} opacity={0.5} /><rect width={24} height={12} fill={c} opacity={0.5} /></>)}
    </Wall>
  ),
  'wp-wood': ({ c, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 32, 208, <><rect width={32} height={208} fill={c} /><rect width={2} height={208} fill={dk(c, 0.2)} /><ellipse cx={16} cy={70} rx={3} ry={5} fill={dk(c, 0.12)} /><path d="M 8 0 Q 12 100 8 208" stroke={dk(c, 0.07)} strokeWidth={2} fill="none" /></>)}
    </Wall>
  ),
  'wp-brick': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 44, 24, <><rect width={44} height={24} fill={a} /><rect x={1} y={1} width={42} height={10} rx={1.5} fill={c} /><rect x={-21} y={13} width={42} height={10} rx={1.5} fill={dk(c, 0.06)} /><rect x={23} y={13} width={42} height={10} rx={1.5} fill={dk(c, 0.06)} /></>)}
    </Wall>
  ),
  'wp-clouds': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 90, 70, <><rect width={90} height={70} fill={c} /><g fill={a} opacity={0.85}><ellipse cx={24} cy={20} rx={16} ry={7} /><ellipse cx={32} cy={15} rx={9} ry={7} /><ellipse cx={66} cy={52} rx={16} ry={7} /><ellipse cx={74} cy={47} rx={9} ry={7} /></g></>)}
    </Wall>
  ),
  'wp-leaves': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 40, 40, <><rect width={40} height={40} fill={c} /><ellipse cx={10} cy={12} rx={7} ry={3.5} fill={a} opacity={0.6} transform="rotate(-35 10 12)" /><ellipse cx={30} cy={30} rx={7} ry={3.5} fill={a} opacity={0.6} transform="rotate(35 30 30)" /></>)}
    </Wall>
  ),
  'wp-scallop': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 28, 16, <><rect width={28} height={16} fill={c} /><path d="M 0 16 A 14 14 0 0 1 28 16" stroke={a} strokeWidth={2} fill="none" opacity={0.7} /><path d="M -14 8 A 14 14 0 0 1 14 8 M 14 8 A 14 14 0 0 1 42 8" stroke={a} strokeWidth={2} fill="none" opacity={0.7} /></>)}
    </Wall>
  ),
  'wp-flowers': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 48, 48, <><rect width={48} height={48} fill={c} />{[[12, 12], [36, 36]].map(([x, y], i) => (<g key={i}>{[0, 72, 144, 216, 288].map((d) => (<circle key={d} cx={x + Math.cos((d * Math.PI) / 180) * 4} cy={y + Math.sin((d * Math.PI) / 180) * 4} r={3.5} fill={a} />))}<circle cx={x} cy={y} r={2.5} fill="#fff3b0" /></g>))}<ellipse cx={36} cy={12} rx={4} ry={2} fill="#7fb77e" /><ellipse cx={12} cy={36} rx={4} ry={2} fill="#7fb77e" /></>)}
    </Wall>
  ),
  'wp-diamonds': ({ c, a, id }) => (
    <Wall id={id}>
      {pattern(`${id}-wp`, 32, 32, <><rect width={32} height={32} fill={c} /><path d="M 16 2 L 30 16 L 16 30 L 2 16 Z" fill="none" stroke={a} strokeWidth={2} opacity={0.7} /><circle cx={16} cy={16} r={2.5} fill={a} opacity={0.7} /></>)}
    </Wall>
  ),

  // ------------------------------------------------------------ floor
  'fl-planks': ({ c, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 120, 24, <><rect width={120} height={24} fill={c} /><rect y={22} width={120} height={2} fill={dk(c, 0.18)} /><rect x={40} y={0} width={2} height={12} fill={dk(c, 0.18)} /><rect x={100} y={12} width={2} height={10} fill={dk(c, 0.18)} /><rect y={10} width={120} height={2} fill={dk(c, 0.1)} /></>)}
    </Floor>
  ),
  'fl-carpet': ({ c, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 12, 12, <><rect width={12} height={12} fill={c} /><circle cx={3} cy={3} r={0.9} fill={dk(c, 0.08)} /><circle cx={9} cy={8} r={0.9} fill={lt(c, 0.1)} /></>)}
    </Floor>
  ),
  'fl-checker': ({ c, a, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 36, 36, <><rect width={36} height={36} fill={a} /><rect width={18} height={18} fill={c} /><rect x={18} y={18} width={18} height={18} fill={c} /></>)}
    </Floor>
  ),
  'fl-herringbone': ({ c, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 24, 24, <><rect width={24} height={24} fill={c} /><rect x={0} y={0} width={24} height={12} fill={lt(c, 0.08)} stroke={dk(c, 0.18)} strokeWidth={1} /><rect x={0} y={12} width={12} height={12} fill={dk(c, 0.05)} stroke={dk(c, 0.18)} strokeWidth={1} /></>, 45)}
    </Floor>
  ),
  'fl-stone': ({ c, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 60, 40, <><rect width={60} height={40} fill={dk(c, 0.2)} /><rect x={2} y={2} width={34} height={17} rx={6} fill={c} /><rect x={38} y={2} width={20} height={17} rx={6} fill={lt(c, 0.06)} /><rect x={2} y={21} width={20} height={17} rx={6} fill={lt(c, 0.06)} /><rect x={24} y={21} width={34} height={17} rx={6} fill={c} /></>)}
    </Floor>
  ),
  'fl-grass': ({ c, id }) => (
    <Floor id={id}>
      {pattern(`${id}-fl`, 20, 14, <><rect width={20} height={14} fill={c} /><path d="M 4 14 L 5 6 M 9 14 L 10 8 M 15 14 L 14 5" stroke={dk(c, 0.15)} strokeWidth={1.5} /></>)}
    </Floor>
  ),

  // ------------------------------------------------------------ window
  'win-curtain': ({ c, id, sky }) => (
    <g>
      <rect x={66} y={32} width={80} height={80} rx={4} fill="#f7f1e6" stroke={OUT} strokeWidth={2} />
      <SkyView id={id} sky={sky} x={72} y={38} w={68} h={68} clip={<rect x={72} y={38} width={68} height={68} rx={2} />} />
      <path d="M 106 38 V 106 M 72 72 H 140" stroke="#f7f1e6" strokeWidth={4} />
      <path d="M 60 28 Q 64 70 62 116 L 80 116 Q 74 70 84 30 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      <path d="M 152 28 Q 148 70 150 116 L 132 116 Q 138 70 128 30 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      <rect x={56} y={24} width={100} height={9} rx={4} fill={dk(c, 0.15)} />
      <rect x={62} y={112} width={88} height={7} rx={3} fill="#e9dcc8" stroke={OUT} strokeWidth={1.5} />
    </g>
  ),
  'win-round': ({ c, id, sky }) => (
    <g>
      <circle cx={106} cy={72} r={44} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <SkyView id={id} sky={sky} x={68} y={34} w={76} h={76} clip={<circle cx={106} cy={72} r={36} />} />
      <path d="M 106 36 V 108 M 70 72 H 142" stroke={c} strokeWidth={4} />
    </g>
  ),
  'win-arched': ({ c, id, sky }) => (
    <g>
      <path d="M 64 120 V 66 A 42 42 0 0 1 148 66 V 120 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <SkyView id={id} sky={sky} x={70} y={30} w={72} h={86} clip={<path d="M 72 114 V 68 A 34 34 0 0 1 140 68 V 114 Z" />} />
      <path d="M 106 34 V 114 M 72 78 H 140" stroke={c} strokeWidth={4} />
      <rect x={58} y={116} width={96} height={7} rx={3} fill={dk(c, 0.1)} />
    </g>
  ),
  'win-porthole': ({ c, id, sky }) => (
    <g>
      <circle cx={106} cy={72} r={40} fill={c} stroke={dk(c, 0.35)} strokeWidth={3} />
      <SkyView id={id} sky={sky} x={76} y={42} w={60} h={60} clip={<circle cx={106} cy={72} r={28} />} />
      <circle cx={106} cy={72} r={28} fill="none" stroke={dk(c, 0.2)} strokeWidth={3} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
        <circle key={d} cx={106 + Math.cos((d * Math.PI) / 180) * 34} cy={72 + Math.sin((d * Math.PI) / 180) * 34} r={2.5} fill={dk(c, 0.35)} />
      ))}
    </g>
  ),
  'win-shutters': ({ c, id, sky }) => (
    <g>
      <rect x={78} y={34} width={56} height={78} fill="#f7f1e6" stroke={OUT} strokeWidth={2} />
      <SkyView id={id} sky={sky} x={83} y={39} w={46} h={68} clip={<rect x={83} y={39} width={46} height={68} />} />
      <path d="M 106 39 V 107 M 83 72 H 129" stroke="#f7f1e6" strokeWidth={3} />
      {[56, 134].map((x) => (
        <g key={x}>
          <rect x={x} y={32} width={22} height={82} rx={2} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
          {[42, 52, 62, 72, 82, 92, 102].map((y) => (
            <path key={y} d={`M ${x + 3} ${y} H ${x + 19}`} stroke={dk(c, 0.2)} strokeWidth={1.5} />
          ))}
        </g>
      ))}
      <rect x={72} y={112} width={68} height={7} rx={3} fill="#e9dcc8" stroke={OUT} strokeWidth={1.5} />
    </g>
  ),
  'win-stained': ({ c }) => (
    <g>
      <path d="M 64 122 V 66 A 42 42 0 0 1 148 66 V 122 Z" fill="#6b5a4a" />
      {[
        ['M 70 116 V 68 A 36 36 0 0 1 106 32 V 74 Z', c],
        ['M 106 32 A 36 36 0 0 1 142 68 V 116 L 106 74 Z', lt(c, 0.35)],
        ['M 70 116 L 106 74 L 142 116 Z', dk(c, 0.15)],
      ].map(([d, f], i) => (
        <path key={i} d={d} fill={f} stroke="#3f342a" strokeWidth={3} opacity={0.92} />
      ))}
      <circle cx={106} cy={74} r={10} fill="#ffd96b" stroke="#3f342a" strokeWidth={3} />
    </g>
  ),

  // ------------------------------------------------------------ wall decor
  'wd-frame': ({ c }) => (
    <g>
      <rect x={182} y={42} width={58} height={46} rx={2} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={188} y={48} width={46} height={34} fill="#bfe3f2" />
      <circle cx={224} cy={56} r={5} fill="#ffe27a" />
      <path d="M 188 82 L 188 70 Q 200 60 212 70 Q 222 62 234 72 L 234 82 Z" fill="#7cbf7a" />
    </g>
  ),
  'wd-mirror': ({ c }) => (
    <g>
      <circle cx={211} cy={68} r={28} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={211} cy={68} r={22} fill="#dcecf3" />
      <path d="M 198 62 L 208 52 M 200 72 L 216 56" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
    </g>
  ),
  'wd-clock': ({ c }) => (
    <g>
      <circle cx={211} cy={68} r={26} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={211} cy={68} r={20} fill="#fffaf0" />
      {[0, 90, 180, 270].map((d) => (
        <circle key={d} cx={211 + Math.cos((d * Math.PI) / 180) * 15} cy={68 + Math.sin((d * Math.PI) / 180) * 15} r={1.8} fill={OUT} />
      ))}
      <path d="M 211 68 L 211 55 M 211 68 L 220 72" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ),
  'wd-pennant': ({ c, a, emblem }) => (
    <g>
      <circle cx={186} cy={50} r={3} fill={OUT} />
      <path d="M 186 50 L 244 64 L 186 82 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 186 50 L 186 82" stroke={a} strokeWidth={5} />
      <text x={208} y={71} fontSize={11} textAnchor="middle" fill={a} fontWeight={800} fontFamily="Nunito, sans-serif">
        {emblem ?? 'YAY'}
      </text>
    </g>
  ),
  'wd-wreath': ({ c, a }) => (
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const t = (i / 14) * Math.PI * 2;
        return <ellipse key={i} cx={211 + Math.cos(t) * 22} cy={68 + Math.sin(t) * 22} rx={9} ry={5} fill={i % 2 ? c : dk(c, 0.15)} transform={`rotate(${(t * 180) / Math.PI + 90} ${211 + Math.cos(t) * 22} ${68 + Math.sin(t) * 22})`} />;
      })}
      <path d="M 211 92 L 200 104 M 211 92 L 222 104" stroke={a} strokeWidth={4} strokeLinecap="round" />
      <path d="M 211 92 C 198 82 196 98 211 93 C 226 98 224 82 211 92 Z" fill={a} />
      {[40, 110, 200, 290].map((d) => (
        <circle key={d} cx={211 + Math.cos((d * Math.PI) / 180) * 22} cy={68 + Math.sin((d * Math.PI) / 180) * 22} r={2.5} fill={a} />
      ))}
    </g>
  ),
  'wd-shelf': ({ c, a }) => (
    <g>
      <rect x={180} y={84} width={62} height={7} rx={2} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      <path d="M 188 91 L 188 98 M 234 91 L 234 98" stroke={dk(c, 0.3)} strokeWidth={3} />
      <Pot x={188} y={72} w={14} h={12} c="#e9d6c0" />
      <path d="M 195 67 Q 188 56 184 62 M 195 67 Q 196 52 201 58 M 195 67 Q 204 58 206 66" stroke={a} strokeWidth={3} strokeLinecap="round" fill="none" />
      <rect x={212} y={64} width={6} height={20} fill="#d9624d" />
      <rect x={218} y={60} width={6} height={24} fill="#5b8fd9" />
      <rect x={224} y={67} width={6} height={17} fill="#e0b04a" transform="rotate(12 227 84)" />
    </g>
  ),
  'wd-poster': ({ c, a }) => (
    <g>
      <rect x={186} y={36} width={50} height={64} rx={2} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <polygon points={star(211, 62, 14)} fill={a} />
      <circle cx={194} cy={44} r={1.5} fill={a} />
      <circle cx={228} cy={88} r={1.5} fill={a} />
      <circle cx={196} cy={90} r={1} fill={a} />
      <circle cx={211} cy={34} r={2.5} fill="#d9534f" />
    </g>
  ),
  'wd-cuckoo': ({ c, a }) => (
    <g>
      <path d="M 186 58 L 211 34 L 236 58 Z" fill={dk(c, 0.2)} stroke={dk(c, 0.4)} strokeWidth={2} strokeLinejoin="round" />
      <rect x={191} y={56} width={40} height={38} fill={c} stroke={dk(c, 0.4)} strokeWidth={2} />
      <circle cx={211} cy={75} r={11} fill={a} stroke={dk(c, 0.4)} strokeWidth={1.5} />
      <path d="M 211 75 L 211 68 M 211 75 L 216 77" stroke={OUT} strokeWidth={2} strokeLinecap="round" />
      <rect x={205} y={44} width={12} height={10} fill="#2e2622" />
      <path d="M 205 94 L 205 108 M 217 94 L 217 104" stroke="#b38f2a" strokeWidth={1.5} />
      <ellipse cx={205} cy={110} rx={3} ry={4} fill="#b38f2a" />
      <ellipse cx={217} cy={106} rx={3} ry={4} fill="#b38f2a" />
    </g>
  ),
  'wd-badge': ({ c, a, emblem }) => (
    <g>
      <path d="M 211 34 L 238 44 L 236 76 Q 230 94 211 102 Q 192 94 186 76 L 184 44 Z" fill={c} stroke={a} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 211 40 L 232 48 L 230 74 Q 225 88 211 95 Q 197 88 192 74 L 190 48 Z" fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
      <text x={211} y={78} fontSize={26} textAnchor="middle">
        {emblem ?? '🏆'}
      </text>
    </g>
  ),

  // ------------------------------------------------------------ door
  'door-plain': ({ c, a }) => (
    <g>
      <rect x={304} y={76} width={72} height={134} rx={3} fill="#eadbc6" stroke={OUT} strokeWidth={2} />
      <rect x={310} y={82} width={60} height={126} rx={3} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={318} y={92} width={44} height={44} rx={3} fill="none" stroke={dk(c, 0.2)} strokeWidth={2.5} />
      <rect x={318} y={146} width={44} height={52} rx={3} fill="none" stroke={dk(c, 0.2)} strokeWidth={2.5} />
      <circle cx={362} cy={146} r={4} fill={a} stroke={dk(a, 0.3)} strokeWidth={1.5} />
    </g>
  ),
  'door-round': ({ c, a }) => (
    <g>
      <path d="M 302 210 V 116 A 38 38 0 0 1 378 116 V 210 Z" fill="#9c7a58" stroke={OUT} strokeWidth={2} />
      <path d="M 308 210 V 118 A 32 32 0 0 1 372 118 V 210 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      {[322, 340, 358].map((x) => (
        <path key={x} d={`M ${x} 92 V 208`} stroke={dk(c, 0.15)} strokeWidth={2} />
      ))}
      <circle cx={340} cy={116} r={10} fill="#bfe3f2" stroke={dk(c, 0.3)} strokeWidth={3} />
      <circle cx={340} cy={160} r={5} fill={a} stroke={dk(a, 0.3)} strokeWidth={1.5} />
    </g>
  ),
  'door-arched': ({ c, a }) => (
    <g>
      <path d="M 304 210 V 110 A 36 36 0 0 1 376 110 V 210 Z" fill="#e3d3bd" stroke={OUT} strokeWidth={2} />
      <path d="M 310 208 V 112 A 30 30 0 0 1 370 112 V 208 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      {[325, 340, 355].map((x) => (
        <path key={x} d={`M ${x} ${x === 340 ? 82 : 88} V 208`} stroke={dk(c, 0.18)} strokeWidth={2} />
      ))}
      <path d="M 312 120 H 330 M 312 180 H 330" stroke={a} strokeWidth={5} strokeLinecap="round" />
      <circle cx={360} cy={150} r={4} fill={a} />
    </g>
  ),
  'door-dutch': ({ c, a }) => (
    <g>
      <rect x={304} y={76} width={72} height={134} rx={3} fill="#eadbc6" stroke={OUT} strokeWidth={2} />
      <rect x={310} y={82} width={60} height={60} rx={3} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={310} y={144} width={60} height={64} rx={3} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={320} y={92} width={40} height={30} rx={3} fill="#cfe9f5" stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 340 92 V 122 M 320 107 H 360" stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 318 154 L 362 198 M 362 154 L 318 198" stroke={dk(c, 0.15)} strokeWidth={3} />
      <circle cx={362} cy={146} r={4} fill={a ?? '#e6bf4c'} />
    </g>
  ),
  'door-glass': ({ c }) => (
    <g>
      <rect x={304} y={76} width={72} height={134} rx={2} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      {[0, 1, 2].map((r) =>
        [0, 1].map((col) => (
          <rect key={`${r}-${col}`} x={312 + col * 29} y={84 + r * 40} width={25} height={36} fill="#cfe9f5" opacity={0.85} />
        )),
      )}
      <path d="M 316 90 L 330 104" stroke="#fff" strokeWidth={2} opacity={0.7} />
      <rect x={365} y={140} width={4} height={16} rx={2} fill={dk(c, 0.4)} />
    </g>
  ),

  // ------------------------------------------------------------ lamp
  'lamp-floor': ({ c, a, id, night }) => (
    <g>
      {night && <Glow x={30} y={104} r={60} id={id} />}
      <path d="M 30 112 V 210" stroke={a} strokeWidth={4} />
      <ellipse cx={30} cy={212} rx={13} ry={4} fill={dk(a, 0.2)} />
      <path d="M 16 112 L 22 84 L 38 84 L 44 112 Z" fill={night ? '#ffe9a8' : c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
    </g>
  ),
  'lamp-arc': ({ c, id, night }) => (
    <g>
      {night && <Glow x={62} y={118} r={58} id={id} />}
      <path d="M 22 212 V 120 Q 22 86 60 94" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={22} cy={212} rx={14} ry={4} fill={dk(c, 0.2)} />
      <path d="M 48 96 Q 62 86 76 96 L 72 104 Q 62 98 52 104 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      {night && <ellipse cx={62} cy={104} rx={9} ry={3} fill="#fff4c2" />}
    </g>
  ),
  'lamp-lava': ({ c, a, id, night }) => (
    <g>
      {night && <Glow x={30} y={160} r={45} id={id} />}
      <rect x={14} y={196} width={32} height={16} rx={3} fill="#b98a5e" stroke={OUT} strokeWidth={1.5} />
      <path d="M 22 196 L 26 146 L 34 146 L 38 196 Z" fill={lt(c, 0.5)} stroke={a} strokeWidth={2} />
      <ellipse cx={30} cy={182} rx={6} ry={8} fill={c} className="lava" />
      <ellipse cx={29} cy={162} rx={3.5} ry={5} fill={c} className="lava" style={{ animationDelay: '1.5s' }} />
      <path d="M 25 146 L 27 136 L 33 136 L 35 146 Z" fill={a} />
    </g>
  ),
  'lamp-mushroom': ({ c, a, id, night }) => (
    <g>
      {night && <Glow x={30} y={170} r={50} id={id} />}
      <path d="M 24 212 Q 22 190 26 176 L 34 176 Q 38 190 36 212 Z" fill="#f4ead6" stroke={OUT} strokeWidth={1.5} />
      <path d="M 6 178 Q 8 146 30 144 Q 52 146 54 178 Z" fill={night ? lt(c, 0.25) : c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={20} cy={164} r={4} fill={a} />
      <circle cx={36} cy={156} r={3} fill={a} />
      <circle cx={44} cy={170} r={3.5} fill={a} />
    </g>
  ),
  'lamp-lantern': ({ c, id, night }) => (
    <g>
      {night && <Glow x={30} y={176} r={50} id={id} />}
      <path d="M 22 152 Q 30 140 38 152" stroke={c} strokeWidth={3} fill="none" />
      <rect x={16} y={154} width={28} height={6} rx={2} fill={c} />
      <rect x={18} y={160} width={24} height={40} fill={night ? '#ffe7a0' : '#fff6d8'} stroke={c} strokeWidth={3} />
      <path d="M 30 160 V 200 M 18 180 H 42" stroke={c} strokeWidth={2} />
      <rect x={14} y={200} width={32} height={10} rx={2} fill={c} />
    </g>
  ),
  'lamp-candles': ({ c, id, night }) => (
    <g>
      {night && <Glow x={30} y={188} r={40} id={id} />}
      {[
        [18, 188, 22],
        [30, 176, 34],
        [42, 192, 18],
      ].map(([x, y, h], i) => (
        <g key={i}>
          <rect x={x - 5} y={y} width={10} height={h} rx={2} fill={c} stroke={dk(c, 0.2)} strokeWidth={1.2} />
          <path d={`M ${x} ${y - 11} Q ${x + 5} ${y - 4} ${x} ${y - 1} Q ${x - 5} ${y - 4} ${x} ${y - 11} Z`} fill="#ffb347" className="flicker" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
    </g>
  ),

  // ------------------------------------------------------------ bed
  'bed-simple': ({ c }) => (
    <g>
      <rect x={50} y={146} width={14} height={78} rx={5} fill={WOOD} stroke={OUT} strokeWidth={2} />
      <rect x={158} y={176} width={12} height={48} rx={4} fill={WOOD} stroke={OUT} strokeWidth={2} />
      <rect x={60} y={180} width={102} height={26} rx={6} fill="#fbf7ef" stroke={OUT} strokeWidth={2} />
      <ellipse cx={80} cy={178} rx={16} ry={9} fill="#fff" stroke={OUT} strokeWidth={2} />
      <path d="M 96 172 Q 130 166 162 176 L 162 206 L 96 206 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 96 180 Q 128 174 162 184" stroke={lt(c, 0.3)} strokeWidth={3} fill="none" />
    </g>
  ),
  'bed-canopy': ({ c }) => (
    <g>
      <path d="M 52 136 V 224 M 168 136 V 224" stroke={WOOD} strokeWidth={5} />
      <path d="M 48 136 Q 110 118 172 136 L 172 142 Q 110 126 48 142 Z" fill={c} stroke={dk(c, 0.25)} strokeWidth={1.5} />
      <path d="M 52 140 Q 44 170 54 206 L 60 206 Q 56 170 64 140 Z" fill={lt(c, 0.2)} opacity={0.85} />
      <path d="M 168 140 Q 176 170 166 206 L 160 206 Q 164 170 156 140 Z" fill={lt(c, 0.2)} opacity={0.85} />
      <rect x={58} y={182} width={104} height={26} rx={6} fill="#fbf7ef" stroke={OUT} strokeWidth={2} />
      <ellipse cx={78} cy={180} rx={15} ry={8} fill="#fff" stroke={OUT} strokeWidth={2} />
      <path d="M 94 174 Q 128 168 162 178 L 162 208 L 94 208 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
    </g>
  ),
  'bed-nest': ({ c, a }) => (
    <g>
      <ellipse cx={110} cy={206} rx={60} ry={18} fill={dk(c, 0.2)} />
      <path d="M 50 196 Q 110 234 170 196 Q 166 222 110 226 Q 54 222 50 196 Z" fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      {[62, 80, 98, 116, 134, 152].map((x) => (
        <path key={x} d={`M ${x} 204 Q ${x + 8} 214 ${x + 16} 206`} stroke={dk(c, 0.3)} strokeWidth={2} fill="none" />
      ))}
      <ellipse cx={110} cy={196} rx={48} ry={9} fill={a} stroke={dk(a, 0.15)} strokeWidth={1.5} />
    </g>
  ),
  'bed-cloud': ({ c }) => (
    <g>
      <g fill={c} stroke={dk(c, 0.15)} strokeWidth={2}>
        <circle cx={70} cy={196} r={20} />
        <circle cx={100} cy={188} r={24} />
        <circle cx={134} cy={192} r={22} />
        <circle cx={158} cy={200} r={16} />
        <rect x={60} y={196} width={104} height={22} rx={11} />
      </g>
      <path d="M 90 200 Q 124 194 160 204 L 160 216 L 90 216 Z" fill={lt(c, 0.25)} opacity={0.8} />
      <path d="M 56 218 V 226 M 164 218 V 226" stroke="#c9ced6" strokeWidth={4} strokeLinecap="round" />
    </g>
  ),
  'bed-hammock': ({ c }) => (
    <g>
      <path d="M 52 140 V 224 M 168 140 V 224" stroke={WOOD} strokeWidth={6} strokeLinecap="round" />
      <path d="M 52 150 L 70 176 M 168 150 L 150 176" stroke="#c9b08a" strokeWidth={2} />
      <path d="M 66 172 Q 110 214 154 172 Q 110 196 66 172 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 76 182 Q 110 206 144 182" stroke={lt(c, 0.35)} strokeWidth={3} fill="none" />
    </g>
  ),
  'bed-heart': ({ c }) => (
    <g>
      <path d={heart(64, 170, 26)} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={60} y={184} width={104} height={24} rx={6} fill="#fbf7ef" stroke={OUT} strokeWidth={2} />
      <ellipse cx={82} cy={182} rx={14} ry={8} fill="#fff" stroke={OUT} strokeWidth={2} />
      <path d="M 98 176 Q 130 170 164 180 L 164 208 L 98 208 Z" fill={lt(c, 0.25)} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 64 208 V 222 M 160 208 V 222" stroke={dk(c, 0.3)} strokeWidth={5} strokeLinecap="round" />
    </g>
  ),
  'bed-futon': ({ c }) => (
    <g>
      <rect x={52} y={204} width={116} height={18} rx={6} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <rect x={52} y={196} width={116} height={12} rx={6} fill={lt(c, 0.2)} stroke={dk(c, 0.3)} strokeWidth={2} />
      <ellipse cx={72} cy={194} rx={14} ry={7} fill="#fff" stroke={OUT} strokeWidth={1.5} />
      <path d="M 60 222 V 226 M 160 222 V 226" stroke={WOOD} strokeWidth={4} />
    </g>
  ),

  // ------------------------------------------------------------ dresser
  'dr-dresser': ({ c, a }) => (
    <g>
      <rect x={184} y={140} width={68} height={68} rx={4} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      {[146, 166, 186].map((y) => (
        <g key={y}>
          <rect x={190} y={y} width={56} height={16} rx={2} fill={lt(c, 0.08)} stroke={dk(c, 0.25)} strokeWidth={1.5} />
          <circle cx={218} cy={y + 8} r={2.5} fill={a} />
        </g>
      ))}
      <path d="M 190 208 V 214 M 246 208 V 214" stroke={dk(c, 0.35)} strokeWidth={4} />
      <rect x={196} y={130} width={12} height={10} rx={2} fill="#e9d6c0" />
      <path d="M 202 130 Q 196 120 192 124 M 202 130 Q 204 118 208 122" stroke="#5fa86d" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  ),
  'dr-bookshelf': ({ c }) => (
    <g>
      <rect x={184} y={116} width={68} height={96} rx={3} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      <rect x={189} y={121} width={58} height={86} fill={dk(c, 0.25)} />
      {[146, 176].map((y) => (
        <rect key={y} x={189} y={y} width={58} height={5} fill={c} />
      ))}
      {(
        [
          [146, [[191, 18, '#d9534f'], [198, 22, '#5b8fd9'], [205, 16, '#e0b04a'], [212, 20, '#5fa86d'], [230, 18, '#8d6cc9'], [237, 22, '#f29bb5']]],
          [176, [[191, 20, '#4aa7a3'], [198, 17, '#f5a04e'], [216, 22, '#d9534f'], [223, 18, '#34466e']]],
          [207, [[194, 22, '#e56b8c'], [201, 19, '#9cb99a'], [226, 24, '#e0b04a'], [233, 20, '#5b8fd9']]],
        ] as [number, [number, number, string][]][]
      ).flatMap(([base, books]) =>
        books.map(([x, h, f]) => <rect key={`${base}-${x}`} x={x} y={base - h} width={6} height={h} fill={f} />),
      )}
    </g>
  ),
  'dr-wardrobe': ({ c, a }) => (
    <g>
      <path d="M 182 116 H 254 L 250 108 H 186 Z" fill={dk(c, 0.15)} stroke={dk(c, 0.35)} strokeWidth={2} strokeLinejoin="round" />
      <rect x={186} y={116} width={64} height={92} rx={2} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      <path d="M 218 116 V 208" stroke={dk(c, 0.35)} strokeWidth={2} />
      <rect x={192} y={124} width={20} height={76} rx={2} fill="none" stroke={dk(c, 0.2)} strokeWidth={1.5} />
      <rect x={224} y={124} width={20} height={76} rx={2} fill="none" stroke={dk(c, 0.2)} strokeWidth={1.5} />
      <circle cx={214} cy={162} r={2.5} fill={a} />
      <circle cx={222} cy={162} r={2.5} fill={a} />
      <path d="M 190 208 V 214 M 246 208 V 214" stroke={dk(c, 0.35)} strokeWidth={4} />
    </g>
  ),
  'dr-plantshelf': ({ c }) => (
    <g>
      <path d="M 190 212 L 200 116 M 246 212 L 236 116" stroke={c} strokeWidth={5} strokeLinecap="round" />
      {[140, 172, 204].map((y, i) => (
        <g key={y}>
          <rect x={186 + (2 - i) * 2} y={y} width={64 - (2 - i) * 4} height={5} rx={2} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.2} />
          <Pot x={200 + i * 6} y={y - 12} w={14} h={12} c={['#f28b72', '#e9d6c0', '#8cc8ec'][i]} />
          <path d={`M ${207 + i * 6} ${y - 16} Q ${200 + i * 6} ${y - 30} ${196 + i * 6} ${y - 22} M ${207 + i * 6} ${y - 16} Q ${212 + i * 6} ${y - 32} ${218 + i * 6} ${y - 22}`} stroke="#5fa86d" strokeWidth={3} strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>
  ),
  'dr-vanity': ({ c, a }) => (
    <g>
      <ellipse cx={218} cy={140} rx={20} ry={24} fill={a} />
      <ellipse cx={218} cy={140} rx={15} ry={19} fill="#dcecf3" />
      <path d="M 210 132 L 218 124" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <rect x={184} y={164} width={68} height={16} rx={3} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 190 180 L 188 212 M 246 180 L 248 212" stroke={dk(c, 0.3)} strokeWidth={4} strokeLinecap="round" />
      <circle cx={196} cy={160} r={4} fill="#f29bb5" />
      <rect x={236} y={152} width={6} height={12} rx={2} fill="#8d6cc9" />
    </g>
  ),
  'dr-record': ({ c }) => (
    <g>
      <rect x={182} y={162} width={72} height={46} rx={3} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
      {[188, 200, 212].map((x) => (
        <rect key={x} x={x} y={170} width={8} height={32} fill={['#d9534f', '#34466e', '#e0b04a'][(x - 188) / 12]} />
      ))}
      <rect x={224} y={170} width={24} height={32} rx={2} fill={dk(c, 0.15)} />
      <rect x={186} y={150} width={48} height={12} rx={2} fill="#3b3a40" />
      <ellipse cx={208} cy={152} rx={18} ry={4} fill="#1d1c20" />
      <circle cx={208} cy={152} r={3} fill="#d9534f" />
      <path d="M 226 146 L 214 152" stroke="#c9ced6" strokeWidth={2} />
      <path d="M 186 208 V 214 M 250 208 V 214" stroke={dk(c, 0.35)} strokeWidth={4} />
    </g>
  ),

  // ------------------------------------------------------------ plants
  'pl-fern': ({ c }) => (
    <g>
      {[-60, -35, -10, 15, 40, 65].map((d, i) => (
        <path key={i} d={`M 277 190 Q ${277 + Math.sin((d * Math.PI) / 180) * 20} ${170 - Math.cos((d * Math.PI) / 180) * 10} ${277 + Math.sin((d * Math.PI) / 180) * 30} ${190 - Math.cos((d * Math.PI) / 180) * 40}`} stroke="#4f9a5c" strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
      <Pot x={264} y={190} w={26} h={24} c={c} />
    </g>
  ),
  'pl-cactus': ({ c }) => (
    <g>
      <path d="M 272 192 V 150 Q 272 142 278 142 Q 284 142 284 150 V 192 Z" fill="#6fb06a" stroke="#3f7a52" strokeWidth={2} />
      <path d="M 272 172 H 266 Q 262 172 262 166 V 158" stroke="#6fb06a" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 284 164 H 290 Q 294 164 294 158 V 152" stroke="#6fb06a" strokeWidth={7} fill="none" strokeLinecap="round" />
      <circle cx={278} cy={141} r={4} fill="#f29bb5" />
      <Pot x={264} y={192} w={28} h={22} c={c} />
    </g>
  ),
  'pl-monstera': ({ c }) => (
    <g>
      {[
        [262, 150, -30],
        [292, 146, 30],
        [276, 134, 0],
        [258, 176, -60],
        [296, 172, 60],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M 277 192 Q ${(277 + x) / 2} ${(192 + y) / 2 + 6} ${x} ${y}`} stroke="#3f7a52" strokeWidth={2.5} fill="none" />
          <ellipse cx={x} cy={y} rx={13} ry={10} fill="#4f9a5c" transform={`rotate(${r} ${x} ${y})`} />
          <path d={`M ${x} ${y - 9} L ${x} ${y + 9}`} stroke="#3f7a52" strokeWidth={1.2} transform={`rotate(${r} ${x} ${y})`} />
          <path d={`M ${x - 13} ${y - 1} L ${x - 7} ${y} M ${x + 13} ${y + 1} L ${x + 7} ${y}`} stroke="#8fcf98" strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${r} ${x} ${y})`} />
        </g>
      ))}
      <Pot x={262} y={192} w={30} h={22} c={c} />
    </g>
  ),
  'pl-flowers': ({ c, a }) => (
    <g>
      {[
        [268, 156],
        [280, 146],
        [290, 160],
        [276, 166],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M 278 194 Q ${(278 + x) / 2} 180 ${x} ${y}`} stroke="#5fa86d" strokeWidth={2.5} fill="none" />
          {[0, 72, 144, 216, 288].map((d) => (
            <circle key={d} cx={x + Math.cos((d * Math.PI) / 180) * 4.5} cy={y + Math.sin((d * Math.PI) / 180) * 4.5} r={4} fill={c} />
          ))}
          <circle cx={x} cy={y} r={2.5} fill="#fff3b0" />
        </g>
      ))}
      <Pot x={265} y={194} w={26} h={20} c={a} />
    </g>
  ),
  'pl-sunflower': ({ c }) => (
    <g>
      {[
        [266, 140],
        [288, 132],
        [280, 158],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M 278 190 Q ${x} 170 ${x} ${y}`} stroke="#5fa86d" strokeWidth={3} fill="none" />
          {Array.from({ length: 10 }).map((_, k) => (
            <ellipse key={k} cx={x + Math.cos((k * 36 * Math.PI) / 180) * 7} cy={y + Math.sin((k * 36 * Math.PI) / 180) * 7} rx={4} ry={2.5} fill="#f7d04c" transform={`rotate(${k * 36} ${x + Math.cos((k * 36 * Math.PI) / 180) * 7} ${y + Math.sin((k * 36 * Math.PI) / 180) * 7})`} />
          ))}
          <circle cx={x} cy={y} r={5} fill="#7a4a2a" />
        </g>
      ))}
      <path d="M 266 190 H 290 L 286 214 H 270 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
    </g>
  ),
  'pl-lemon': ({ c }) => (
    <g>
      <path d="M 278 194 V 162" stroke="#7a5a3a" strokeWidth={4} />
      <circle cx={278} cy={146} r={22} fill="#5fa86d" stroke="#3f7a52" strokeWidth={2} />
      <circle cx={266} cy={140} r={10} fill="#6fb77a" />
      {[
        [270, 150],
        [286, 140],
        [280, 156],
        [264, 136],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4} ry={3} fill="#f7d95c" stroke="#c9a52a" strokeWidth={1} />
      ))}
      <Pot x={264} y={194} w={28} h={20} c={c} />
    </g>
  ),
  'pl-bonsai': ({ c }) => (
    <g>
      <path d="M 276 200 Q 270 182 280 172 Q 288 164 282 152" stroke="#6b4a2f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={268} cy={170} rx={14} ry={7} fill="#4f9a5c" />
      <ellipse cx={288} cy={158} rx={14} ry={7} fill="#5fa86d" />
      <ellipse cx={278} cy={146} rx={12} ry={6} fill="#4f9a5c" />
      <rect x={258} y={200} width={40} height={10} rx={3} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      <path d="M 262 210 V 214 M 294 210 V 214" stroke={dk(c, 0.3)} strokeWidth={3} />
    </g>
  ),

  // ------------------------------------------------------------ rug
  'rug-round': ({ c }) => (
    <g>
      <ellipse cx={206} cy={264} rx={92} ry={22} fill={c} stroke={dk(c, 0.2)} strokeWidth={2} />
      <ellipse cx={206} cy={264} rx={72} ry={15} fill="none" stroke={lt(c, 0.3)} strokeWidth={3} />
    </g>
  ),
  'rug-braided': ({ c, a }) => (
    <g>
      {[92, 76, 60, 44, 28].map((rx, i) => (
        <ellipse key={rx} cx={206} cy={264} rx={rx} ry={rx * 0.24} fill={i % 2 ? a : c} stroke={dk(c, 0.2)} strokeWidth={1} />
      ))}
    </g>
  ),
  'rug-striped': ({ c, a }) => (
    <g>
      <rect x={120} y={246} width={172} height={36} rx={4} fill={c} stroke={dk(c, 0.2)} strokeWidth={2} />
      {[128, 150, 172, 234, 256, 276].map((x) => (
        <rect key={x} x={x} y={246} width={8} height={36} fill={a} opacity={0.8} />
      ))}
      <path d="M 196 252 L 206 264 L 196 276 L 186 264 Z M 226 252 L 236 264 L 226 276 L 216 264 Z" fill={a} />
      {Array.from({ length: 18 }).map((_, i) => (
        <path key={i} d={`M ${122 + i * 10} 282 V 288 M ${122 + i * 10} 246 V 240`} stroke={dk(c, 0.2)} strokeWidth={1.5} />
      ))}
    </g>
  ),
  'rug-star': ({ c }) => (
    <g transform="translate(206 264) scale(1 0.34) translate(-206 -264)">
      <polygon points={star(206, 264, 84)} fill={c} stroke={dk(c, 0.25)} strokeWidth={4} strokeLinejoin="round" />
      <polygon points={star(206, 264, 52)} fill={lt(c, 0.3)} />
    </g>
  ),
  'rug-heart': ({ c }) => (
    <g transform="translate(206 262) scale(1.3 0.42) translate(-206 -262)">
      <path d={heart(206, 262, 52)} fill={c} stroke={dk(c, 0.25)} strokeWidth={4} />
      <path d={heart(206, 262, 34)} fill={lt(c, 0.3)} />
    </g>
  ),
  'rug-fluffy': ({ c }) => (
    <g>
      {Array.from({ length: 28 }).map((_, i) => {
        const t = (i / 28) * Math.PI * 2;
        return <circle key={i} cx={206 + Math.cos(t) * 86} cy={264 + Math.sin(t) * 20} r={9} fill={c} />;
      })}
      <ellipse cx={206} cy={264} rx={88} ry={21} fill={c} />
      <ellipse cx={206} cy={262} rx={60} ry={12} fill={lt(c, 0.15)} />
    </g>
  ),

  // ------------------------------------------------------------ doormat
  'mat-plain': ({ c }) => <rect x={304} y={210} width={74} height={16} rx={4} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />,
  'mat-welcome': ({ c, a }) => (
    <g>
      <rect x={300} y={209} width={82} height={18} rx={3} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
      <text x={341} y={222} fontSize={10} fontWeight={900} fill={a} textAnchor="middle" fontFamily="Nunito, sans-serif" letterSpacing={1}>
        HELLO
      </text>
    </g>
  ),
  'mat-halfmoon': ({ c }) => (
    <g>
      <path d="M 302 226 A 39 18 0 0 1 380 226 Z" fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
      <path d="M 314 226 A 27 11 0 0 1 368 226" fill="none" stroke={lt(c, 0.35)} strokeWidth={3} />
    </g>
  ),

  // ------------------------------------------------------------ toys
  'toy-teddy': ({ c, a }) => (
    <g>
      <ellipse cx={333} cy={274} rx={18} ry={16} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={333} cy={250} r={14} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={322} cy={239} r={5} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={344} cy={239} r={5} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <ellipse cx={333} cy={255} rx={6} ry={4.5} fill={lt(c, 0.35)} />
      <circle cx={328} cy={248} r={1.8} fill={OUT} />
      <circle cx={338} cy={248} r={1.8} fill={OUT} />
      <circle cx={333} cy={254} r={1.8} fill={OUT} />
      <path d="M 333 264 L 325 259 L 325 269 Z M 333 264 L 341 259 L 341 269 Z" fill={a} />
      <ellipse cx={320} cy={286} rx={7} ry={5} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <ellipse cx={346} cy={286} rx={7} ry={5} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
    </g>
  ),
  'toy-ball': ({ c, a }) => (
    <g>
      <circle cx={334} cy={270} r={20} fill={a} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 334 250 Q 322 270 334 290 Q 346 270 334 250 Z" fill={c} />
      <path d="M 316 262 Q 334 268 352 262" stroke={c} strokeWidth={5} fill="none" />
      <circle cx={334} cy={270} r={20} fill="none" stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={327} cy={259} r={3} fill="#fff" opacity={0.6} />
    </g>
  ),
  'toy-books': ({ c, a }) => (
    <g>
      {[
        [312, 276, 48, c],
        [316, 266, 42, a],
        [310, 256, 46, dk(c, 0.15)],
        [318, 246, 38, lt(c, 0.25)],
      ].map(([x, y, w, f], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height={10} rx={2} fill={f as string} stroke={OUT} strokeWidth={1.2} />
          <rect x={(x as number) + (w as number) - 6} y={(y as number) + 2} width={4} height={6} fill="#fff" opacity={0.6} />
        </g>
      ))}
    </g>
  ),
  'toy-globe': ({ c, a }) => (
    <g>
      <path d="M 334 286 V 276" stroke={a} strokeWidth={4} />
      <ellipse cx={334} cy={288} rx={14} ry={4} fill={a} />
      <circle cx={334} cy={256} r={19} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 324 246 Q 330 244 332 252 Q 328 260 322 256 Z M 338 256 Q 346 252 348 262 Q 342 270 338 264 Z" fill="#7cbf7a" />
      <path d="M 312 262 A 24 24 0 0 0 356 250" stroke={a} strokeWidth={3} fill="none" />
    </g>
  ),
  'toy-beanbag': ({ c }) => (
    <g>
      <path d="M 304 286 Q 300 250 330 244 Q 362 242 364 284 Q 334 294 304 286 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <path d="M 314 264 Q 334 256 352 264" stroke={dk(c, 0.2)} strokeWidth={2} fill="none" />
    </g>
  ),
  'toy-guitar': ({ c, a }) => (
    <g transform="rotate(-18 334 262)">
      <rect x={331} y={214} width={6} height={44} fill={a} stroke={dk(a, 0.3)} strokeWidth={1} />
      <rect x={328} y={208} width={12} height={10} rx={2} fill={dk(a, 0.3)} />
      <circle cx={334} cy={266} r={14} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={334} cy={280} r={17} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      <circle cx={334} cy={270} r={5} fill={OUT} />
      <rect x={328} y={284} width={12} height={3} fill={OUT} />
    </g>
  ),
  'toy-fishbowl': ({ c }) => (
    <g>
      <rect x={316} y={282} width={36} height={8} rx={2} fill={WOOD} />
      <circle cx={334} cy={262} r={21} fill="#d6eef8" stroke="#9cc6da" strokeWidth={2} opacity={0.9} />
      <path d="M 314 262 A 20 20 0 0 0 354 262 Z" fill="#9fd0ea" opacity={0.8} />
      <ellipse cx={330} cy={266} rx={7} ry={4.5} fill={c} />
      <path d="M 337 266 L 343 262 L 343 270 Z" fill={c} />
      <circle cx={327} cy={265} r={1.2} fill={OUT} />
      <circle cx={322} cy={254} r={1.8} fill="#fff" opacity={0.8} />
      <circle cx={326} cy={248} r={1.2} fill="#fff" opacity={0.8} />
    </g>
  ),
  'toy-telescope': ({ c, a }) => (
    <g>
      <path d="M 334 262 L 318 290 M 334 262 L 350 290 M 334 262 L 334 290" stroke={OUT} strokeWidth={2.5} />
      <g transform="rotate(-30 334 258)">
        <rect x={306} y={250} width={52} height={14} rx={5} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <rect x={352} y={247} width={10} height={20} rx={3} fill={a} />
      </g>
    </g>
  ),
  'toy-blocks': ({ c }) => (
    <g>
      {[
        [312, 270, c, 'A'],
        [334, 270, '#5b8fd9', 'B'],
        [323, 250, '#f7d95c', 'C'],
      ].map(([x, y, f, t], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={20} height={20} rx={2} fill={f as string} stroke={OUT} strokeWidth={1.5} />
          <text x={(x as number) + 10} y={(y as number) + 15} fontSize={12} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Nunito, sans-serif">
            {t}
          </text>
        </g>
      ))}
    </g>
  ),

  // ------------------------------------------------------------ ceiling
  'ce-garland': ({ c }) => (
    <g>
      <path d="M 0 10 Q 100 44 200 12 Q 300 44 400 10" stroke="#7a6a4f" strokeWidth={1.5} fill="none" />
      {Array.from({ length: 24 }).map((_, i) => {
        const x = i * 17 + 8;
        const local = x % 200;
        const y = 12 + Math.sin((local / 200) * Math.PI) * 18;
        return <ellipse key={i} cx={x} cy={y + 3} rx={7} ry={3.5} fill={i % 2 ? c : dk(c, 0.15)} transform={`rotate(${i % 2 ? 30 : -30} ${x} ${y + 3})`} />;
      })}
    </g>
  ),
  'ce-bunting': ({ c, a }) => (
    <g>
      <path d="M 0 8 Q 200 40 400 8" stroke="#7a6a4f" strokeWidth={1.5} fill="none" />
      {Array.from({ length: 14 }).map((_, i) => {
        const x = i * 28 + 14;
        const t = x / 400;
        const y = 8 + 4 * 32 * t * (1 - t) * 1.0;
        return <path key={i} d={`M ${x - 11} ${y} L ${x + 11} ${y} L ${x} ${y + 20} Z`} fill={i % 2 ? a : c} stroke={dk(c, 0.2)} strokeWidth={1} />;
      })}
    </g>
  ),
  'ce-lights': ({ c, night }) => (
    <g>
      <path d="M 0 8 Q 100 36 200 10 Q 300 36 400 8" stroke="#4b4f58" strokeWidth={1.5} fill="none" />
      {Array.from({ length: 16 }).map((_, i) => {
        const x = i * 25 + 12;
        const local = x % 200;
        const y = 10 + Math.sin((local / 200) * Math.PI) * 14;
        return (
          <g key={i}>
            {night && <circle cx={x} cy={y + 8} r={9} fill={c} opacity={0.35} />}
            <ellipse cx={x} cy={y + 7} rx={3.5} ry={5} fill={i % 3 === 0 ? c : i % 3 === 1 ? lt(c, 0.3) : dk(c, 0.1)} className={night ? 'twinkle' : undefined} style={{ animationDelay: `${(i % 5) * 0.3}s` }} />
          </g>
        );
      })}
    </g>
  ),
  'ce-lanterns': ({ c, night }) => (
    <g>
      {[
        [110, 28],
        [200, 40],
        [290, 26],
      ].map(([x, len], i) => (
        <g key={i}>
          <path d={`M ${x} 0 V ${len}`} stroke="#4b4f58" strokeWidth={1.2} />
          {night && <circle cx={x} cy={len + 14} r={22} fill="#ffd9a0" opacity={0.3} />}
          <ellipse cx={x} cy={len + 14} rx={14} ry={15} fill={i === 1 ? lt(c, 0.2) : c} stroke={dk(c, 0.25)} strokeWidth={1.5} />
          <path d={`M ${x - 10} ${len + 8} Q ${x} ${len + 4} ${x + 10} ${len + 8} M ${x - 12} ${len + 16} Q ${x} ${len + 12} ${x + 12} ${len + 16}`} stroke={dk(c, 0.2)} strokeWidth={1} fill="none" />
          <rect x={x - 5} y={len - 1} width={10} height={3} fill="#4b4f58" />
          <rect x={x - 5} y={len + 28} width={10} height={3} fill="#4b4f58" />
        </g>
      ))}
    </g>
  ),
  'ce-mobile': ({ c }) => (
    <g className="mobile-sway">
      <path d="M 200 0 V 14 M 160 14 H 240" stroke="#7a6a4f" strokeWidth={1.5} />
      {[
        [160, 30],
        [187, 38],
        [213, 26],
        [240, 34],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M ${x} 14 V ${y - 7}`} stroke="#7a6a4f" strokeWidth={1} />
          {i % 2 ? <circle cx={x} cy={y} r={6} fill={lt(c, 0.2)} /> : <polygon points={star(x, y, 8)} fill={c} />}
        </g>
      ))}
    </g>
  ),
  'ce-disco': ({ c, night }) => (
    <g>
      <path d="M 200 0 V 14" stroke="#4b4f58" strokeWidth={1.5} />
      {night &&
        [
          [120, 90],
          [290, 70],
          [80, 170],
          [330, 150],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#fff" opacity={0.6} className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} />)}
      <circle cx={200} cy={32} r={18} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      {[-12, -6, 0, 6, 12].map((dy) => (
        <path key={dy} d={`M ${200 - Math.sqrt(324 - dy * dy)} ${32 + dy} H ${200 + Math.sqrt(324 - dy * dy)}`} stroke={dk(c, 0.2)} strokeWidth={1} />
      ))}
      {[-10, -4, 2, 8].map((dx) => (
        <path key={dx} d={`M ${200 + dx} 14 Q ${200 + dx * 1.3} 32 ${200 + dx} 50`} stroke={dk(c, 0.2)} strokeWidth={1} fill="none" />
      ))}
      <circle cx={193} cy={25} r={4} fill="#fff" opacity={0.8} />
    </g>
  ),
  'ce-plant': ({ c }) => (
    <g>
      <path d="M 330 0 L 318 30 M 330 0 L 342 30" stroke="#a88b6a" strokeWidth={1.5} />
      <path d="M 314 30 H 346 L 342 44 H 318 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} />
      {[
        [318, 74],
        [326, 90],
        [336, 66],
        [344, 82],
      ].map(([x, y], i) => (
        <g key={i}>
          <path d={`M ${330 + (i - 1.5) * 6} 42 Q ${x - 6} ${(42 + y) / 2} ${x} ${y}`} stroke="#4f9a5c" strokeWidth={2} fill="none" />
          <ellipse cx={x} cy={y} rx={4} ry={3} fill="#5fa86d" />
          <ellipse cx={x - 3} cy={y - 14} rx={3.5} ry={2.5} fill="#6fb77a" />
        </g>
      ))}
    </g>
  ),
};
