import type { ReactNode } from 'react';
import { SPECIES_MAP } from '../data/micropets';
import { shade } from '../data/palette';

const EYE = '#2b2630';

function Face({ y = 60, spread = 8, blush = '#f5a3b5', smile = true }: { y?: number; spread?: number; blush?: string; smile?: boolean }) {
  return (
    <g>
      <ellipse cx={50 - spread} cy={y} rx={3} ry={3.6} fill={EYE} />
      <ellipse cx={50 + spread} cy={y} rx={3} ry={3.6} fill={EYE} />
      <circle cx={50 - spread + 1} cy={y - 1.3} r={1.1} fill="#fff" />
      <circle cx={50 + spread + 1} cy={y - 1.3} r={1.1} fill="#fff" />
      <ellipse cx={50 - spread - 5} cy={y + 6} rx={3.5} ry={2} fill={blush} opacity={0.7} />
      <ellipse cx={50 + spread + 5} cy={y + 6} rx={3.5} ry={2} fill={blush} opacity={0.7} />
      {smile && <path d={`M ${47} ${y + 5} Q 50 ${y + 8} 53 ${y + 5}`} stroke={EYE} strokeWidth={1.6} fill="none" strokeLinecap="round" />}
    </g>
  );
}

function Blob({ c, cy = 66, rx = 24, ry = 21 }: { c: string; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={50} cy={cy} rx={rx} ry={ry} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />;
}

function Feet({ c }: { c: string }) {
  return (
    <g fill={shade(c, 0.12)} stroke={shade(c, 0.3)} strokeWidth={1.5}>
      <ellipse cx={40} cy={87} rx={6} ry={3.5} />
      <ellipse cx={60} cy={87} rx={6} ry={3.5} />
    </g>
  );
}

const DRAW: Record<string, (c: string) => ReactNode> = {
  mochi: (c) => (
    <g>
      <path d="M 72 78 Q 90 76 86 62 Q 84 54 92 50" stroke={shade(c, 0.3)} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <circle cx={30} cy={44} r={12} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={70} cy={44} r={12} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={30} cy={44} r={6.5} fill="#f6b7c6" />
      <circle cx={70} cy={44} r={6.5} fill="#f6b7c6" />
      <Feet c={c} />
      <Blob c={c} />
      <Face />
      <circle cx={50} cy={64} r={2} fill="#e98aa0" />
    </g>
  ),
  biscuit: (c) => (
    <g>
      <path d="M 72 72 Q 82 64 80 56" stroke={shade(c, 0.3)} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Feet c={c} />
      <Blob c={c} />
      <ellipse cx={27} cy={58} rx={8} ry={15} fill={shade(c, 0.25)} transform="rotate(15 27 58)" />
      <ellipse cx={73} cy={58} rx={8} ry={15} fill={shade(c, 0.25)} transform="rotate(-15 73 58)" />
      <ellipse cx={50} cy={68} rx={10} ry={7} fill={shade(c, -0.4)} />
      <Face y={58} smile={false} />
      <ellipse cx={50} cy={65} rx={3} ry={2.2} fill={EYE} />
      <path d="M 47 70 Q 50 73 53 70" stroke={EYE} strokeWidth={1.4} fill="none" />
    </g>
  ),
  whiskers: (c) => (
    <g>
      <path d="M 72 80 Q 92 78 88 58 Q 86 50 80 52" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 28 52 L 32 32 L 44 46 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 72 52 L 68 32 L 56 46 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 32 48 L 34 38 L 40 45 Z M 68 48 L 66 38 L 60 45 Z" fill="#f6b7c6" />
      <Feet c={c} />
      <Blob c={c} />
      <Face />
      <path d="M 30 64 L 20 62 M 30 67 L 20 69 M 70 64 L 80 62 M 70 67 L 80 69" stroke={shade(c, 0.4)} strokeWidth={1.2} />
    </g>
  ),
  bun: (c) => (
    <g>
      <ellipse cx={40} cy={28} rx={7} ry={20} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} transform="rotate(-10 40 28)" />
      <ellipse cx={60} cy={28} rx={7} ry={20} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} transform="rotate(10 60 28)" />
      <ellipse cx={40} cy={30} rx={3} ry={14} fill="#f6b7c6" transform="rotate(-10 40 30)" />
      <ellipse cx={60} cy={30} rx={3} ry={14} fill="#f6b7c6" transform="rotate(10 60 30)" />
      <circle cx={76} cy={80} r={6} fill="#fff" stroke={shade(c, 0.2)} strokeWidth={1.5} />
      <Feet c={c} />
      <Blob c={c} />
      <Face />
    </g>
  ),
  pebble: (c) => (
    <g>
      <ellipse cx={50} cy={60} rx={34} ry={24} fill={shade(c, 0.2)} stroke={shade(c, 0.45)} strokeWidth={2} />
      <path d="M 36 44 L 50 38 L 64 44 L 64 58 L 50 64 L 36 58 Z" fill="none" stroke={shade(c, 0.45)} strokeWidth={2} />
      <path d="M 22 54 L 36 50 M 78 54 L 64 50 M 30 72 L 38 60 M 70 72 L 62 60" stroke={shade(c, 0.45)} strokeWidth={2} />
      <ellipse cx={30} cy={86} rx={7} ry={4} fill={shade(c, -0.25)} />
      <ellipse cx={70} cy={86} rx={7} ry={4} fill={shade(c, -0.25)} />
      <circle cx={50} cy={72} r={15} fill={shade(c, -0.25)} stroke={shade(c, 0.3)} strokeWidth={2} />
      <Face y={70} spread={6} />
    </g>
  ),
  sprout: (c) => (
    <g>
      <path d="M 14 88 Q 12 72 32 70 L 80 72 Q 90 76 86 88 Z" fill="#f2e2c4" stroke="#c6a877" strokeWidth={2} />
      <circle cx={60} cy={56} r={22} fill={c} stroke={shade(c, 0.35)} strokeWidth={2} />
      <path d="M 60 56 m -3 0 a 3 3 0 1 1 6 0 a 7 7 0 1 1 -13 0 a 11 11 0 1 1 22 0 a 15 15 0 1 1 -30 0" stroke={shade(c, 0.35)} strokeWidth={2} fill="none" />
      <path d="M 24 72 L 20 52 M 30 72 L 32 52" stroke="#c6a877" strokeWidth={2.5} />
      <circle cx={20} cy={50} r={3.5} fill={EYE} />
      <circle cx={32} cy={50} r={3.5} fill={EYE} />
      <circle cx={21} cy={49} r={1.2} fill="#fff" />
      <circle cx={33} cy={49} r={1.2} fill="#fff" />
      <path d="M 22 80 Q 26 83 30 80" stroke={EYE} strokeWidth={1.5} fill="none" />
    </g>
  ),
  nimbus: (c) => (
    <g className="float">
      <g fill={c} stroke={shade(c, 0.15)} strokeWidth={2}>
        <circle cx={32} cy={62} r={15} />
        <circle cx={50} cy={52} r={19} />
        <circle cx={68} cy={62} r={15} />
        <rect x={24} y={60} width={52} height={20} rx={10} />
      </g>
      <rect x={26} y={60} width={48} height={18} rx={9} fill={c} />
      <Face y={64} />
    </g>
  ),
  ember: (c) => (
    <g>
      <path d="M 76 74 Q 94 72 94 86" stroke={c} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={50} cy={72} rx={30} ry={16} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={40} cy={66} r={2.5} fill={shade(c, 0.25)} />
      <circle cx={62} cy={70} r={3} fill={shade(c, 0.25)} />
      <circle cx={52} cy={78} r={2} fill={shade(c, 0.25)} />
      <ellipse cx={32} cy={87} rx={5} ry={3} fill={shade(c, 0.15)} />
      <ellipse cx={66} cy={87} rx={5} ry={3} fill={shade(c, 0.15)} />
      <Face y={68} spread={9} />
    </g>
  ),
  bloop: (c) => (
    <g>
      <path d="M 20 84 Q 18 48 50 40 Q 82 48 80 84 Q 74 90 68 84 Q 62 92 56 86 Q 50 92 44 86 Q 38 92 32 84 Q 26 90 20 84 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} opacity={0.95} />
      <ellipse cx={36} cy={54} rx={6} ry={4} fill="#fff" opacity={0.5} transform="rotate(-30 36 54)" />
      <Face y={64} />
    </g>
  ),
  hazel: (c) => (
    <g>
      <path d="M 22 70 L 18 58 L 28 56 L 26 44 L 38 46 L 40 34 L 50 40 L 58 32 L 62 44 L 74 40 L 74 52 L 84 54 L 80 66 L 86 74 L 76 76 Z" fill={shade(c, 0.3)} stroke={shade(c, 0.45)} strokeWidth={2} strokeLinejoin="round" />
      <Feet c={c} />
      <Blob c={c} cy={68} rx={22} ry={19} />
      <ellipse cx={50} cy={70} rx={14} ry={12} fill={shade(c, -0.45)} />
      <Face y={66} spread={6} />
      <circle cx={50} cy={72} r={2} fill={EYE} />
    </g>
  ),
  button: (c) => (
    <g>
      <ellipse cx={50} cy={70} rx={30} ry={18} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={36} cy={52} r={10} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={64} cy={52} r={10} fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={36} cy={52} r={6} fill="#fff" />
      <circle cx={64} cy={52} r={6} fill="#fff" />
      <circle cx={37} cy={53} r={3.5} fill={EYE} />
      <circle cx={65} cy={53} r={3.5} fill={EYE} />
      <path d="M 34 72 Q 50 82 66 72" stroke={shade(c, 0.45)} strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={30} cy={74} rx={4} ry={2.2} fill="#f5a3b5" opacity={0.7} />
      <ellipse cx={70} cy={74} rx={4} ry={2.2} fill="#f5a3b5" opacity={0.7} />
      <ellipse cx={28} cy={87} rx={8} ry={3.5} fill={shade(c, 0.15)} />
      <ellipse cx={72} cy={87} rx={8} ry={3.5} fill={shade(c, 0.15)} />
    </g>
  ),
  clover: (c) => (
    <g>
      <g fill={c} stroke={shade(c, 0.15)} strokeWidth={1.5}>
        {[
          [30, 60],
          [40, 48],
          [54, 44],
          [68, 50],
          [74, 64],
          [70, 78],
          [30, 76],
          [50, 82],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={12} />
        ))}
      </g>
      <Feet c="#3e3a3f" />
      <ellipse cx={50} cy={66} rx={15} ry={14} fill={c === '#3e3a3f' ? '#f3ede4' : '#3e3a3f'} />
      <ellipse cx={33} cy={60} rx={7} ry={4} fill={c === '#3e3a3f' ? '#f3ede4' : '#3e3a3f'} transform="rotate(20 33 60)" />
      <ellipse cx={67} cy={60} rx={7} ry={4} fill={c === '#3e3a3f' ? '#f3ede4' : '#3e3a3f'} transform="rotate(-20 67 60)" />
      <g>
        <ellipse cx={44} cy={64} rx={2.4} ry={3} fill={c === '#3e3a3f' ? EYE : '#fff'} />
        <ellipse cx={56} cy={64} rx={2.4} ry={3} fill={c === '#3e3a3f' ? EYE : '#fff'} />
        <path d="M 47 71 Q 50 74 53 71" stroke={c === '#3e3a3f' ? EYE : '#fff'} strokeWidth={1.4} fill="none" />
      </g>
    </g>
  ),
  bramble: (c) => (
    <g>
      <path d="M 70 78 Q 96 80 92 56 Q 90 46 80 50 Q 86 64 70 70 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <path d="M 86 52 Q 92 48 92 56 Q 88 58 86 52 Z" fill="#fff" />
      <path d="M 28 54 L 30 30 L 46 46 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <path d="M 72 54 L 70 30 L 54 46 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} strokeLinejoin="round" />
      <Feet c={shade(c, 0.4)} />
      <Blob c={c} />
      <path d="M 30 66 Q 50 90 70 66 Q 60 72 50 70 Q 40 72 30 66 Z" fill="#fff" />
      <Face />
      <circle cx={50} cy={66} r={2} fill={EYE} />
    </g>
  ),
  pudding: (c) => (
    <g>
      <path d="M 74 72 q 8 -2 6 -8 q -2 -5 -6 -1 q -3 4 2 5" stroke={shade(c, 0.3)} strokeWidth={2} fill="none" />
      <path d="M 30 48 L 32 36 L 42 44 Z M 70 48 L 68 36 L 58 44 Z" fill={shade(c, 0.1)} stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <Feet c={c} />
      <Blob c={c} />
      <Face y={58} smile={false} />
      <ellipse cx={50} cy={68} rx={8} ry={6} fill={shade(c, 0.12)} stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <ellipse cx={47} cy={68} rx={1.5} ry={2} fill={shade(c, 0.45)} />
      <ellipse cx={53} cy={68} rx={1.5} ry={2} fill={shade(c, 0.45)} />
    </g>
  ),
  tofu: (c) => (
    <g>
      <path d="M 18 82 Q 20 44 50 42 Q 80 44 82 82 Q 50 92 18 82 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <ellipse cx={24} cy={80} rx={10} ry={5} fill={shade(c, 0.15)} transform="rotate(-20 24 80)" />
      <ellipse cx={76} cy={80} rx={10} ry={5} fill={shade(c, 0.15)} transform="rotate(20 76 80)" />
      <Face y={60} />
      <path d="M 40 66 L 30 64 M 40 68 L 30 70 M 60 66 L 70 64 M 60 68 L 70 70" stroke={shade(c, 0.4)} strokeWidth={1.2} />
      <ellipse cx={50} cy={64} rx={3} ry={2} fill={EYE} />
    </g>
  ),
  twinkle: (c) => (
    <g className="float">
      <polygon
        points="50,22 60,46 86,48 66,64 72,88 50,74 28,88 34,64 14,48 40,46"
        fill={c}
        stroke={shade(c, 0.3)}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Face y={58} spread={7} />
    </g>
  ),
  moss: (c) => (
    <g>
      <path d="M 34 60 Q 32 86 38 88 H 62 Q 68 86 66 60 Z" fill="#f4ead6" stroke="#c9b48f" strokeWidth={2} />
      <path d="M 14 60 Q 16 28 50 26 Q 84 28 86 60 Q 50 68 14 60 Z" fill={c} stroke={shade(c, 0.3)} strokeWidth={2} />
      <circle cx={34} cy={44} r={5} fill="#fff" opacity={0.9} />
      <circle cx={56} cy={36} r={4} fill="#fff" opacity={0.9} />
      <circle cx={70} cy={50} r={4.5} fill="#fff" opacity={0.9} />
      <Face y={72} spread={6} />
    </g>
  ),
  honey: (c) => (
    <g>
      <ellipse cx={34} cy={42} rx={10} ry={7} fill="#e8f6ff" stroke="#9cc6da" strokeWidth={1.5} opacity={0.9} className="wing-buzz" />
      <ellipse cx={66} cy={42} rx={10} ry={7} fill="#e8f6ff" stroke="#9cc6da" strokeWidth={1.5} opacity={0.9} className="wing-buzz" />
      <path d="M 42 46 L 38 32 M 58 46 L 62 32" stroke={EYE} strokeWidth={1.8} />
      <circle cx={38} cy={31} r={2.5} fill={EYE} />
      <circle cx={62} cy={31} r={2.5} fill={EYE} />
      <Blob c={c} />
      <path d="M 28 70 Q 50 76 72 70 M 32 80 Q 50 86 68 80" stroke="#3b3040" strokeWidth={5} fill="none" />
      <Face y={58} />
    </g>
  ),
  juniper: (c) => (
    <g>
      <path d="M 28 46 L 26 30 L 40 42 Z M 72 46 L 74 30 L 60 42 Z" fill={shade(c, 0.2)} />
      <Feet c="#e9a15f" />
      <Blob c={c} cy={64} rx={25} ry={24} />
      <ellipse cx={50} cy={74} rx={15} ry={12} fill={shade(c, -0.4)} />
      <circle cx={40} cy={56} r={9} fill="#fff" stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <circle cx={60} cy={56} r={9} fill="#fff" stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <circle cx={40} cy={57} r={4.5} fill={EYE} />
      <circle cx={60} cy={57} r={4.5} fill={EYE} />
      <circle cx={41.5} cy={55} r={1.5} fill="#fff" />
      <circle cx={61.5} cy={55} r={1.5} fill="#fff" />
      <path d="M 47 63 L 53 63 L 50 68 Z" fill="#f5b945" />
    </g>
  ),
  nugget: (c) => (
    <g>
      <circle cx={33} cy={46} r={6} fill={shade(c, 0.1)} stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <circle cx={67} cy={46} r={6} fill={shade(c, 0.1)} stroke={shade(c, 0.3)} strokeWidth={1.5} />
      <Feet c="#f4b6c2" />
      <Blob c={c} cy={66} rx={26} ry={22} />
      <ellipse cx={50} cy={74} rx={16} ry={12} fill="#fff6ea" />
      <ellipse cx={30} cy={68} rx={8} ry={7} fill={shade(c, -0.15)} />
      <ellipse cx={70} cy={68} rx={8} ry={7} fill={shade(c, -0.15)} />
      <Face y={60} />
    </g>
  ),
  marzi: (c) => (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} stroke={shade(c, 0.25)} strokeWidth={4} strokeLinecap="round">
          <path d={`M ${50 + s * 22} 56 L ${50 + s * 36} 44`} />
          <path d={`M ${50 + s * 24} 62 L ${50 + s * 40} 58`} />
          <path d={`M ${50 + s * 22} 68 L ${50 + s * 36} 72`} />
        </g>
      ))}
      <Feet c={c} />
      <Blob c={c} cy={66} rx={25} ry={20} />
      <Face y={62} spread={10} />
      <path d="M 40 70 Q 50 76 60 70" stroke={EYE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </g>
  ),
  figgy: (c) => (
    <g>
      <path d="M 28 62 L 6 50 L 10 62 L 2 70 L 14 72 L 12 82 L 28 74 Z" fill={shade(c, 0.15)} stroke={shade(c, 0.4)} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M 72 62 L 94 50 L 90 62 L 98 70 L 86 72 L 88 82 L 72 74 Z" fill={shade(c, 0.15)} stroke={shade(c, 0.4)} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M 32 52 L 30 32 L 44 46 Z M 68 52 L 70 32 L 56 46 Z" fill={c} stroke={shade(c, 0.4)} strokeWidth={1.5} />
      <Blob c={c} />
      <Face blush="#e58fb0" />
      <path d="M 46 70 L 47 74 L 48 70 M 52 70 L 53 74 L 54 70" fill="#fff" />
    </g>
  ),
  dewdrop: (c) => (
    <g className="float">
      {[30, 40, 50, 60, 70].map((x, i) => (
        <path key={x} d={`M ${x} 60 Q ${x + (i % 2 ? 5 : -5)} 72 ${x} 80 Q ${x + (i % 2 ? -5 : 5)} 88 ${x} 94`} stroke={shade(c, 0.15)} strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      <path d="M 20 62 Q 20 28 50 28 Q 80 28 80 62 Q 50 70 20 62 Z" fill={c} stroke={shade(c, 0.25)} strokeWidth={2} opacity={0.95} />
      <ellipse cx={36} cy={40} rx={6} ry={4} fill="#fff" opacity={0.5} />
      <Face y={50} />
    </g>
  ),
  lovebug: (c) => (
    <g>
      <path d="M 44 36 L 38 24 M 56 36 L 62 24" stroke={EYE} strokeWidth={1.8} />
      <circle cx={38} cy={23} r={2.5} fill={EYE} />
      <circle cx={62} cy={23} r={2.5} fill={EYE} />
      <Feet c="#3b3040" />
      <ellipse cx={50} cy={46} rx={15} ry={12} fill="#3b3040" />
      <path d="M 22 72 Q 22 46 50 46 Q 78 46 78 72 Q 78 88 50 88 Q 22 88 22 72 Z" fill={c} stroke={shade(c, 0.35)} strokeWidth={2} />
      <path d="M 50 48 V 88" stroke={shade(c, 0.35)} strokeWidth={2} />
      {[
        [36, 64],
        [64, 64],
        [34, 78],
        [66, 78],
        [44, 56],
        [56, 56],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#3b3040" />
      ))}
      <circle cx={45} cy={44} r={2.4} fill="#fff" />
      <circle cx={55} cy={44} r={2.4} fill="#fff" />
    </g>
  ),
  drift: (c) => (
    <g>
      <path d="M 26 58 Q 6 40 12 30 Q 22 40 32 44 Z" fill={shade(c, -0.25)} stroke={shade(c, 0.3)} strokeWidth={1.5} className="wing-left flap" />
      <path d="M 74 58 Q 94 40 88 30 Q 78 40 68 44 Z" fill={shade(c, -0.25)} stroke={shade(c, 0.3)} strokeWidth={1.5} className="wing-right flap" />
      <path d="M 40 46 L 36 32 L 46 42 Z M 60 46 L 64 32 L 54 42 Z" fill="#f7e3a1" stroke="#c9a54a" strokeWidth={1.2} />
      <path d="M 72 78 Q 90 82 92 70" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 90 66 L 96 64 L 93 72 Z" fill={shade(c, 0.2)} />
      <Feet c={c} />
      <Blob c={c} />
      <ellipse cx={50} cy={74} rx={13} ry={10} fill={shade(c, -0.4)} />
      <Face y={60} />
    </g>
  ),
};

export function Micropet({
  species,
  variant = 0,
  grown = false,
  className,
  bounce = true,
}: {
  species: string;
  variant?: number;
  grown?: boolean;
  className?: string;
  bounce?: boolean;
}) {
  const sp = SPECIES_MAP[species];
  const color = sp?.variants[variant] ?? '#ddd';
  const draw = DRAW[species] ?? DRAW.bloop;
  const s = grown ? 1 : 0.82;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={sp ? `${sp.name} the ${sp.kind}` : 'Micropet'}>
      <ellipse cx={50} cy={92} rx={26 * s} ry={3.5} fill="rgba(60,40,20,0.14)" />
      <g transform={`translate(50 92) scale(${s}) translate(-50 -92)`}>
        <g className={bounce ? 'pet-hop' : undefined}>{draw(color)}</g>
      </g>
    </svg>
  );
}
