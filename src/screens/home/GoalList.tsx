import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROOM_MAP } from '../../data/upkeep';
import { EFFORT_LABEL } from '../../game/constants';
import { describeSchedule, upkeepStatus } from '../../game/schedule';
import { chime } from '../../lib/audio';
import { dayPart, formatDay, shiftDay, type DayKey } from '../../lib/date';
import { activityRoute } from '../../lib/links';
import { useDay } from '../../state/hooks';
import { useGame } from '../../state/store';
import type { Goal, TimeOfDay } from '../../state/types';
import { Button, Confirm, cx, Ring, SectionTitle, Sheet } from '../../ui/kit';
import { IconCheck, IconDots, IconLink, IconStar } from '../../ui/icons';

const SECTIONS: { id: TimeOfDay; label: string; emoji: string }[] = [
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { id: 'evening', label: 'Evening', emoji: '🌙' },
  { id: 'anytime', label: 'Anytime', emoji: '✨' },
];

export function GoalRow({ goal, day, onMore }: { goal: Goal; day: DayKey; onMore: (g: Goal) => void }) {
  const nav = useNavigate();
  const rec = useDay(day);
  const areas = useGame((s) => s.areas);
  const days = useGame((s) => s.days);
  const weekStartsOn = useGame((s) => s.settings.weekStartsOn);
  const { completeGoal } = useGame((s) => s.actions);
  const gd = rec.goals[goal.id];
  const count = gd?.count ?? 0;
  const done = count >= goal.timesPerDay;
  const skipped = !!gd?.skipped && !done;
  const isGotd = rec.goalOfDay === goal.id;
  const area = areas.find((a) => a.id === goal.areaId);
  const [pop, setPop] = useState(false);

  const status = goal.kind === 'upkeep' ? upkeepStatus(goal, day, { days, weekStartsOn }) : undefined;

  const check = () => {
    if (done) {
      onMore(goal);
      return;
    }
    completeGoal(goal.id, day);
    setPop(true);
    window.setTimeout(() => setPop(false), 450);
  };

  const open = () => {
    if (goal.link && !done) nav(activityRoute(goal.link, goal.id));
    else onMore(goal);
  };

  const sub: string[] = [];
  if (goal.timesPerDay > 1) sub.push(`${count}/${goal.timesPerDay} today`);
  if (goal.kind === 'upkeep') {
    if (goal.room) sub.push(ROOM_MAP[goal.room]?.name ?? goal.room);
    if (status && status.tone === 'overdue') sub.push(status.label);
  } else if (goal.schedule.type !== 'daily') sub.push(describeSchedule(goal.schedule));
  if (goal.effort > 1) sub.push(`${EFFORT_LABEL[goal.effort]} effort`);
  if (skipped) sub.push('Skipped');

  return (
    <div
      className={cx(
        'flex items-center gap-3 rounded-3xl bg-surface shadow-card pl-3 pr-2 py-2.5 transition',
        done && 'opacity-60',
        isGotd && !done && 'ring-2 ring-energy',
      )}
    >
      <button onClick={open} className="flex flex-1 min-w-0 items-center gap-3 text-left">
        <span className="w-11 h-11 shrink-0 rounded-2xl grid place-items-center text-2xl" style={{ background: (area?.color ?? '#e8dccb') + '55' }}>
          {skipped ? '🪁' : goal.emoji}
        </span>
        <span className="min-w-0">
          <span className={cx('flex items-center gap-1.5 font-extrabold leading-tight', (done || skipped) && 'line-through decoration-2 decoration-muted/60')}>
            {isGotd && <IconStar filled className="w-4 h-4 text-energy shrink-0" />}
            <span className="truncate">{goal.title}</span>
            {goal.link && !done && <IconLink className="w-3.5 h-3.5 text-muted shrink-0" />}
          </span>
          {sub.length > 0 && <span className={cx('block text-xs truncate', status?.tone === 'overdue' ? 'text-danger font-bold' : 'text-muted')}>{sub.join(' · ')}</span>}
        </span>
      </button>
      <button aria-label="Goal options" onClick={() => onMore(goal)} className="w-8 h-10 grid place-items-center text-muted rounded-xl hover:bg-surface-2">
        <IconDots />
      </button>
      <button aria-label={done ? 'Completed' : `Complete ${goal.title}`} onClick={check} className={cx('shrink-0', pop && 'check-pop')}>
        {goal.timesPerDay > 1 && !done ? (
          <Ring value={count / goal.timesPerDay} size={44} stroke={5}>
            <span className="font-black text-xs">{count}</span>
          </Ring>
        ) : (
          <span className={cx('w-11 h-11 rounded-full grid place-items-center border-[3px] transition', done ? 'bg-accent border-accent text-accent-ink' : 'border-line text-transparent hover:border-accent')}>
            <IconCheck className="w-6 h-6" />
          </span>
        )}
      </button>
    </div>
  );
}

export function GoalSheet({ goal, day, onClose }: { goal: Goal | null; day: DayKey; onClose: () => void }) {
  const nav = useNavigate();
  const rec = useDay(day);
  const egg = useGame((s) => s.egg);
  const a = useGame((s) => s.actions);
  const [snoozing, setSnoozing] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState(shiftDay(day, 1));
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!goal) return null;
  const gd = rec.goals[goal.id];
  const count = gd?.count ?? 0;
  const done = count >= goal.timesPerDay;
  const isGotd = rec.goalOfDay === goal.id;
  const close = () => {
    setSnoozing(false);
    onClose();
  };

  const Item = ({ emoji, label, onClick, danger }: { emoji: string; label: string; onClick: () => void; danger?: boolean }) => (
    <button onClick={onClick} className={cx('flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface h-20 font-bold text-xs text-center px-1 active:scale-95 transition', danger && 'text-danger')}>
      <span className="text-2xl">{emoji}</span>
      {label}
    </button>
  );

  return (
    <>
      <Sheet open={!!goal && !confirmDelete} onClose={close} title={<span className="flex items-center gap-2"><span className="text-2xl">{goal.emoji}</span>{goal.title}</span>}>
        <p className="text-sm text-muted -mt-2 mb-4">
          {describeSchedule(goal.schedule)}
          {goal.timesPerDay > 1 && ` · ${count}/${goal.timesPerDay} today`}
          {goal.notes && <span className="block mt-1 whitespace-pre-wrap">📝 {goal.notes}</span>}
        </p>
        {snoozing ? (
          <div>
            <p className="font-black mb-2">Snooze until…</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                ['Tomorrow', 1],
                ['In 3 days', 3],
                ['Next week', 7],
              ].map(([label, n]) => (
                <Button
                  key={label as string}
                  variant="outline"
                  onClick={() => {
                    a.snoozeGoal(goal.id, shiftDay(day, n as number));
                    close();
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="date" className="flex-1 h-11 rounded-2xl bg-surface border border-line px-3" value={snoozeDate} min={shiftDay(day, 1)} onChange={(e) => setSnoozeDate(e.target.value)} />
              <Button
                onClick={() => {
                  a.snoozeGoal(goal.id, snoozeDate);
                  close();
                }}
              >
                Snooze
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {done || count > 0 ? (
              <Item
                emoji="↩️"
                label="Undo"
                onClick={() => {
                  a.undoGoal(goal.id, day);
                  chime('undo');
                  close();
                }}
              />
            ) : (
              <Item
                emoji="✅"
                label="Complete"
                onClick={() => {
                  a.completeGoal(goal.id, day);
                  close();
                }}
              />
            )}
            {goal.link && <Item emoji="▶️" label="Start activity" onClick={() => nav(activityRoute(goal.link!, goal.id))} />}
            {!done &&
              (gd?.skipped ? (
                <Item emoji="🔄" label="Unskip" onClick={() => { a.skipGoal(goal.id, false); close(); }} />
              ) : (
                <Item
                  emoji="🪁"
                  label="Skip today"
                  onClick={() => {
                    a.skipGoal(goal.id, true);
                    close();
                    nav(`/care/reflect/skip?goal=${goal.id}&skip=1`);
                  }}
                />
              ))}
            {!done && <Item emoji="💤" label="Snooze" onClick={() => setSnoozing(true)} />}
            {!rec.goalOfDayPaid && (
              <Item
                emoji={isGotd ? '☆' : '⭐'}
                label={isGotd ? 'Unstar' : 'Goal of the day'}
                onClick={() => {
                  a.setGoalOfDay(isGotd ? undefined : goal.id);
                  close();
                }}
              />
            )}
            <Item emoji="📝" label="Reflect" onClick={() => nav(`/care/reflect/goal-done?goal=${goal.id}`)} />
            {egg && egg.linkedGoalId !== goal.id && (
              <Item
                emoji="🥚"
                label="Link egg"
                onClick={() => {
                  a.linkEgg(goal.id);
                  close();
                }}
              />
            )}
            <Item emoji="✏️" label="Edit" onClick={() => nav(`/goals/${goal.id}`)} />
            <Item emoji="⏸️" label="Pause" onClick={() => { a.setGoalStatus(goal.id, 'paused'); close(); }} />
            <Item emoji="📦" label="Archive" onClick={() => { a.setGoalStatus(goal.id, 'archived'); close(); }} />
            <Item emoji="🗑️" label="Delete" danger onClick={() => setConfirmDelete(true)} />
          </div>
        )}
      </Sheet>
      <Confirm
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          close();
        }}
        onConfirm={() => a.deleteGoal(goal.id)}
        title="Delete this goal?"
        body="Its history stays in your insights, but the goal will be gone. Archive it instead if you might want it back."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

export function GoalList({ goals, day, title }: { goals: Goal[]; day: DayKey; title?: string }) {
  const rec = useDay(day);
  const [sheet, setSheet] = useState<Goal | null>(null);
  const [showDone, setShowDone] = useState(false);
  const part = dayPart(Date.now());

  const { open, done, upkeep, gotd } = useMemo(() => {
    const isDone = (g: Goal) => (rec.goals[g.id]?.count ?? 0) >= g.timesPerDay || !!rec.goals[g.id]?.skipped;
    const gotd = goals.find((g) => g.id === rec.goalOfDay && !isDone(g));
    const rest = goals.filter((g) => g !== gotd);
    return {
      gotd,
      open: rest.filter((g) => !isDone(g) && g.kind === 'goal'),
      upkeep: rest.filter((g) => !isDone(g) && g.kind === 'upkeep'),
      done: rest.filter(isDone),
    };
  }, [goals, rec]);

  const order = useMemo(() => {
    const current: TimeOfDay = part === 'night' ? 'evening' : part;
    return [...SECTIONS].sort((a, b) => (a.id === current ? -1 : b.id === current ? 1 : 0));
  }, [part]);

  return (
    <div>
      {title && <SectionTitle>{title}</SectionTitle>}
      {gotd && (
        <div className="mb-3">
          <SectionTitle className="mt-2">⭐ Goal of the day</SectionTitle>
          <GoalRow goal={gotd} day={day} onMore={setSheet} />
        </div>
      )}
      {order.map((sec) => {
        const list = open.filter((g) => g.timeOfDay === sec.id);
        if (!list.length) return null;
        return (
          <div key={sec.id}>
            <SectionTitle className="mt-4">
              {sec.emoji} {sec.label}
            </SectionTitle>
            <div className="flex flex-col gap-2">
              {list.map((g) => (
                <GoalRow key={g.id} goal={g} day={day} onMore={setSheet} />
              ))}
            </div>
          </div>
        );
      })}
      {upkeep.length > 0 && (
        <div>
          <SectionTitle className="mt-4">🏠 Home upkeep due</SectionTitle>
          <div className="flex flex-col gap-2">
            {upkeep.map((g) => (
              <GoalRow key={g.id} goal={g} day={day} onMore={setSheet} />
            ))}
          </div>
        </div>
      )}
      {done.length > 0 && (
        <div>
          <button onClick={() => setShowDone((v) => !v)} className="w-full">
            <SectionTitle className="mt-4" right={<span className="text-xs font-bold text-muted">{showDone ? 'Hide' : 'Show'}</span>}>
              ✔️ Done today ({done.length})
            </SectionTitle>
          </button>
          {showDone && (
            <div className="flex flex-col gap-2">
              {done.map((g) => (
                <GoalRow key={g.id} goal={g} day={day} onMore={setSheet} />
              ))}
            </div>
          )}
        </div>
      )}
      <GoalSheet goal={sheet} day={day} onClose={() => setSheet(null)} />
      {!goals.length && <p className="text-center text-muted py-6">Nothing scheduled for {formatDay(day, 'EEEE')}. Add a goal below!</p>}
    </div>
  );
}
