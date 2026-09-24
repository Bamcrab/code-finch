import type { ReactNode } from 'react';
import { shade } from '../data/palette';

/**
 * Clothing art, drawn in the birb's coordinate space (viewBox 0 0 200 200, adult size):
 * head top ≈ (100, 50), eyes at (80,100)/(120,100), neck line ≈ y 126, body bottom ≈ y 184.
 * `back` renders behind the body, `front` on top.
 */
export interface ClothingProps {
  c: string;
  a: string;
  clip: string;
}
export type ClothingArt = (p: ClothingProps) => { front?: ReactNode; back?: ReactNode };

const dk = (c: string, n = 0.2) => shade(c, n);
const lt = (c: string, n = 0.3) => shade(c, -n);
const OUT = '#3b2f2a';

function Flower({ x, y, r, c, center = '#fff3b0' }: { x: number; y: number; r: number; c: string; center?: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx={x + Math.cos((deg * Math.PI) / 180) * r * 0.9}
          cy={y + Math.sin((deg * Math.PI) / 180) * r * 0.9}
          rx={r * 0.75}
          ry={r * 0.75}
          fill={c}
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.55} fill={center} />
    </g>
  );
}

function Star({ x, y, r, fill, stroke }: { x: number; y: number; r: number; fill: string; stroke?: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${x + Math.cos(rad) * rr},${y + Math.sin(rad) * rr}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} strokeLinejoin="round" />;
}

function Heart({ x, y, s, fill, stroke }: { x: number; y: number; s: number; fill: string; stroke?: string }) {
  return (
    <path
      d={`M ${x} ${y + s * 0.9} C ${x - s * 1.4} ${y} ${x - s} ${y - s} ${x} ${y - s * 0.35} C ${x + s} ${y - s} ${x + s * 1.4} ${y} ${x} ${y + s * 0.9} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 2 : 0}
    />
  );
}

/** A top that covers the body below the neckline, clipped to the body silhouette. */
function Top({ clip, children }: { clip: string; children: ReactNode }) {
  return <g clipPath={`url(#${clip})`}>{children}</g>;
}

const NECKLINE = 'M 0 124 Q 100 146 200 124 L 200 210 L 0 210 Z';

export const CLOTHING_ART: Record<string, ClothingArt> = {
  // ---------------------------------------------------------------- head
  beanie: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 58 80 C 56 30 144 30 142 80 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        {[72, 86, 100, 114, 128].map((x) => (
          <path key={x} d={`M ${x} 76 Q ${x + 2} 56 ${x} 40`} stroke={dk(c, 0.15)} strokeWidth={2} fill="none" />
        ))}
        <rect x={54} y={70} width={92} height={16} rx={8} fill={dk(c, 0.12)} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={100} cy={30} r={10} fill={a} stroke={dk(a, 0.2)} strokeWidth={2} />
      </g>
    ),
  }),
  cap: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 62 74 C 60 34 140 34 138 74 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 96 70 Q 150 60 170 74 Q 150 84 96 78 Z" fill={dk(c, 0.15)} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 100 38 L 100 72" stroke={dk(c, 0.2)} strokeWidth={1.5} />
        <circle cx={100} cy={38} r={3.5} fill={a} />
        <circle cx={100} cy={56} r={6} fill={a} opacity={0.9} />
      </g>
    ),
  }),
  bow: ({ c }) => ({
    front: (
      <g transform="translate(18 0)">
        <path d="M 100 50 C 80 30 72 66 100 56 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 108 50 C 128 30 136 66 108 56 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={104} cy={53} r={6} fill={dk(c, 0.15)} stroke={dk(c, 0.3)} strokeWidth={2} />
      </g>
    ),
  }),
  'top-hat': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={100} cy={66} rx={44} ry={9} fill={dk(c, 0.1)} stroke={dk(c, 0.35)} strokeWidth={2} />
        <rect x={72} y={12} width={56} height={54} rx={5} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
        <rect x={72} y={50} width={56} height={9} fill={a} />
        <ellipse cx={100} cy={13} rx={28} ry={5} fill={lt(c, 0.12)} />
      </g>
    ),
  }),
  'flower-crown': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 60 72 Q 100 48 140 72" stroke={a} strokeWidth={5} fill="none" strokeLinecap="round" />
        <Flower x={66} y={66} r={7} c={c} />
        <Flower x={84} y={56} r={8} c={lt(c, 0.25)} />
        <Flower x={100} y={52} r={9} c={c} />
        <Flower x={116} y={56} r={8} c={lt(c, 0.25)} />
        <Flower x={134} y={66} r={7} c={c} />
        <ellipse cx={75} cy={64} rx={5} ry={3} fill={a} transform="rotate(-30 75 64)" />
        <ellipse cx={125} cy={62} rx={5} ry={3} fill={a} transform="rotate(30 125 62)" />
      </g>
    ),
  }),
  crown: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 68 66 L 70 30 L 86 48 L 100 24 L 114 48 L 130 30 L 132 66 Z" fill={c} stroke={dk(c, 0.35)} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={68} y={58} width={64} height={9} fill={dk(c, 0.12)} />
        <circle cx={100} cy={48} r={5} fill={a} />
        <circle cx={82} cy={54} r={3.5} fill={a} />
        <circle cx={118} cy={54} r={3.5} fill={a} />
        <circle cx={70} cy={30} r={3} fill={lt(c)} />
        <circle cx={100} cy={24} r={3} fill={lt(c)} />
        <circle cx={130} cy={30} r={3} fill={lt(c)} />
      </g>
    ),
  }),
  'witch-hat': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={100} cy={66} rx={50} ry={10} fill={dk(c, 0.15)} stroke={dk(c, 0.4)} strokeWidth={2} />
        <path d="M 70 64 L 104 2 Q 110 -2 112 6 L 106 20 L 130 64 Z" fill={c} stroke={dk(c, 0.4)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 72 56 L 128 56 L 131 64 L 69 64 Z" fill={a} />
        <rect x={93} y={54} width={14} height={11} rx={2} fill="none" stroke={lt(a, 0.3)} strokeWidth={2} />
      </g>
    ),
  }),
  'party-hat': ({ c, a }) => ({
    front: (
      <g transform="rotate(10 100 60)">
        <path d="M 78 64 L 100 10 L 122 64 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 86 44 L 94 50 L 102 44 L 110 50 L 116 46" stroke={a} strokeWidth={3} fill="none" strokeLinejoin="round" />
        <circle cx={92} cy={32} r={2.5} fill={a} />
        <circle cx={106} cy={28} r={2.5} fill={a} />
        <circle cx={100} cy={9} r={7} fill={a} stroke={dk(a, 0.2)} strokeWidth={1.5} />
      </g>
    ),
  }),
  beret: ({ c }) => ({
    front: (
      <g>
        <path d="M 58 68 C 50 40 112 26 146 48 C 156 58 142 70 118 70 Q 86 72 58 68 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 60 66 Q 100 74 140 62" stroke={dk(c, 0.2)} strokeWidth={3} fill="none" />
        <path d="M 98 34 Q 100 26 104 24" stroke={dk(c, 0.3)} strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    ),
  }),
  'bucket-hat': ({ c }) => ({
    front: (
      <g>
        <path d="M 70 66 C 68 32 132 32 130 66 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 52 74 Q 100 58 148 74 L 154 84 Q 100 70 46 84 Z" fill={dk(c, 0.1)} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 70 62 Q 100 68 130 62" stroke={dk(c, 0.2)} strokeWidth={2} fill="none" strokeDasharray="4 3" />
      </g>
    ),
  }),
  headphones: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 52 100 C 50 30 150 30 148 100" stroke={a} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={38} y={82} width={22} height={36} rx={10} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <rect x={140} y={82} width={22} height={36} rx={10} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
      </g>
    ),
  }),
  'cat-ears': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 58 76 L 66 34 L 92 60 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 66 68 L 69 46 L 84 61 Z" fill={a} />
        <path d="M 142 76 L 134 34 L 108 60 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 134 68 L 131 46 L 116 61 Z" fill={a} />
      </g>
    ),
  }),
  'bunny-ears': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={82} cy={24} rx={11} ry={32} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} transform="rotate(-14 82 24)" />
        <ellipse cx={82} cy={26} rx={5} ry={22} fill={a} transform="rotate(-14 82 26)" />
        <ellipse cx={118} cy={24} rx={11} ry={32} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} transform="rotate(14 118 24)" />
        <ellipse cx={118} cy={26} rx={5} ry={22} fill={a} transform="rotate(14 118 26)" />
        <path d="M 62 70 Q 100 42 138 70" stroke={dk(c, 0.3)} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    ),
  }),
  halo: ({ c }) => ({
    front: (
      <g className="halo-float">
        <ellipse cx={100} cy={24} rx={32} ry={8} fill="none" stroke={lt(c, 0.4)} strokeWidth={10} opacity={0.5} />
        <ellipse cx={100} cy={24} rx={32} ry={8} fill="none" stroke={c} strokeWidth={5} />
      </g>
    ),
  }),
  sprout: ({ c }) => ({
    front: (
      <g>
        <path d="M 100 54 Q 97 40 100 28" stroke="#4f8a4b" strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={88} cy={28} rx={13} ry={7} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} transform="rotate(-25 88 28)" />
        <ellipse cx={112} cy={24} rx={13} ry={7} fill={c} stroke={dk(c, 0.3)} strokeWidth={1.5} transform="rotate(25 112 24)" />
      </g>
    ),
  }),
  'cowboy-hat': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 66 64 C 64 26 84 30 100 36 C 116 30 136 26 134 64 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <rect x={67} y={54} width={66} height={8} fill={a} />
        <path d="M 38 62 Q 56 76 100 70 Q 144 76 162 62 Q 160 80 100 82 Q 40 80 38 62 Z" fill={dk(c, 0.08)} stroke={dk(c, 0.3)} strokeWidth={2} />
      </g>
    ),
  }),
  'chef-hat': ({ c }) => ({
    front: (
      <g>
        <rect x={72} y={42} width={56} height={26} rx={4} fill={c} stroke={dk(c, 0.15)} strokeWidth={2} />
        <circle cx={80} cy={36} r={16} fill={c} stroke={dk(c, 0.15)} strokeWidth={2} />
        <circle cx={120} cy={36} r={16} fill={c} stroke={dk(c, 0.15)} strokeWidth={2} />
        <circle cx={100} cy={26} r={19} fill={c} stroke={dk(c, 0.15)} strokeWidth={2} />
        <rect x={74} y={42} width={52} height={10} fill={c} />
        <path d="M 72 60 L 128 60" stroke={dk(c, 0.12)} strokeWidth={2} />
      </g>
    ),
  }),
  'santa-hat': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 64 68 C 68 30 118 14 148 38 C 154 44 154 54 148 58 L 136 68 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <rect x={58} y={60} width={84} height={16} rx={8} fill={a} stroke={dk(a, 0.15)} strokeWidth={2} />
        <circle cx={150} cy={60} r={9} fill={a} stroke={dk(a, 0.15)} strokeWidth={2} />
      </g>
    ),
  }),
  'pumpkin-hat': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={100} cy={52} rx={40} ry={24} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <ellipse cx={100} cy={52} rx={14} ry={24} fill="none" stroke={dk(c, 0.2)} strokeWidth={2} />
        <ellipse cx={100} cy={52} rx={28} ry={24} fill="none" stroke={dk(c, 0.2)} strokeWidth={2} />
        <path d="M 100 30 Q 98 20 104 14" stroke={a} strokeWidth={6} strokeLinecap="round" fill="none" />
        <ellipse cx={112} cy={22} rx={8} ry={4} fill="#6fae5f" transform="rotate(-20 112 22)" />
      </g>
    ),
  }),
  antlers: ({ c }) => ({
    front: (
      <g stroke={c} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M 80 60 L 68 26 M 72 38 L 56 32 M 70 32 L 76 16" />
        <path d="M 120 60 L 132 26 M 128 38 L 144 32 M 130 32 L 124 16" />
      </g>
    ),
  }),
  'grad-cap': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 74 50 L 74 66 Q 100 74 126 66 L 126 50 Z" fill={dk(c, 0.1)} stroke={dk(c, 0.35)} strokeWidth={2} />
        <path d="M 56 44 L 100 28 L 144 44 L 100 60 Z" fill={c} stroke={dk(c, 0.35)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 100 44 L 136 50 L 136 70" stroke={a} strokeWidth={2.5} fill="none" />
        <rect x={132} y={68} width={8} height={12} rx={2} fill={a} />
        <circle cx={100} cy={44} r={3} fill={a} />
      </g>
    ),
  }),
  headband: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 56 84 Q 100 64 144 84 L 144 98 Q 100 78 56 98 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 58 90 Q 100 71 142 90" stroke={a} strokeWidth={2.5} fill="none" />
      </g>
    ),
  }),
  'pirate-hat': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 48 68 Q 58 22 100 32 Q 142 22 152 68 Q 100 56 48 68 Z" fill={c} stroke={dk(c, 0.4)} strokeWidth={2} />
        <path d="M 52 64 Q 100 52 148 64" stroke={lt(c, 0.3)} strokeWidth={2} fill="none" />
        <circle cx={100} cy={46} r={7} fill={a} />
        <path d="M 90 56 L 110 62 M 110 56 L 90 62" stroke={a} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ),
  }),
  'straw-hat': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={100} cy={68} rx={56} ry={13} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 72 66 C 72 36 128 36 128 66 Z" fill={dk(c, 0.06)} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 72 58 Q 100 64 128 58 L 128 65 Q 100 71 72 65 Z" fill={a} />
        <path d="M 60 68 Q 100 76 140 68" stroke={dk(c, 0.15)} strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
      </g>
    ),
  }),
  'frog-hat': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 58 80 C 54 36 146 36 142 80 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={76} cy={42} r={13} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={124} cy={42} r={13} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={76} cy={42} r={8} fill={a} />
        <circle cx={124} cy={42} r={8} fill={a} />
        <circle cx={77} cy={43} r={4} fill={OUT} />
        <circle cx={125} cy={43} r={4} fill={OUT} />
        <path d="M 84 66 Q 100 74 116 66" stroke={dk(c, 0.4)} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
    ),
  }),
  tiara: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 68 66 Q 100 50 132 66" stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 80 60 L 84 48 L 90 57 M 110 57 L 116 48 L 120 60" stroke={c} strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d="M 92 56 L 100 36 L 108 56 Z" fill={c} stroke={dk(c, 0.25)} strokeWidth={1.5} />
        <ellipse cx={100} cy={50} rx={4} ry={6} fill={a} />
      </g>
    ),
  }),
  earmuffs: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 58 92 C 60 36 140 36 142 92" stroke={a} strokeWidth={5} fill="none" strokeLinecap="round" />
        {[
          [52, 96],
          [148, 96],
        ].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r={15} fill={c} stroke={dk(c, 0.2)} strokeWidth={2} />
            <circle cx={x - 5} cy={y - 5} r={5} fill={lt(c, 0.3)} />
          </g>
        ))}
      </g>
    ),
  }),
  leaf: ({ c }) => ({
    front: (
      <g>
        <path d="M 102 54 C 90 30 110 16 128 22 C 128 40 116 54 102 54 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 102 54 Q 112 38 124 26" stroke={dk(c, 0.3)} strokeWidth={1.5} fill="none" />
      </g>
    ),
  }),
  'wizard-hat': ({ c, a }) => ({
    front: (
      <g>
        <ellipse cx={100} cy={66} rx={48} ry={10} fill={dk(c, 0.15)} stroke={dk(c, 0.4)} strokeWidth={2} />
        <path d="M 70 64 Q 96 30 100 0 Q 108 32 130 64 Z" fill={c} stroke={dk(c, 0.4)} strokeWidth={2} strokeLinejoin="round" />
        <Star x={92} y={42} r={6} fill={a} />
        <Star x={110} y={26} r={4} fill={a} />
        <Star x={112} y={52} r={3.5} fill={a} />
      </g>
    ),
  }),

  // ---------------------------------------------------------------- eyes
  'round-glasses': ({ c }) => ({
    front: (
      <g stroke={c} strokeWidth={3} fill="rgba(255,255,255,0.18)">
        <circle cx={80} cy={100} r={13} />
        <circle cx={120} cy={100} r={13} />
        <path d="M 93 98 Q 100 92 107 98" fill="none" />
        <path d="M 67 97 L 50 92 M 133 97 L 150 92" fill="none" />
      </g>
    ),
  }),
  sunglasses: ({ c }) => ({
    front: (
      <g>
        <path d="M 62 92 H 96 V 100 Q 96 114 79 114 Q 62 114 62 100 Z" fill="#26232b" stroke={c} strokeWidth={3} />
        <path d="M 104 92 H 138 V 100 Q 138 114 121 114 Q 104 114 104 100 Z" fill="#26232b" stroke={c} strokeWidth={3} />
        <path d="M 96 95 L 104 95" stroke={c} strokeWidth={3} />
        <path d="M 68 97 L 76 97 M 110 97 L 118 97" stroke="#ffffff" strokeWidth={2} opacity={0.5} />
      </g>
    ),
  }),
  'heart-glasses': ({ c }) => ({
    front: (
      <g>
        <Heart x={80} y={100} s={14} fill={c} stroke={dk(c, 0.35)} />
        <Heart x={120} y={100} s={14} fill={c} stroke={dk(c, 0.35)} />
        <path d="M 93 96 L 107 96" stroke={dk(c, 0.35)} strokeWidth={3} />
        <circle cx={75} cy={96} r={2.5} fill="#fff" opacity={0.6} />
        <circle cx={115} cy={96} r={2.5} fill="#fff" opacity={0.6} />
      </g>
    ),
  }),
  'star-glasses': ({ c }) => ({
    front: (
      <g>
        <Star x={80} y={100} r={16} fill={c} stroke={dk(c, 0.35)} />
        <Star x={120} y={100} r={16} fill={c} stroke={dk(c, 0.35)} />
        <path d="M 94 97 L 106 97" stroke={dk(c, 0.35)} strokeWidth={3} />
      </g>
    ),
  }),
  monocle: ({ c }) => ({
    front: (
      <g>
        <circle cx={120} cy={100} r={13} fill="rgba(255,255,255,0.2)" stroke={c} strokeWidth={3.5} />
        <path d="M 131 108 Q 144 124 136 140" stroke={c} strokeWidth={1.5} fill="none" strokeDasharray="2 2" />
      </g>
    ),
  }),
  goggles: ({ c, a }) => ({
    front: (
      <g>
        <rect x={40} y={93} width={120} height={12} rx={4} fill={c} />
        <circle cx={80} cy={99} r={14} fill={a} opacity={0.7} stroke={dk(c, 0.3)} strokeWidth={5} />
        <circle cx={120} cy={99} r={14} fill={a} opacity={0.7} stroke={dk(c, 0.3)} strokeWidth={5} />
        <circle cx={75} cy={94} r={3} fill="#fff" opacity={0.7} />
        <circle cx={115} cy={94} r={3} fill="#fff" opacity={0.7} />
      </g>
    ),
  }),
  'sleep-mask': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 60 92 Q 100 82 140 92 Q 144 112 124 114 Q 110 114 100 106 Q 90 114 76 114 Q 56 112 60 92 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 72 101 Q 80 107 88 101 M 112 101 Q 120 107 128 101" stroke={a} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d="M 74 104 L 72 108 M 80 106 L 80 110 M 86 104 L 88 108 M 114 104 L 112 108 M 120 106 L 120 110 M 126 104 L 128 108" stroke={a} strokeWidth={1.5} />
      </g>
    ),
  }),
  'cat-eye-glasses': ({ c }) => ({
    front: (
      <g stroke={c} strokeWidth={3.5} fill="rgba(255,255,255,0.18)" strokeLinejoin="round">
        <path d="M 62 90 Q 80 88 94 94 Q 94 112 79 112 Q 64 112 62 100 Q 58 94 56 88 Q 60 90 62 90 Z" />
        <path d="M 138 90 Q 120 88 106 94 Q 106 112 121 112 Q 136 112 138 100 Q 142 94 144 88 Q 140 90 138 90 Z" />
        <path d="M 94 96 L 106 96" fill="none" />
      </g>
    ),
  }),

  // ---------------------------------------------------------------- neck
  scarf: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 40 120 Q 100 144 160 120 L 162 136 Q 100 160 38 136 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 60 130 Q 100 146 140 130" stroke={a} strokeWidth={3} fill="none" strokeDasharray="8 6" />
        <path d="M 124 140 L 138 178 L 120 180 L 112 144 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 122 178 L 121 186 M 128 178 L 128 186 M 134 177 L 136 185" stroke={dk(c, 0.3)} strokeWidth={2} />
        <path d="M 118 158 L 132 156" stroke={a} strokeWidth={3} />
      </g>
    ),
  }),
  bowtie: ({ c }) => ({
    front: (
      <g>
        <path d="M 100 132 L 80 120 Q 76 132 80 144 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 100 132 L 120 120 Q 124 132 120 144 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <rect x={94} y={126} width={12} height={12} rx={4} fill={dk(c, 0.15)} stroke={dk(c, 0.3)} strokeWidth={2} />
      </g>
    ),
  }),
  necktie: ({ c }) => ({
    front: (
      <g>
        <path d="M 93 124 H 107 L 104 134 H 96 Z" fill={dk(c, 0.15)} stroke={dk(c, 0.35)} strokeWidth={1.5} />
        <path d="M 96 134 L 104 134 L 111 166 L 100 178 L 89 166 Z" fill={c} stroke={dk(c, 0.35)} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M 93 150 L 107 144 M 91 162 L 109 154" stroke={lt(c, 0.25)} strokeWidth={2} />
      </g>
    ),
  }),
  pearls: ({ c }) => ({
    front: (
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const x = 58 + t * 84;
          const y = 124 + Math.sin(t * Math.PI) * 18;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={5} fill={c} stroke={dk(c, 0.2)} strokeWidth={1} />
              <circle cx={x - 1.5} cy={y - 1.5} r={1.5} fill="#fff" />
            </g>
          );
        })}
      </g>
    ),
  }),
  'neck-bandana': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 54 120 Q 100 134 146 120 L 102 166 Q 100 168 98 166 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <circle cx={88} cy={134} r={2.5} fill={a} />
        <circle cx={112} cy={134} r={2.5} fill={a} />
        <circle cx={100} cy={146} r={2.5} fill={a} />
        <circle cx={76} cy={126} r={2} fill={a} />
        <circle cx={124} cy={126} r={2} fill={a} />
      </g>
    ),
  }),
  lei: ({ c, a }) => ({
    front: (
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const t = i / 8;
          const x = 52 + t * 96;
          const y = 124 + Math.sin(t * Math.PI) * 22;
          return i % 2 === 0 ? (
            <Flower key={i} x={x} y={y} r={6} c={c} />
          ) : (
            <ellipse key={i} cx={x} cy={y} rx={6} ry={3.5} fill={a} transform={`rotate(${t * 180 - 90} ${x} ${y})`} />
          );
        })}
      </g>
    ),
  }),
  'bell-collar': ({ c, a }) => ({
    front: (
      <g>
        <path d="M 48 122 Q 100 140 152 122 L 152 131 Q 100 150 48 131 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <circle cx={100} cy={148} r={8} fill={a} stroke={dk(a, 0.3)} strokeWidth={2} />
        <path d="M 96 150 L 104 150" stroke={dk(a, 0.4)} strokeWidth={2} />
        <circle cx={100} cy={153} r={1.5} fill={dk(a, 0.4)} />
      </g>
    ),
  }),
  medal: ({ c, a }) => ({
    front: (
      <g>
        <path d="M 80 120 L 96 150 L 104 150 L 88 120 Z" fill={a} />
        <path d="M 120 120 L 104 150 L 96 150 L 112 120 Z" fill={dk(a, 0.15)} />
        <circle cx={100} cy={158} r={12} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <Star x={100} y={158} r={6} fill={lt(c, 0.3)} />
      </g>
    ),
  }),
  'ruffle-collar': ({ c }) => ({
    front: (
      <g>
        {Array.from({ length: 8 }).map((_, i) => {
          const t = i / 7;
          const x = 56 + t * 88;
          const y = 124 + Math.sin(t * Math.PI) * 12;
          return <circle key={i} cx={x} cy={y} r={9} fill={c} stroke={dk(c, 0.2)} strokeWidth={1.5} />;
        })}
      </g>
    ),
  }),

  // ---------------------------------------------------------------- body
  tshirt: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 0 124 Q 100 146 200 124" stroke={dk(c, 0.25)} strokeWidth={4} fill="none" />
        <Heart x={100} y={158} s={9} fill={a} />
      </Top>
    ),
  }),
  sweater: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 0 124 Q 100 146 200 124" stroke={dk(c, 0.2)} strokeWidth={6} fill="none" />
        <path d="M 20 156 L 32 148 L 44 156 L 56 148 L 68 156 L 80 148 L 92 156 L 104 148 L 116 156 L 128 148 L 140 156 L 152 148 L 164 156 L 176 148" stroke={a} strokeWidth={3} fill="none" />
        {[40, 64, 88, 112, 136, 160].map((x) => (
          <circle key={x} cx={x} cy={166} r={2} fill={a} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <path key={i} d={`M ${i * 10} 176 L ${i * 10} 190`} stroke={dk(c, 0.15)} strokeWidth={2} />
        ))}
      </Top>
    ),
  }),
  hoodie: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 60 126 Q 100 150 140 126" stroke={dk(c, 0.2)} strokeWidth={8} fill="none" />
        <path d="M 92 140 L 90 160 M 108 140 L 110 160" stroke={a} strokeWidth={2.5} strokeLinecap="round" />
        <rect x={74} y={160} width={52} height={20} rx={8} fill={dk(c, 0.08)} stroke={dk(c, 0.2)} strokeWidth={2} />
      </Top>
    ),
  }),
  overalls: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d="M 78 122 L 76 142 M 122 122 L 124 142" stroke={c} strokeWidth={7} strokeLinecap="round" />
        <rect x={74} y={138} width={52} height={30} rx={5} fill={c} stroke={dk(c, 0.2)} strokeWidth={2} />
        <rect x={0} y={162} width={200} height={40} fill={c} />
        <rect x={88} y={146} width={24} height={12} rx={3} fill={dk(c, 0.1)} stroke={dk(c, 0.2)} strokeWidth={1.5} />
        <circle cx={80} cy={143} r={3} fill={a} />
        <circle cx={120} cy={143} r={3} fill={a} />
        <path d="M 100 168 L 100 190" stroke={dk(c, 0.2)} strokeWidth={2} strokeDasharray="3 3" />
      </Top>
    ),
  }),
  tutu: ({ c }) => ({
    front: (
      <g>
        <path d="M 36 150 Q 100 162 164 150 L 174 172 L 160 166 L 150 178 L 136 168 L 120 180 L 100 170 L 80 180 L 64 168 L 50 178 L 40 166 L 26 172 Z" fill={c} opacity={0.9} stroke={dk(c, 0.2)} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M 40 150 Q 100 164 160 150" stroke={dk(c, 0.2)} strokeWidth={5} fill="none" />
      </g>
    ),
  }),
  raincoat: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 70 126 L 86 146 L 100 134 L 114 146 L 130 126" fill={dk(c, 0.1)} stroke={dk(c, 0.25)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 100 136 L 100 200" stroke={dk(c, 0.25)} strokeWidth={2} />
        {[152, 168].map((y) => (
          <g key={y}>
            <rect x={90} y={y - 2} width={6} height={4} rx={1} fill={a} />
            <rect x={104} y={y - 2} width={6} height={4} rx={1} fill={a} />
          </g>
        ))}
      </Top>
    ),
  }),
  vest: ({ c, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d="M 0 122 L 90 132 L 90 200 L 0 200 Z" fill={c} />
        <path d="M 200 122 L 110 132 L 110 200 L 200 200 Z" fill={c} />
        {[146, 160, 174].map((y) => (
          <g key={y}>
            <path d={`M 0 ${y} L 90 ${y + 2}`} stroke={dk(c, 0.2)} strokeWidth={2} />
            <path d={`M 200 ${y} L 110 ${y + 2}`} stroke={dk(c, 0.2)} strokeWidth={2} />
          </g>
        ))}
        <path d="M 90 132 L 90 200 M 110 132 L 110 200" stroke={dk(c, 0.3)} strokeWidth={2.5} />
      </Top>
    ),
  }),
  tuxedo: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 82 128 L 100 176 L 118 128 Q 100 136 82 128 Z" fill={a} />
        <path d="M 82 128 L 94 150 L 86 150 Z M 118 128 L 106 150 L 114 150 Z" fill={dk(c, 0.2)} />
        <path d="M 92 134 L 100 139 L 108 134 L 108 142 L 100 139 L 92 142 Z" fill={OUT} />
        <circle cx={100} cy={156} r={2} fill={OUT} />
        <circle cx={100} cy={166} r={2} fill={OUT} />
      </Top>
    ),
  }),
  apron: ({ c, a, clip }) => ({
    front: (
      <g>
        <path d="M 80 124 Q 100 112 120 124" stroke={c} strokeWidth={3} fill="none" />
        <Top clip={clip}>
          <path d="M 74 132 Q 100 128 126 132 L 132 200 L 68 200 Z" fill={c} stroke={dk(c, 0.2)} strokeWidth={2} />
          <rect x={86} y={156} width={28} height={16} rx={4} fill={dk(c, 0.08)} stroke={a} strokeWidth={2} strokeDasharray="3 2" />
        </Top>
      </g>
    ),
  }),
  'striped-shirt': ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={a} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={0} y={134 + i * 10} width={200} height={5} fill={c} />
        ))}
        <path d="M 0 124 Q 100 146 200 124" stroke={c} strokeWidth={5} fill="none" />
      </Top>
    ),
  }),
  pajamas: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 74 126 L 88 142 L 100 134 L 112 142 L 126 126" fill={lt(c, 0.25)} stroke={dk(c, 0.2)} strokeWidth={2} strokeLinejoin="round" />
        {[
          [60, 150],
          [140, 152],
          [86, 170],
          [118, 176],
          [50, 176],
          [150, 176],
          [100, 156],
        ].map(([x, y], i) => (
          <Star key={i} x={x} y={y} r={4} fill={a} />
        ))}
      </Top>
    ),
  }),
  jersey: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 0 124 Q 100 146 200 124" stroke={a} strokeWidth={5} fill="none" />
        <text x={100} y={172} textAnchor="middle" fontSize={26} fontWeight={900} fill={a} fontFamily="Nunito, sans-serif">
          7
        </text>
      </Top>
    ),
  }),
  cardigan: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d="M 0 122 Q 60 134 92 136 L 96 200 L 0 200 Z" fill={c} />
        <path d="M 200 122 Q 140 134 108 136 L 104 200 L 200 200 Z" fill={c} />
        <path d="M 92 136 L 96 200 M 108 136 L 104 200" stroke={dk(c, 0.25)} strokeWidth={2.5} />
        {[150, 164, 178].map((y) => (
          <circle key={y} cx={90} cy={y} r={3} fill={a} />
        ))}
        <rect x={36} y={160} width={22} height={14} rx={3} fill="none" stroke={dk(c, 0.2)} strokeWidth={2} />
      </Top>
    ),
  }),
  kimono: ({ c, a, clip }) => ({
    front: (
      <Top clip={clip}>
        <path d={NECKLINE} fill={c} />
        <path d="M 76 126 L 118 170 M 124 126 L 96 156" stroke={lt(c, 0.35)} strokeWidth={5} />
        <rect x={0} y={158} width={200} height={14} fill={a} />
        <path d="M 108 172 L 112 188 L 118 172" fill={a} />
        {[
          [52, 144],
          [150, 140],
          [60, 186],
          [146, 186],
        ].map(([x, y], i) => (
          <Flower key={i} x={x} y={y} r={4} c={lt(c, 0.45)} />
        ))}
      </Top>
    ),
  }),

  // ---------------------------------------------------------------- back
  backpack: ({ c, a }) => ({
    back: (
      <g>
        <rect x={140} y={108} width={34} height={56} rx={12} fill={c} stroke={dk(c, 0.3)} strokeWidth={2} />
        <rect x={145} y={134} width={24} height={16} rx={5} fill={dk(c, 0.12)} />
      </g>
    ),
    front: (
      <g stroke={a} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M 74 118 Q 64 140 70 170" />
        <path d="M 126 118 Q 136 140 130 170" />
      </g>
    ),
  }),
  cape: ({ c }) => ({
    back: <path d="M 58 108 Q 26 150 20 192 Q 100 204 180 192 Q 174 150 142 108 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />,
    front: (
      <g>
        <path d="M 62 118 Q 100 134 138 118" stroke={dk(c, 0.2)} strokeWidth={5} fill="none" />
        <circle cx={100} cy={128} r={5} fill="#f2c94c" stroke="#b38f2a" strokeWidth={1.5} />
      </g>
    ),
  }),
  'fairy-wings': ({ c }) => ({
    back: (
      <g opacity={0.85} className="wing-flutter">
        <path d="M 70 118 C 20 70 -6 110 28 140 C 40 150 60 140 70 128 Z" fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 72 132 C 30 150 30 186 60 176 C 72 170 76 152 74 136 Z" fill={lt(c, 0.2)} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 130 118 C 180 70 206 110 172 140 C 160 150 140 140 130 128 Z" fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 128 132 C 170 150 170 186 140 176 C 128 170 124 152 126 136 Z" fill={lt(c, 0.2)} stroke={dk(c, 0.25)} strokeWidth={2} />
      </g>
    ),
  }),
  'angel-wings': ({ c }) => ({
    back: (
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ellipse cx={42 - i * 8} cy={112 + i * 16} rx={34 - i * 4} ry={12} fill={i % 2 ? lt(c, 0.15) : c} stroke={dk(c, 0.2)} strokeWidth={1.5} transform={`rotate(${-30 + i * 18} ${42 - i * 8} ${112 + i * 16})`} />
            <ellipse cx={158 + i * 8} cy={112 + i * 16} rx={34 - i * 4} ry={12} fill={i % 2 ? lt(c, 0.15) : c} stroke={dk(c, 0.2)} strokeWidth={1.5} transform={`rotate(${30 - i * 18} ${158 + i * 8} ${112 + i * 16})`} />
          </g>
        ))}
      </g>
    ),
  }),
  'bat-wings': ({ c }) => ({
    back: (
      <g>
        <path d="M 66 116 L 16 90 L 22 118 L 4 124 L 20 142 L 10 160 L 40 150 L 60 150 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
        <path d="M 134 116 L 184 90 L 178 118 L 196 124 L 180 142 L 190 160 L 160 150 L 140 150 Z" fill={c} stroke={dk(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      </g>
    ),
  }),
  'turtle-shell': ({ c, a }) => ({
    back: (
      <g>
        <ellipse cx={100} cy={128} rx={74} ry={66} fill={c} stroke={dk(c, 0.35)} strokeWidth={3} />
        <path d="M 30 110 L 44 96 M 170 110 L 156 96 M 28 150 L 44 160 M 172 150 L 156 160" stroke={a} strokeWidth={4} strokeLinecap="round" />
      </g>
    ),
  }),
  jetpack: ({ c, a }) => ({
    back: (
      <g>
        {[26, 152].map((x) => (
          <g key={x}>
            <rect x={x} y={100} width={22} height={60} rx={10} fill={c} stroke={dk(c, 0.35)} strokeWidth={2} />
            <path d={`M ${x + 4} 160 L ${x + 11} 186 L ${x + 18} 160 Z`} fill={a} className="flame" />
            <path d={`M ${x + 7} 160 L ${x + 11} 174 L ${x + 15} 160 Z`} fill="#ffe27a" />
          </g>
        ))}
      </g>
    ),
    front: (
      <g stroke={dk(c, 0.3)} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M 72 118 Q 66 140 72 160" />
        <path d="M 128 118 Q 134 140 128 160" />
      </g>
    ),
  }),
  balloon: ({ c }) => ({
    back: (
      <g className="balloon-sway">
        <path d="M 162 150 Q 178 110 172 58" stroke="#8b8b8b" strokeWidth={1.5} fill="none" />
        <ellipse cx={172} cy={34} rx={20} ry={24} fill={c} stroke={dk(c, 0.25)} strokeWidth={2} />
        <path d="M 168 58 L 176 58 L 172 52 Z" fill={dk(c, 0.2)} />
        <ellipse cx={165} cy={26} rx={5} ry={8} fill="#fff" opacity={0.35} />
      </g>
    ),
  }),
};
