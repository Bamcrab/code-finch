import { useMemo, useState } from 'react';
import { addMonths, format, startOfMonth } from 'date-fns';
import { MOODS } from '../game/constants';
import { daysInMonth, parseDay, type DayKey } from '../lib/date';
import { useGame } from '../state/store';
import { MoodLegend, moodFill, moodInk } from './charts';
import { cx } from './kit';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function useDailyMood() {
  const moods = useGame((s) => s.moods);
  return useMemo(() => {
    const acc = new Map<DayKey, { sum: number; n: number }>();
    for (const m of moods) {
      const a = acc.get(m.day) ?? { sum: 0, n: 0 };
      a.sum += m.mood;
      a.n += 1;
      acc.set(m.day, a);
    }
    return new Map([...acc.entries()].map(([d, a]) => [d, a.sum / a.n]));
  }, [moods]);
}

export function MoodCalendar({ today, onPick, selected, showActivity = false }: { today: DayKey; onPick?: (d: DayKey) => void; selected?: DayKey; showActivity?: boolean }) {
  const daily = useDailyMood();
  const days = useGame((s) => s.days);
  const weekStartsOn = useGame((s) => s.settings.weekStartsOn);
  const [offset, setOffset] = useState(0);
  const month = addMonths(startOfMonth(parseDay(today)), offset);
  const mk = format(month, 'yyyy-MM');
  const total = daysInMonth(`${mk}-01`);
  const lead = (month.getDay() - weekStartsOn + 7) % 7;
  const labels = weekStartsOn === 1 ? [...DOW.slice(1), DOW[0]] : DOW;
  const [hover, setHover] = useState<DayKey | null>(null);
  const hovered = hover ? daily.get(hover) : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button aria-label="Previous month" className="w-8 h-8 rounded-full hover:bg-surface-2 font-black" onClick={() => setOffset(offset - 1)}>
          ‹
        </button>
        <span className="font-black">{format(month, 'MMMM yyyy')}</span>
        <button aria-label="Next month" className="w-8 h-8 rounded-full hover:bg-surface-2 font-black disabled:opacity-30" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-center">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] font-bold text-muted pb-1">
            {l}
          </span>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: total }).map((_, i) => {
          const d = `${mk}-${String(i + 1).padStart(2, '0')}`;
          const avg = daily.get(d);
          const future = d > today;
          const active = days[d]?.active;
          return (
            <button
              key={d}
              disabled={future || !onPick}
              onClick={() => onPick?.(d)}
              onPointerEnter={() => setHover(d)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(d)}
              onBlur={() => setHover(null)}
              aria-label={`${format(parseDay(d), 'MMM d')}${avg !== undefined ? `, mood ${MOODS[Math.round(avg) - 1].label}` : ''}`}
              className={cx(
                'relative aspect-square rounded-[6px] text-[11px] font-bold grid place-items-center transition',
                future && 'opacity-30',
                d === today && 'ring-2 ring-ink/40',
                selected === d && 'ring-2 ring-accent',
                !avg && 'bg-surface-2',
              )}
              style={{ background: moodFill(avg), color: moodInk(avg) }}
            >
              {i + 1}
              {showActivity && active && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: avg !== undefined ? moodInk(avg) : 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted text-center mt-2 h-4">
        {hover ? `${format(parseDay(hover), 'EEE, MMM d')} · ${hovered !== undefined ? `average mood ${MOODS[Math.round(hovered) - 1].label.toLowerCase()} (${hovered.toFixed(1)})` : 'no mood logged'}` : ''}
      </p>
      <MoodLegend />
    </div>
  );
}
