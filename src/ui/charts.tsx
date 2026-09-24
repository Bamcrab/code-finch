import { useState, type ReactNode } from 'react';
import { cx } from './kit';

/*
 * Small SVG charts following the dataviz rules: one series in --viz-series, thin marks
 * (2px lines, <=24px bars with 4px rounded data-ends), hairline solid grid, hover
 * tooltips that never gate (every chart has a table view), text in ink tokens.
 */

const W = 340;

interface TipState {
  x: number;
  y: number;
  value: string;
  label: string;
}

function Tooltip({ tip }: { tip: TipState | null }) {
  if (!tip) return null;
  const left = `${(tip.x / W) * 100}%`;
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-surface shadow-card border border-line px-2.5 py-1.5 text-center whitespace-nowrap" style={{ left, top: tip.y }}>
      <div className="text-sm font-black text-ink">{tip.value}</div>
      <div className="text-[11px] text-muted">{tip.label}</div>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  table,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  table?: { head: [string, string]; rows: [string, string][] };
  className?: string;
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <div className={cx('rounded-3xl bg-surface shadow-card p-4', className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-black leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {table && (
          <div className="flex shrink-0 rounded-full bg-surface-2 p-0.5 text-[11px] font-bold">
            {(['chart', 'table'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cx('px-2.5 h-6 rounded-full capitalize', view === v ? 'bg-surface shadow-card' : 'text-muted')}>
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
      {view === 'chart' || !table ? (
        children
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs">
                <th className="font-bold py-1">{table.head[0]}</th>
                <th className="font-bold py-1 text-right">{table.head[1]}</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map(([a, b], i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-1.5">{a}</td>
                  <td className="py-1.5 text-right font-bold tabular-nums">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export interface Point {
  key: string;
  label: string;
  value: number | null;
}

export function LineChart({
  points,
  yMin,
  yMax,
  yTicks,
  formatY = (v) => String(Math.round(v * 10) / 10),
  tickLabel,
  height = 150,
}: {
  points: Point[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  formatY?: (v: number) => string;
  tickLabel?: (v: number) => string;
  height?: number;
}) {
  const [tip, setTip] = useState<(TipState & { i: number }) | null>(null);
  const m = { l: 28, r: 32, t: 10, b: 22 };
  const pw = W - m.l - m.r;
  const ph = height - m.t - m.b;
  const n = points.length;
  const x = (i: number) => m.l + (n <= 1 ? pw / 2 : (i / (n - 1)) * pw);
  const y = (v: number) => m.t + ph - ((v - yMin) / (yMax - yMin || 1)) * ph;

  let d = '';
  let pen = false;
  points.forEach((p, i) => {
    if (p.value === null) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)} `;
    pen = true;
  });
  const lastIdx = [...points.keys()].reverse().find((i) => points[i].value !== null);
  const labelIdx = n > 2 ? [0, Math.floor((n - 1) / 2), n - 1] : points.map((_, i) => i);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    let best = -1;
    let bestD = Infinity;
    points.forEach((p, i) => {
      if (p.value === null) return;
      const dd = Math.abs(x(i) - vx);
      if (dd < bestD) {
        bestD = dd;
        best = i;
      }
    });
    if (best < 0) return setTip(null);
    const p = points[best];
    setTip({ i: best, x: x(best), y: (y(p.value!) / height) * r.height - 8, value: formatY(p.value!), label: p.label });
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full touch-pan-y" onPointerMove={onMove} onPointerLeave={() => setTip(null)} role="img" aria-label="Line chart">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--viz-muted)">
              {tickLabel ? tickLabel(t) : t}
            </text>
          </g>
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={10} fill="var(--viz-muted)">
            {points[i]?.label}
          </text>
        ))}
        <path d={d} fill="none" stroke="var(--viz-series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (p.value !== null && (i === 0 || points[i - 1].value === null) && (i === n - 1 || points[i + 1].value === null) ? <circle key={i} cx={x(i)} cy={y(p.value)} r={2.5} fill="var(--viz-series)" /> : null))}
        {lastIdx !== undefined && points[lastIdx].value !== null && (
          <g>
            <circle cx={x(lastIdx)} cy={y(points[lastIdx].value!)} r={4} fill="var(--viz-series)" stroke="var(--surface)" strokeWidth={2} />
            <text x={x(lastIdx) + 7} y={y(points[lastIdx].value!) + 3.5} fontSize={10} fontWeight={800} fill="var(--viz-ink)">
              {formatY(points[lastIdx].value!)}
            </text>
          </g>
        )}
        {tip && (
          <g pointerEvents="none">
            <line x1={tip.x} x2={tip.x} y1={m.t} y2={m.t + ph} stroke="var(--viz-axis)" strokeWidth={1} />
            <circle cx={tip.x} cy={y(points[tip.i].value!)} r={4.5} fill="var(--viz-series)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export interface Bar {
  key: string;
  label: string;
  value: number;
  tip?: string;
}

export function ColumnChart({ bars, height = 150, format = (v) => String(v), labelEvery }: { bars: Bar[]; height?: number; format?: (v: number) => string; labelEvery?: number }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const m = { l: 28, r: 8, t: 16, b: 22 };
  const pw = W - m.l - m.r;
  const ph = height - m.t - m.b;
  const integers = bars.every((b) => Number.isInteger(b.value));
  // Counts get whole-number ticks: at least 0/2/4, always an even max so the midline is an integer.
  const rawMax = Math.max(0, ...bars.map((b) => b.value));
  const max = integers ? Math.max(4, Math.ceil(niceMax(rawMax) / 2) * 2) : niceMax(rawMax);
  const band = pw / Math.max(1, bars.length);
  const bw = Math.min(24, band * 0.62);
  const y = (v: number) => m.t + ph - (v / max) * ph;
  const every = labelEvery ?? Math.max(1, Math.ceil(bars.length / 7));
  const maxIdx = bars.reduce((best, b, i) => (b.value > (bars[best]?.value ?? -1) ? i : best), 0);
  const ticks = [0, max / 2, max];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Column chart" onPointerLeave={() => setTip(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} strokeWidth={1} />
            <text x={m.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--viz-muted)">
              {format(t)}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx0 = m.l + band * i + band / 2;
          const top = y(b.value);
          const h = m.t + ph - top;
          const r = Math.min(4, h);
          const x0 = cx0 - bw / 2;
          const path = h > 0 ? `M ${x0} ${m.t + ph} V ${top + r} Q ${x0} ${top} ${x0 + r} ${top} H ${x0 + bw - r} Q ${x0 + bw} ${top} ${x0 + bw} ${top + r} V ${m.t + ph} Z` : '';
          const active = tip?.label === (b.tip ?? b.label);
          return (
            <g key={b.key}>
              {path && <path d={path} fill="var(--viz-series)" opacity={tip && !active ? 0.55 : 1} />}
              {i === maxIdx && b.value > 0 && (
                <text x={cx0} y={top - 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="var(--viz-ink)">
                  {format(b.value)}
                </text>
              )}
              {i % every === 0 && (
                <text x={cx0} y={height - 6} textAnchor="middle" fontSize={10} fill="var(--viz-muted)">
                  {b.label}
                </text>
              )}
              <rect
                x={m.l + band * i}
                y={m.t}
                width={band}
                height={ph}
                fill="transparent"
                tabIndex={0}
                onPointerMove={(e) => {
                  const rr = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setTip({ x: cx0, y: (Math.min(top, m.t + ph - 4) / height) * rr.height - 6, value: format(b.value), label: b.tip ?? b.label });
                }}
                onFocus={() => setTip({ x: cx0, y: top - 6, value: format(b.value), label: b.tip ?? b.label })}
                onBlur={() => setTip(null)}
              />
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}

export function HBars({ rows, format = (v) => String(v) }: { rows: { label: string; value: number }[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-sm font-bold truncate">{r.label}</span>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="h-3.5 rounded-r-[4px]" style={{ width: `${(r.value / max) * 85}%`, background: 'var(--viz-series)', minWidth: 3 }} />
            <span className="text-xs font-extrabold text-ink shrink-0">{format(r.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Centered bars: right = lifts you up (blue), left = weighs you down (red). */
export function DivergingBars({ rows }: { rows: { label: string; value: number; count: number }[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[11px] font-bold text-muted mb-1.5">
        <span className="w-24 shrink-0" />
        <span className="flex-1 grid grid-cols-2">
          <span className="text-right pr-2">◀ weighs down</span>
          <span className="pl-2">lifts up ▶</span>
        </span>
        <span className="w-8 shrink-0" />
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => {
          const w = Math.min(1, Math.abs(r.value)) * 50;
          return (
            <div key={r.label} className="flex items-center gap-2" title={`${r.label}: ${r.count} mentions`}>
              <span className="w-24 shrink-0 text-sm font-bold truncate">#{r.label}</span>
              <div className="relative flex-1 h-4">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--viz-axis)]" />
                <div
                  className="absolute top-0.5 bottom-0.5"
                  style={
                    r.value >= 0
                      ? { left: '50%', width: `${w}%`, background: 'var(--mood-5)', borderRadius: '0 4px 4px 0' }
                      : { right: '50%', width: `${w}%`, background: 'var(--mood-1)', borderRadius: '4px 0 0 4px' }
                  }
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-extrabold tabular-nums">{r.count}×</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MOOD_LABELS = ['Awful', 'Bad', 'Okay', 'Good', 'Great'];

export function MoodLegend() {
  return (
    <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
      {MOOD_LABELS.map((l, i) => (
        <span key={l} className="flex items-center gap-1 text-[11px] font-bold text-muted">
          <span className="w-3 h-3 rounded-[3px] border border-black/5" style={{ background: `var(--mood-${i + 1})` }} />
          {l}
        </span>
      ))}
    </div>
  );
}

export function moodFill(avg: number | undefined): string | undefined {
  if (avg === undefined) return undefined;
  return `var(--mood-${Math.min(5, Math.max(1, Math.round(avg)))})`;
}

/** Ink that stays readable inside a mood fill (per-theme token picked by the fill's luminance). */
export function moodInk(avg: number | undefined): string {
  if (avg === undefined) return 'var(--muted)';
  return `var(--mood-ink-${Math.min(5, Math.max(1, Math.round(avg)))})`;
}
