import { useId, type CSSProperties, type ReactNode } from 'react';
import { item } from '../data/catalog';
import { shade } from '../data/palette';
import type { BodyPart, ClothingSlot } from '../state/types';
import { CLOTHING_ART } from './clothing';

export type Expression = 'open' | 'happy' | 'closed' | 'wink' | 'sad' | 'surprised';

export interface BirbProps {
  colors: Record<BodyPart, string>;
  outfit?: Partial<Record<ClothingSlot, string | undefined>>;
  scale?: number;
  expression?: Expression;
  animate?: boolean;
  flap?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  viewBox?: string;
}

const EYE = '#2b2630';
const BODY_PATH =
  'M 100 50 C 150 50 164 95 162 128 C 160 166 132 184 100 184 C 68 184 40 166 38 128 C 36 95 50 50 100 50 Z';

function Eyes({ expression }: { expression: Expression }) {
  const arc = (x: number, up: boolean) => (
    <path
      d={up ? `M ${x - 8} 103 Q ${x} 93 ${x + 8} 103` : `M ${x - 8} 99 Q ${x} 107 ${x + 8} 99`}
      stroke={EYE}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
  );
  const open = (x: number, big = false) => (
    <g>
      <ellipse cx={x} cy={100} rx={big ? 8 : 7} ry={big ? 10 : 8.5} fill={EYE} />
      <circle cx={x + 2.6} cy={96.4} r={2.8} fill="#fff" />
      <circle cx={x - 2.4} cy={103.5} r={1.2} fill="#fff" opacity={0.7} />
    </g>
  );
  switch (expression) {
    case 'happy':
      return (
        <g>
          {arc(80, true)}
          {arc(120, true)}
        </g>
      );
    case 'closed':
      return (
        <g>
          {arc(80, false)}
          {arc(120, false)}
        </g>
      );
    case 'wink':
      return (
        <g>
          <g className="birb-blink">{open(80)}</g>
          {arc(120, true)}
        </g>
      );
    case 'sad':
      return (
        <g>
          <g className="birb-blink">
            {open(80)}
            {open(120)}
          </g>
          <path d="M 70 88 L 86 92 M 130 88 L 114 92" stroke={EYE} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'surprised':
      return (
        <g>
          {open(80, true)}
          {open(120, true)}
        </g>
      );
    default:
      return (
        <g className="birb-blink">
          {open(80)}
          {open(120)}
        </g>
      );
  }
}

export function Birb({ colors, outfit = {}, scale = 1, expression = 'open', animate = true, flap = false, className, style, title, viewBox = '-30 -40 260 240' }: BirbProps) {
  const uid = useId().replace(/:/g, '');
  const clip = `bodyclip-${uid}`;

  const layers: Record<string, { front?: ReactNode; back?: ReactNode }> = {};
  for (const slot of ['back', 'body', 'neck', 'eyes', 'head'] as ClothingSlot[]) {
    const def = item(outfit[slot]);
    if (!def) continue;
    const art = CLOTHING_ART[def.art];
    if (!art) continue;
    layers[slot] = art({ c: def.color, a: def.accent ?? shade(def.color, -0.5), clip });
  }
  const backs = (['back', 'body', 'neck', 'head'] as const).map((k) => layers[k]?.back && <g key={k}>{layers[k]!.back}</g>);

  const wingL = shade(colors.wings, 0.12);
  const outline = shade(colors.body, 0.35);

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      role="img"
      aria-label={title ?? 'Your birb'}
    >
      <defs>
        <clipPath id={clip}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>
      <ellipse cx={100} cy={190} rx={52 * scale} ry={6 * scale} fill="rgba(60,40,20,0.14)" />
      <g transform={`translate(100 188) scale(${scale}) translate(-100 -188)`}>
        <g className={animate ? 'birb-bob' : undefined}>
          {backs}
          {/* feet */}
          <g fill={colors.feet} stroke={shade(colors.feet, 0.3)} strokeWidth={2}>
            <path d="M 72 186 Q 72 176 82 176 Q 92 176 92 186 Z" />
            <path d="M 108 186 Q 108 176 118 176 Q 128 176 128 186 Z" />
          </g>
          {/* body */}
          <path d={BODY_PATH} fill={colors.body} stroke={outline} strokeWidth={2.5} />
          <g clipPath={`url(#${clip})`}>
            <ellipse cx={100} cy={148} rx={42} ry={36} fill={colors.belly} />
            <ellipse cx={72} cy={72} rx={14} ry={8} fill="#fff" opacity={0.25} transform="rotate(-30 72 72)" />
          </g>
          {layers.body?.front}
          {layers.back?.front}
          {/* wings */}
          <g className={flap ? 'wing-left flap' : 'wing-left'}>
            <path d="M 44 112 C 22 120 20 152 38 166 C 50 154 56 132 50 114 Z" fill={colors.wings} stroke={wingL} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
          <g className={flap ? 'wing-right flap' : 'wing-right'}>
            <path d="M 156 112 C 178 120 180 152 162 166 C 150 154 144 132 150 114 Z" fill={colors.wings} stroke={wingL} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
          {/* headpatch */}
          <path
            d="M 56 88 C 60 58 80 50 100 50 C 120 50 140 58 144 88 C 128 76 114 72 100 74 C 86 72 72 76 56 88 Z"
            fill={colors.headpatch}
            stroke={shade(colors.headpatch, 0.25)}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="M 94 52 C 90 38 97 30 106 28 C 101 37 105 44 109 51 Z" fill={colors.headpatch} stroke={shade(colors.headpatch, 0.25)} strokeWidth={2} strokeLinejoin="round" />
          {/* face */}
          <ellipse cx={66} cy={117} rx={10} ry={6} fill={colors.cheeks} opacity={0.85} />
          <ellipse cx={134} cy={117} rx={10} ry={6} fill={colors.cheeks} opacity={0.85} />
          <Eyes expression={expression} />
          <path
            d="M 90 110 Q 100 104 110 110 Q 104 122 100 123 Q 96 122 90 110 Z"
            fill={colors.beak}
            stroke={shade(colors.beak, 0.3)}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {layers.neck?.front}
          {layers.eyes?.front}
          {layers.head?.front}
        </g>
      </g>
    </svg>
  );
}
