import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_UPKEEP_LINES } from '../data/dialogue';
import { ROOMS, ROOM_MAP, UPKEEP_TEMPLATES } from '../data/upkeep';
import { EFFORT_LABEL } from '../game/constants';
import { describeSchedule, type UpkeepStatus } from '../game/schedule';
import { daysBetween, formatDay, monthKey, relativeDays, shiftDay, type DayKey } from '../lib/date';
import { useToday, useUpkeep } from '../state/hooks';
import { useGame } from '../state/store';
import type { Goal } from '../state/types';
import { Birb } from '../art/Birb';
import { Button, Card, Chip, cx, Empty, Page, Progress, Ring, SectionTitle, Segmented, Sheet } from '../ui/kit';
import { IconCheck, IconPlus } from '../ui/icons';

const TONE_COLOR: Record<UpkeepStatus['tone'], string> = {
  overdue: 'var(--danger)',
  due: 'var(--warm)',
  soon: 'var(--energy)',
  fresh: 'var(--accent)',
};

function freshnessColor(f: number) {
  if (f <= 0.001) return 'var(--danger)';
  if (f < 0.25) return 'var(--warm)';
  if (f < 0.5) return 'var(--energy)';
  return 'var(--accent)';
}

function historyOf(days: Record<DayKey, { goals: Record<string, { count: number }> }>, g: Goal): DayKey[] {
  return Object.entries(days)
    .filter(([, rec]) => (rec.goals[g.id]?.count ?? 0) >= g.timesPerDay)
    .map(([d]) => d)
    .sort()
    .reverse();
}

function TaskRow({ goal, status, doneToday, onOpen }: { goal: Goal; status: UpkeepStatus; doneToday: boolean; onOpen: () => void }) {
  const complete = useGame((s) => s.actions.completeGoal);
  const today = useToday();
  const since = goal.lastDoneDay ? daysBetween(goal.lastDoneDay, today) : undefined;
  return (
    <div className={cx('rounded-3xl bg-surface shadow-card p-3 flex items-center gap-3', doneToday && 'opacity-60')}>
      <button onClick={onOpen} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <span className="w-11 h-11 shrink-0 rounded-2xl grid place-items-center text-2xl" style={{ background: (ROOM_MAP[goal.room ?? '']?.color ?? '#ddd') + '55' }}>
          {goal.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold leading-tight truncate">{goal.title}</span>
          <span className="block text-xs text-muted truncate">
            {describeSchedule(goal.schedule)} · {since === undefined ? 'never logged' : `last ${relativeDays(since)}`}
          </span>
          <span className="flex items-center gap-2 mt-1.5">
            <Progress value={doneToday ? 1 : status.freshness} className="h-1.5 flex-1" color={doneToday ? 'var(--accent)' : freshnessColor(status.freshness)} />
            <span className="text-[11px] font-black shrink-0" style={{ color: doneToday ? 'var(--accent)' : TONE_COLOR[status.tone] }}>
              {doneToday ? 'Done today!' : status.label}
            </span>
          </span>
        </span>
      </button>
      <button
        aria-label={`Mark ${goal.title} done`}
        disabled={doneToday}
        onClick={() => complete(goal.id)}
        className={cx('shrink-0 w-11 h-11 rounded-full grid place-items-center border-[3px] transition', doneToday ? 'bg-accent border-accent text-accent-ink' : 'border-line text-muted hover:border-accent hover:text-accent')}
      >
        <IconCheck className="w-6 h-6" />
      </button>
    </div>
  );
}

function TaskSheet({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const nav = useNavigate();
  const today = useToday();
  const days = useGame((s) => s.days);
  const a = useGame((s) => s.actions);
  const [pastDay, setPastDay] = useState(shiftDay(today, -1));
  const history = useMemo(() => historyOf(days, goal), [days, goal]);
  const room = ROOM_MAP[goal.room ?? ''];
  return (
    <Sheet open onClose={onClose} title={<span className="flex items-center gap-2"><span className="text-2xl">{goal.emoji}</span>{goal.title}</span>}>
      <div className="flex flex-wrap gap-1.5 -mt-1 mb-4 text-xs font-bold">
        {room && <span className="rounded-full bg-surface px-2.5 h-7 inline-flex items-center">{room.emoji} {room.name}</span>}
        <span className="rounded-full bg-surface px-2.5 h-7 inline-flex items-center">🔁 {describeSchedule(goal.schedule)}</span>
        <span className="rounded-full bg-surface px-2.5 h-7 inline-flex items-center">💪 {EFFORT_LABEL[goal.effort]}</span>
        {goal.status !== 'active' && <span className="rounded-full bg-warm-soft px-2.5 h-7 inline-flex items-center">{goal.status}</span>}
      </div>
      {goal.notes && <p className="rounded-2xl bg-surface p-3 text-sm whitespace-pre-wrap mb-4">📝 {goal.notes}</p>}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button onClick={() => { a.completeGoal(goal.id); onClose(); }}>✅ Done today</Button>
        <Button variant="outline" onClick={() => nav(`/goals/${goal.id}`)}>✏️ Edit</Button>
      </div>
      <div className="rounded-2xl bg-surface p-3 mb-4">
        <p className="font-black text-sm mb-2">Did it on another day?</p>
        <div className="flex gap-2">
          <input type="date" max={shiftDay(today, -1)} className="flex-1 h-11 rounded-2xl bg-surface-2 px-3" value={pastDay} onChange={(e) => setPastDay(e.target.value)} />
          <Button
            variant="soft"
            onClick={() => {
              if (pastDay && pastDay < today) a.completeGoal(goal.id, pastDay);
            }}
          >
            Log it
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Button size="sm" variant="outline" onClick={() => { a.snoozeGoal(goal.id, shiftDay(today, 7)); onClose(); }}>💤 +1 week</Button>
        {goal.status === 'active' ? (
          <Button size="sm" variant="outline" onClick={() => { a.setGoalStatus(goal.id, 'paused'); onClose(); }}>⏸️ Pause</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => { a.setGoalStatus(goal.id, 'active'); onClose(); }}>▶️ Resume</Button>
        )}
        <Button size="sm" variant="outline" onClick={() => { a.setGoalStatus(goal.id, 'archived'); onClose(); }}>📦 Archive</Button>
      </div>
      <p className="font-black text-sm mb-2">History · {goal.totalDone} time{goal.totalDone === 1 ? '' : 's'}</p>
      {history.length ? (
        <ul className="flex flex-col gap-1">
          {history.slice(0, 12).map((d) => (
            <li key={d} className="flex justify-between text-sm rounded-xl bg-surface px-3 h-9 items-center">
              <span className="font-bold">{formatDay(d, 'EEE, MMM d, yyyy')}</span>
              <span className="text-muted">{relativeDays(daysBetween(d, today))}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{goal.lastDoneDay ? `Last done ${formatDay(goal.lastDoneDay, 'MMM d, yyyy')} (before tracking).` : 'Not logged yet.'}</p>
      )}
    </Sheet>
  );
}

function BulkAdd({ onClose }: { onClose: () => void }) {
  const today = useToday();
  const goals = useGame((s) => s.goals);
  const existing = useMemo(() => new Set(goals.filter((g) => g.kind === 'upkeep').map((g) => g.title)), [goals]);
  const addGoal = useGame((s) => s.actions.addGoal);
  const [room, setRoom] = useState(ROOMS[0].id);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [start, setStart] = useState<'fresh' | 'due'>('fresh');
  const add = () => {
    for (const i of picked) {
      const t = UPKEEP_TEMPLATES[i];
      addGoal({ title: t.title, emoji: t.emoji, kind: 'upkeep', room: t.room, areaId: 'home', schedule: t.schedule, effort: t.effort, notes: t.tip, lastDoneDay: start === 'fresh' ? today : undefined });
    }
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title="Add from the library">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {ROOMS.map((r) => {
          const n = UPKEEP_TEMPLATES.filter((t, i) => t.room === r.id && picked.has(i)).length;
          return (
            <Chip key={r.id} active={room === r.id} onClick={() => setRoom(r.id)}>
              {r.emoji} {r.name}
              {n > 0 && <span className="ml-1 rounded-full bg-white/70 text-ink px-1.5 text-xs">{n}</span>}
            </Chip>
          );
        })}
      </div>
      <div className="flex flex-col gap-1.5 mt-2 mb-4">
        {UPKEEP_TEMPLATES.map((t, i) => {
          if (t.room !== room) return null;
          const on = picked.has(i);
          const have = existing.has(t.title);
          return (
            <button
              key={i}
              disabled={have}
              onClick={() => {
                const n = new Set(picked);
                if (on) n.delete(i);
                else n.add(i);
                setPicked(n);
              }}
              className={cx('flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left border-2 transition', on ? 'border-accent bg-accent-soft' : 'border-transparent bg-surface', have && 'opacity-50')}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="font-bold block leading-tight">{t.title}</span>
                <span className="text-xs text-muted">
                  {describeSchedule(t.schedule)} · {EFFORT_LABEL[t.effort]}
                  {have && ' · already added'}
                </span>
              </span>
              <span className={cx('w-6 h-6 rounded-full grid place-items-center text-sm font-black', on ? 'bg-accent text-accent-ink' : 'bg-surface-3')}>{on ? '✓' : ''}</span>
            </button>
          );
        })}
      </div>
      <p className="font-black text-sm mb-2">When are these due?</p>
      <Segmented
        value={start}
        onChange={setStart}
        options={[
          { value: 'fresh', label: 'Count from today' },
          { value: 'due', label: 'Due now' },
        ]}
      />
      <Button block size="lg" className="mt-4" disabled={!picked.size} onClick={add}>
        Add {picked.size || ''} task{picked.size === 1 ? '' : 's'}
      </Button>
    </Sheet>
  );
}

export default function Upkeep() {
  const nav = useNavigate();
  const today = useToday();
  const items = useUpkeep(today);
  const days = useGame((s) => s.days);
  const birb = useGame((s) => s.birb);
  const [room, setRoom] = useState<string>('all');
  const [open, setOpen] = useState<Goal | null>(null);
  const [bulk, setBulk] = useState(false);

  const active = items.filter((i) => i.goal.status === 'active');
  const shown = room === 'all' ? active : active.filter((i) => i.goal.room === room);
  const paused = items.filter((i) => i.goal.status === 'paused');
  const avg = active.length ? active.reduce((s, i) => s + (i.doneToday ? 1 : i.status.freshness), 0) / active.length : 1;
  const overdue = active.filter((i) => i.status.tone === 'overdue' && !i.doneToday).length;
  const dueWeek = active.filter((i) => !i.doneToday && i.status.daysUntil >= 0 && i.status.daysUntil <= 7).length;
  const mk = monthKey(today);
  const doneMonth = useMemo(() => {
    const ids = new Set(items.map((i) => i.goal.id));
    let n = 0;
    for (const [d, rec] of Object.entries(days)) {
      if (!d.startsWith(mk)) continue;
      for (const [gid, gd] of Object.entries(rec.goals)) if (ids.has(gid) && gd.count > 0) n++;
    }
    return n;
  }, [days, items, mk]);

  const rooms = ROOMS.map((r) => {
    const list = active.filter((i) => i.goal.room === r.id);
    const f = list.length ? list.reduce((s, i) => s + (i.doneToday ? 1 : i.status.freshness), 0) / list.length : 1;
    return { ...r, count: list.length, freshness: f, overdue: list.filter((i) => i.status.tone === 'overdue' && !i.doneToday).length };
  }).filter((r) => r.count > 0);

  const groups: { title: string; list: typeof shown }[] = [
    { title: '🚨 Overdue', list: shown.filter((i) => !i.doneToday && i.status.daysUntil < 0) },
    { title: '📌 Due today', list: shown.filter((i) => !i.doneToday && i.status.daysUntil === 0) },
    { title: '🗓️ Coming up this week', list: shown.filter((i) => !i.doneToday && i.status.daysUntil > 0 && i.status.daysUntil <= 7) },
    { title: '✨ Fresh', list: shown.filter((i) => !i.doneToday && i.status.daysUntil > 7) },
    { title: '✅ Done today', list: shown.filter((i) => i.doneToday) },
  ];
  const line = avg > 0.7 ? HOME_UPKEEP_LINES[0] : avg > 0.4 ? HOME_UPKEEP_LINES[2] : "Let's pick one small thing to freshen up!";

  return (
    <Page
      title="Home upkeep"
      subtitle="Keep your space (and your birb) happy"
      right={
        <Button size="sm" onClick={() => nav('/goals/new?kind=upkeep')}>
          <IconPlus className="w-4 h-4" /> Task
        </Button>
      }
    >
      {items.length === 0 ? (
        <Card className="text-center">
          <Birb colors={birb.colors} outfit={{ ...birb.outfit, body: 'apron:sage' }} className="w-36 h-36 mx-auto" expression="happy" />
          <p className="text-xl font-black">Let's take care of our home</p>
          <p className="text-muted mt-1 mb-4">Track chores and maintenance—filters, gutters, smoke detectors, oil changes—on their own schedules. They'll show up when they're due and earn energy like any goal.</p>
          <div className="flex flex-col gap-2">
            <Button block onClick={() => setBulk(true)}>📚 Pick from the library</Button>
            <Button block variant="outline" onClick={() => nav('/goals/new?kind=upkeep&blank=1')}>✍️ Create my own</Button>
            <Button block variant="ghost" onClick={() => nav('/challenges')}>🏅 Try a cleaning challenge</Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex items-center gap-4">
            <Ring value={avg} size={84} stroke={9} color={freshnessColor(avg)}>
              <span className="text-lg font-black">{Math.round(avg * 100)}%</span>
            </Ring>
            <div className="flex-1 min-w-0">
              <p className="font-black">Home freshness</p>
              <p className="text-sm text-muted italic">“{line}”</p>
              <div className="flex gap-3 mt-2 text-xs font-extrabold">
                <span className={overdue ? 'text-danger' : 'text-muted'}>{overdue} overdue</span>
                <span className="text-muted">{dueWeek} this week</span>
                <span className="text-accent">{doneMonth} done this month</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-4 px-4 pb-1">
            <Chip active={room === 'all'} onClick={() => setRoom('all')}>
              🏠 All
            </Chip>
            {rooms.map((r) => (
              <Chip key={r.id} active={room === r.id} color={r.color} onClick={() => setRoom(r.id)}>
                {r.emoji} {r.name}
                {r.overdue > 0 && <span className="w-2 h-2 rounded-full bg-danger" />}
              </Chip>
            ))}
          </div>

          {room === 'all' && rooms.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {rooms.map((r) => (
                <button key={r.id} onClick={() => setRoom(r.id)} className="rounded-2xl bg-surface shadow-card p-2.5 flex flex-col items-center gap-1 active:scale-95 transition">
                  <Ring value={r.freshness} size={46} stroke={5} color={freshnessColor(r.freshness)}>
                    <span className="text-xl">{r.emoji}</span>
                  </Ring>
                  <span className="text-xs font-extrabold text-center leading-tight">{r.name}</span>
                  <span className={cx('text-[10px] font-bold', r.overdue ? 'text-danger' : 'text-muted')}>{r.overdue ? `${r.overdue} overdue` : `${r.count} task${r.count === 1 ? '' : 's'}`}</span>
                </button>
              ))}
            </div>
          )}

          {groups.map(
            (g) =>
              g.list.length > 0 && (
                <div key={g.title}>
                  <SectionTitle>{g.title}</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {g.list.map((i) => (
                      <TaskRow key={i.goal.id} goal={i.goal} status={i.status} doneToday={i.doneToday} onOpen={() => setOpen(i.goal)} />
                    ))}
                  </div>
                </div>
              ),
          )}
          {shown.length === 0 && <Empty emoji="🧹" title="Nothing here yet" />}

          {paused.length > 0 && (
            <>
              <SectionTitle>⏸️ Paused</SectionTitle>
              <div className="flex flex-col gap-2">
                {paused.map((i) => (
                  <TaskRow key={i.goal.id} goal={i.goal} status={i.status} doneToday={i.doneToday} onOpen={() => setOpen(i.goal)} />
                ))}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 mt-6">
            <Button variant="soft" onClick={() => setBulk(true)}>📚 Library</Button>
            <Button variant="outline" onClick={() => nav('/challenges')}>🏅 Challenges</Button>
          </div>
        </>
      )}
      {open && <TaskSheet goal={items.find((i) => i.goal.id === open.id)?.goal ?? open} onClose={() => setOpen(null)} />}
      {bulk && <BulkAdd onClose={() => setBulk(false)} />}
    </Page>
  );
}
