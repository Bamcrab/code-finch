import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { MOODS } from '../game/constants';
import { isVisibleOn } from '../game/schedule';
import { formatDay } from '../lib/date';
import { useStreak, useToday } from '../state/hooks';
import { useGame } from '../state/store';
import { Button, Card, Page, SectionTitle, cx } from '../ui/kit';
import { IconCheck } from '../ui/icons';
import { MoodCalendar } from '../ui/MoodCalendar';

export default function History() {
  const { day: param } = useParams();
  const nav = useNavigate();
  const today = useToday();
  const day = param && param <= today ? param : today;
  const s = useGame();
  const streak = useStreak();
  const rec = s.days[day];
  const a = s.actions;

  const goals = useMemo(() => {
    const ctx = { days: s.days, weekStartsOn: s.settings.weekStartsOn };
    return s.goals.filter((g) => rec?.goals[g.id] || (g.status === 'active' && g.createdDay <= day && isVisibleOn(g, day, ctx)));
  }, [s.goals, s.days, s.settings.weekStartsOn, rec, day]);
  const moods = s.moods.filter((m) => m.day === day);
  const reflections = s.reflections.filter((r) => r.day === day);
  const activities = s.activities.filter((x) => x.day === day);
  const discoveries = s.discoveries.filter((d) => d.day === day);
  const past = day < today;

  return (
    <Page back title="History" subtitle={s.settings.streaksEnabled ? `🔥 ${streak.current}-day streak · best ${Math.max(s.streak.longest, streak.current)}` : undefined}>
      <Card>
        <MoodCalendar today={today} selected={day} onPick={(d) => nav(`/history/${d}`, { replace: true })} showActivity />
        <p className="text-[11px] text-muted text-center mt-1">A dot means you showed up that day. Tap a day to see it.</p>
      </Card>

      <h2 className="text-xl font-black mt-6 px-1">{day === today ? 'Today' : formatDay(day, 'EEEE, MMMM d')}</h2>
      {rec && (
        <p className="text-sm text-muted px-1">
          ⚡ {rec.energy} energy · 💎 {rec.stonesEarned} stones{rec.intention ? ` · intention: “${rec.intention}”` : ''}
        </p>
      )}

      {moods.length > 0 && (
        <>
          <SectionTitle>Mood</SectionTitle>
          <div className="flex flex-col gap-2">
            {moods.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2">
                <span className="text-2xl">{MOODS[m.mood - 1].emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="font-bold block">
                    {MOODS[m.mood - 1].label} <span className="text-xs text-muted font-normal">{format(m.at, 'h:mm a')}</span>
                  </span>
                  {m.note && <span className="text-sm block">{m.note}</span>}
                  {(m.emotions.length > 0 || m.factors.length > 0) && <span className="text-xs text-muted block">{[...m.emotions, ...m.factors].join(' · ')}</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Goals</SectionTitle>
      {goals.length ? (
        <div className="flex flex-col gap-2">
          {goals.map((g) => {
            const gd = rec?.goals[g.id];
            const done = (gd?.count ?? 0) >= g.timesPerDay;
            return (
              <div key={g.id} className={cx('flex items-center gap-3 rounded-2xl bg-surface px-3 py-2', done && 'opacity-70')}>
                <span className="text-2xl">{gd?.skipped && !done ? '🪁' : g.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className={cx('font-bold block truncate', (done || gd?.skipped) && 'line-through')}>{g.title}</span>
                  <span className="text-xs text-muted">
                    {done ? (gd?.retro ? 'Logged later' : 'Done') : gd?.skipped ? 'Skipped' : gd?.count ? `${gd.count}/${g.timesPerDay}` : past ? 'Not done' : 'To do'}
                  </span>
                </span>
                {done ? (
                  <button aria-label="Undo" onClick={() => a.undoGoal(g.id, day)} className="w-10 h-10 rounded-full bg-accent text-accent-ink grid place-items-center">
                    <IconCheck />
                  </button>
                ) : (
                  <button aria-label={`Mark ${g.title} done`} onClick={() => a.completeGoal(g.id, day)} className="w-10 h-10 rounded-full border-[3px] border-line grid place-items-center text-muted hover:border-accent">
                    <IconCheck />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted px-1">No goals scheduled.</p>
      )}
      {past && <p className="text-xs text-muted px-1 mt-2">Forgot to check something off? Logging it now earns stones and keeps your stats honest (streaks only count same-day).</p>}

      {activities.length > 0 && (
        <>
          <SectionTitle>Self-care</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {activities.map((x) => (
              <div key={x.id} className="flex justify-between rounded-2xl bg-surface px-3 h-10 items-center text-sm">
                <span className="font-bold truncate">{x.title}</span>
                <span className="text-muted shrink-0">{format(x.at, 'h:mm a')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {discoveries.length > 0 && (
        <>
          <SectionTitle>Discoveries</SectionTitle>
          {discoveries.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2">
              <span className="text-2xl">{d.emoji}</span>
              <span className="font-bold">{d.name}</span>
            </div>
          ))}
        </>
      )}

      <SectionTitle>Reflections</SectionTitle>
      {reflections.map((r) => (
        <button key={r.id} onClick={() => nav('/journal')} className="w-full text-left rounded-2xl bg-surface px-3 py-2 mb-2">
          <span className="font-bold block">
            {r.emoji} {r.title}
          </span>
          <span className="text-sm text-muted line-clamp-2">{r.answers.map((x) => x.text).join(' · ')}</span>
        </button>
      ))}
      <Button variant="soft" block onClick={() => nav(`/care/reflect/free${day !== today ? `?day=${day}` : ''}`)}>
        📝 Write about {day === today ? 'today' : 'this day'}
      </Button>
    </Page>
  );
}
