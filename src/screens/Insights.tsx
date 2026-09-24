import { useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { ROOM_MAP } from '../data/upkeep';
import { MOODS } from '../game/constants';
import { isVisibleOn } from '../game/schedule';
import { dayRange, formatDay, parseDay, shiftDay, weekday, type DayKey } from '../lib/date';
import { useToday } from '../state/hooks';
import { useGame } from '../state/store';
import { ChartCard, ColumnChart, DivergingBars, HBars, LineChart, type Point } from '../ui/charts';
import { Chip, Page, SectionTitle } from '../ui/kit';
import { MoodCalendar, useDailyMood } from '../ui/MoodCalendar';

const PERIODS = [
  { id: '14', label: '2 weeks', days: 14 },
  { id: '30', label: '1 month', days: 30 },
  { id: '90', label: '3 months', days: 90 },
  { id: 'all', label: 'All time', days: 0 },
];
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-surface shadow-card p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="text-2xl font-black leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function topCounts(values: string[], n = 8) {
  const c = new Map<string, number>();
  for (const v of values) c.set(v, (c.get(v) ?? 0) + 1);
  return [...c.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));
}

export default function Insights() {
  const today = useToday();
  const s = useGame();
  const daily = useDailyMood();
  const [period, setPeriod] = useState('30');
  const p = PERIODS.find((x) => x.id === period)!;
  const firstDay = useMemo(() => {
    const keys = Object.keys(s.days).sort();
    return keys[0] ?? today;
  }, [s.days, today]);
  const from = p.days ? shiftDay(today, -(p.days - 1)) : firstDay < today ? firstDay : today;
  const range = useMemo(() => dayRange(from, today), [from, today]);
  const inRange = (d: DayKey) => d >= from && d <= today;

  const data = useMemo(() => {
    const moods = s.moods.filter((m) => inRange(m.day));
    const reflections = s.reflections.filter((r) => inRange(r.day));
    const activities = s.activities.filter((a) => inRange(a.day));
    const goalTitle = new Map(s.goals.map((g) => [g.id, `${g.emoji} ${g.title}`]));
    let goalsDone = 0;
    let upkeepDone = 0;
    let activeDays = 0;
    const perDay: { day: DayKey; count: number }[] = [];
    const perGoal = new Map<string, number>();
    const upkeepIds = new Set(s.goals.filter((g) => g.kind === 'upkeep').map((g) => g.id));
    for (const d of range) {
      const rec = s.days[d];
      let n = 0;
      if (rec) {
        if (rec.active) activeDays++;
        for (const [gid, gd] of Object.entries(rec.goals)) {
          if (gd.count <= 0) continue;
          n += gd.count;
          perGoal.set(gid, (perGoal.get(gid) ?? 0) + gd.count);
          if (upkeepIds.has(gid)) upkeepDone++;
        }
      }
      goalsDone += n;
      perDay.push({ day: d, count: n });
    }
    // Missed = scheduled on a past day but neither done nor skipped.
    const missed = new Map<string, number>();
    const ctx = { days: s.days, weekStartsOn: s.settings.weekStartsOn };
    for (const g of s.goals) {
      if (g.status !== 'active') continue;
      for (const d of range) {
        if (d >= today || d < g.createdDay) continue;
        const gd = s.days[d]?.goals[g.id];
        if (gd && (gd.count >= g.timesPerDay || gd.skipped)) continue;
        if (isVisibleOn(g, d, ctx)) missed.set(g.id, (missed.get(g.id) ?? 0) + 1);
      }
    }
    const tagStats = new Map<string, { sum: number; n: number }>();
    for (const r of reflections) {
      for (const t of r.tags) {
        const a = tagStats.get(t) ?? { sum: 0, n: 0 };
        a.sum += r.sentiment;
        a.n++;
        tagStats.set(t, a);
      }
    }
    const motivation = range.map((d) => s.days[d]?.motivation).filter((v): v is NonNullable<typeof v> => !!v);
    const satisfaction = range.map((d) => s.days[d]?.satisfaction).filter((v): v is NonNullable<typeof v> => !!v);
    return {
      moods,
      reflections,
      goalsDone,
      upkeepDone,
      activeDays,
      perDay,
      minutes: Math.round(activities.reduce((sum, a) => sum + (a.seconds ?? 0), 0) / 60),
      topGoals: [...perGoal.entries()].filter(([id]) => goalTitle.has(id)).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, v]) => ({ label: goalTitle.get(id)!, value: v })),
      topMissed: [...missed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, v]) => ({ label: goalTitle.get(id) ?? 'Goal', value: v })),
      tags: [...tagStats.entries()]
        .map(([label, a]) => ({ label, value: a.sum / a.n, count: a.n }))
        .filter((t) => Math.abs(t.value) > 0.05)
        .sort((a, b) => b.count - a.count || Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 8)
        .sort((a, b) => b.value - a.value),
      motivation: motivation.length ? motivation.reduce((a, b) => a + b, 0) / motivation.length : undefined,
      satisfaction: satisfaction.length ? satisfaction.reduce((a, b) => a + b, 0) / satisfaction.length : undefined,
    };
  }, [s, range, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const avgMood = data.moods.length ? data.moods.reduce((a, m) => a + m.mood, 0) / data.moods.length : undefined;

  // Mood over time: daily averages, or weekly when the range is long.
  const moodPoints: Point[] = useMemo(() => {
    if (range.length <= 45) {
      return range.map((d) => ({ key: d, label: formatDay(d, 'MMM d'), value: daily.get(d) ?? null }));
    }
    const out: Point[] = [];
    for (let i = 0; i < range.length; i += 7) {
      const wk = range.slice(i, i + 7);
      const vals = wk.map((d) => daily.get(d)).filter((v): v is number => v !== undefined);
      out.push({ key: wk[0], label: `Wk of ${formatDay(wk[0], 'MMM d')}`, value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null });
    }
    return out;
  }, [range, daily]);

  const byWeekday = useMemo(() => {
    const acc = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }));
    for (const d of range) {
      const v = daily.get(d);
      if (v === undefined) continue;
      acc[weekday(d)].sum += v;
      acc[weekday(d)].n++;
    }
    const order = s.settings.weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
    return order.map((i) => ({ key: String(i), label: DOW_LABELS[i], value: acc[i].n ? Math.round((acc[i].sum / acc[i].n) * 10) / 10 : 0, tip: `${DOW_LABELS[i]} · ${acc[i].n} day${acc[i].n === 1 ? '' : 's'}` }));
  }, [range, daily, s.settings.weekStartsOn]);

  const goalBars = useMemo(() => {
    if (data.perDay.length <= 31) return data.perDay.map((x) => ({ key: x.day, label: formatDay(x.day, 'd'), value: x.count, tip: formatDay(x.day, 'EEE, MMM d') }));
    const out: { key: string; label: string; value: number; tip: string }[] = [];
    for (let i = 0; i < data.perDay.length; i += 7) {
      const wk = data.perDay.slice(i, i + 7);
      out.push({ key: wk[0].day, label: formatDay(wk[0].day, 'M/d'), value: wk.reduce((a, b) => a + b.count, 0), tip: `Week of ${formatDay(wk[0].day, 'MMM d')}` });
    }
    return out;
  }, [data.perDay]);

  const upkeepMonths = useMemo(() => {
    const ids = new Set(s.goals.filter((g) => g.kind === 'upkeep').map((g) => g.id));
    return Array.from({ length: 6 }, (_, i) => {
      const m = format(subMonths(parseDay(today), 5 - i), 'yyyy-MM');
      let n = 0;
      for (const [d, rec] of Object.entries(s.days)) {
        if (!d.startsWith(m)) continue;
        for (const [gid, gd] of Object.entries(rec.goals)) if (ids.has(gid) && gd.count > 0) n++;
      }
      return { key: m, label: format(parseDay(`${m}-01`), 'MMM'), value: n, tip: format(parseDay(`${m}-01`), 'MMMM yyyy') };
    });
  }, [s.goals, s.days, today]);

  const overdueRooms = useMemo(() => {
    const c = new Map<string, number>();
    for (const g of s.goals) if (g.kind === 'upkeep' && g.status === 'active' && isVisibleOn(g, today, { days: s.days, weekStartsOn: s.settings.weekStartsOn })) c.set(g.room ?? 'other', (c.get(g.room ?? 'other') ?? 0) + 1);
    return [...c.entries()].map(([r, v]) => ({ label: `${ROOM_MAP[r]?.emoji ?? '🏠'} ${ROOM_MAP[r]?.name ?? 'Other'}`, value: v })).sort((a, b) => b.value - a.value);
  }, [s.goals, s.days, s.settings.weekStartsOn, today]);

  const feelings = topCounts(data.moods.flatMap((m) => m.emotions));
  const factors = topCounts(data.moods.flatMap((m) => m.factors));
  const hasMood = data.moods.length > 0;

  return (
    <Page back title="Insights" subtitle="Your self-care, at a glance">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {PERIODS.map((x) => (
          <Chip key={x.id} active={period === x.id} onClick={() => setPeriod(x.id)}>
            {x.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="Active days" value={`${data.activeDays}`} sub={`of ${range.length}`} />
        <Stat label="Goals done" value={data.goalsDone.toLocaleString()} />
        <Stat label="Avg mood" value={avgMood ? MOODS[Math.round(avgMood) - 1].emoji : '—'} sub={avgMood ? `${avgMood.toFixed(1)} / 5` : 'no logs yet'} />
        <Stat label="Reflections" value={`${data.reflections.length}`} />
        <Stat label="Mindful minutes" value={`${data.minutes}`} />
        <Stat label="Upkeep done" value={`${data.upkeepDone}`} />
      </div>

      <SectionTitle>Mood</SectionTitle>
      <div className="flex flex-col gap-3">
        <div className="rounded-3xl bg-surface shadow-card p-4">
          <MoodCalendar today={today} />
        </div>
        {hasMood ? (
          <>
            <ChartCard
              title="Mood over time"
              subtitle={range.length > 45 ? 'Weekly average, 1 = awful · 5 = great' : 'Daily average, 1 = awful · 5 = great'}
              table={{ head: ['Day', 'Mood'], rows: moodPoints.filter((x) => x.value !== null).map((x) => [x.label, x.value!.toFixed(1)]) }}
            >
              <LineChart points={moodPoints} yMin={1} yMax={5} yTicks={[1, 2, 3, 4, 5]} tickLabel={(v) => MOODS[v - 1].emoji} />
            </ChartCard>
            <ChartCard title="Mood by day of week" subtitle="Average mood (1–5)" table={{ head: ['Day', 'Avg mood'], rows: byWeekday.map((b) => [b.label, b.value ? b.value.toFixed(1) : '—']) }}>
              <ColumnChart bars={byWeekday} format={(v) => (v ? v.toFixed(1) : '0')} />
            </ChartCard>
            {(data.motivation || data.satisfaction) && (
              <div className="grid grid-cols-2 gap-2">
                <Stat label="🌅 Morning motivation" value={data.motivation ? data.motivation.toFixed(1) : '—'} sub="average, out of 5" />
                <Stat label="🌙 Evening satisfaction" value={data.satisfaction ? data.satisfaction.toFixed(1) : '—'} sub="average, out of 5" />
              </div>
            )}
            {feelings.length > 0 && (
              <ChartCard title="Feelings you named most" table={{ head: ['Feeling', 'Times'], rows: feelings.map((f) => [f.label, String(f.value)]) }}>
                <HBars rows={feelings} />
              </ChartCard>
            )}
            {factors.length > 0 && (
              <ChartCard title="What affected your mood" table={{ head: ['Factor', 'Times'], rows: factors.map((f) => [f.label, String(f.value)]) }}>
                <HBars rows={factors} />
              </ChartCard>
            )}
          </>
        ) : (
          <p className="text-sm text-muted text-center py-2">Log your mood to see trends here.</p>
        )}
      </div>

      <SectionTitle>Goals</SectionTitle>
      <div className="flex flex-col gap-3">
        <ChartCard title="Goals completed" subtitle={goalBars.length === data.perDay.length ? 'Per day' : 'Per week'} table={{ head: ['Day', 'Completed'], rows: goalBars.map((b) => [b.tip, String(b.value)]) }}>
          <ColumnChart bars={goalBars} />
        </ChartCard>
        {data.topGoals.length > 0 && (
          <ChartCard title="Most consistent" subtitle="Completions in this period" table={{ head: ['Goal', 'Done'], rows: data.topGoals.map((g) => [g.label, String(g.value)]) }}>
            <HBars rows={data.topGoals} />
          </ChartCard>
        )}
        {data.topMissed.length > 0 && (
          <ChartCard title="Could use a tweak" subtitle="Days scheduled but not done—maybe make them smaller or less frequent?" table={{ head: ['Goal', 'Missed'], rows: data.topMissed.map((g) => [g.label, String(g.value)]) }}>
            <HBars rows={data.topMissed} />
          </ChartCard>
        )}
      </div>

      <SectionTitle>Home upkeep</SectionTitle>
      <div className="flex flex-col gap-3">
        <ChartCard title="Upkeep tasks finished" subtitle="Last 6 months" table={{ head: ['Month', 'Tasks'], rows: upkeepMonths.map((m) => [m.tip, String(m.value)]) }}>
          <ColumnChart bars={upkeepMonths} labelEvery={1} />
        </ChartCard>
        {overdueRooms.length > 0 && (
          <ChartCard title="Due now, by room" table={{ head: ['Room', 'Due'], rows: overdueRooms.map((r) => [r.label, String(r.value)]) }}>
            <HBars rows={overdueRooms} />
          </ChartCard>
        )}
      </div>

      <SectionTitle>Reflections</SectionTitle>
      {data.tags.length > 0 ? (
        <ChartCard title="What lifts you up—and weighs you down" subtitle="Tone of reflections that mention each tag" table={{ head: ['Tag', 'Tone (−1 to 1)'], rows: data.tags.map((t) => [`#${t.label} (${t.count}×)`, t.value.toFixed(2)]) }}>
          <DivergingBars rows={data.tags} />
        </ChartCard>
      ) : (
        <p className="text-sm text-muted text-center py-2">Write reflections (with #tags) to see what lifts you up.</p>
      )}
    </Page>
  );
}
