import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Micropet } from '../art/Micropet';
import { ItemThumb } from '../art/misc';
import { CHALLENGE_MAP } from '../data/challenges';
import { EVENT_TIERS, eventForMonth } from '../data/events';
import { SPECIES_MAP } from '../data/micropets';
import { DAILY_QUEST_STONES, SPECIAL_QUEST_STONES, WEEKLY_TIERS } from '../game/constants';
import { SPECIAL_QUESTS, dailyQuestsFor, eventActiveDays, goalArea, questProgress, specialStatus, weeklyAreaDays } from '../game/quests';
import { daysInMonth, monthKey, weekKey } from '../lib/date';
import { useDay, useToday } from '../state/hooks';
import { useGame } from '../state/store';
import { Button, Card, Page, Price, Progress, SectionTitle, cx } from '../ui/kit';

export default function Quests() {
  const nav = useNavigate();
  const today = useToday();
  const state = useGame();
  const day = useDay(today);
  const a = state.actions;
  const birbName = state.birb.name;

  const month = Number(today.slice(5, 7));
  const ev = eventForMonth(month);
  const mk = monthKey(today);
  const activeDays = eventActiveDays(state, today);
  const claimedTiers = state.eventClaims[mk] ?? [];
  const daily = dailyQuestsFor(today, state);
  const week = useMemo(() => weeklyAreaDays(state, today), [state, today]);
  const wk = weekKey(today, state.settings.weekStartsOn);
  const areasWithGoals = state.areas.filter((ar) => ar.status === 'active' && state.goals.some((g) => g.status === 'active' && goalArea(g) === ar.id));
  const activeChallenges = state.challenges.filter((c) => !c.finishedDay);

  return (
    <Page title="Quests" subtitle="Earn rainbow stones for showing up">
      {/* Seasonal event */}
      <div className="rounded-[28px] shadow-card overflow-hidden bg-gradient-to-br from-warm-soft to-accent-soft">
        <div className="p-4">
          <p className="text-xs font-black uppercase tracking-wide text-muted">This month's event</p>
          <h2 className="text-2xl font-black">
            {ev.emoji} {ev.name}
          </h2>
          <p className="text-sm text-muted">{ev.blurb}</p>
          <p className="text-sm font-bold mt-2">
            {activeDays} active day{activeDays === 1 ? '' : 's'} this month · {daysInMonth(today) - Number(today.slice(8, 10))} days left
          </p>
          <Progress value={activeDays} max={EVENT_TIERS[EVENT_TIERS.length - 1]} className="mt-2 h-2.5 bg-white/60" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
          {EVENT_TIERS.map((t, i) => {
            const claimed = claimedTiers.includes(i);
            const ready = activeDays >= t && !claimed;
            const it = ev.items[i];
            return (
              <div key={i} className={cx('shrink-0 w-24 rounded-2xl bg-surface p-2 text-center', ready && 'ring-2 ring-accent')}>
                <div className="w-full h-16 grid place-items-center">
                  {it ? <ItemThumb id={it.id} className="w-16 h-16" /> : <Micropet species={ev.micropet} className="w-16 h-16" />}
                </div>
                <p className="text-[10px] font-bold leading-tight truncate">{it ? it.name : SPECIES_MAP[ev.micropet]?.name}</p>
                {claimed ? (
                  <p className="text-xs font-black text-accent mt-1">✓ Got it</p>
                ) : ready ? (
                  <Button size="sm" className="mt-1 h-7 w-full" onClick={() => a.claimEventTier(i)}>
                    Claim
                  </Button>
                ) : (
                  <p className="text-xs font-bold text-muted mt-1">Day {t}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenges */}
      <Card className="mt-3 flex items-center gap-3" onClick={() => nav('/challenges')}>
        <span className="text-3xl">🏅</span>
        <div className="flex-1 min-w-0">
          <p className="font-black">Goal challenges</p>
          <p className="text-sm text-muted truncate">
            {activeChallenges.length
              ? activeChallenges.map((c) => `${CHALLENGE_MAP[c.id]?.emoji} ${c.done.filter(Boolean).length}/14`).join(' · ')
              : '14-step themed challenges, like Spring Clean'}
          </p>
        </div>
      </Card>

      {/* Daily */}
      <SectionTitle>Daily quests</SectionTitle>
      <div className="flex flex-col gap-2">
        {daily.map((q) => {
          const prog = questProgress(q, state, today);
          const claimed = day.questsClaimed.includes(q.id);
          const done = prog >= q.target;
          return (
            <div key={q.id} className={cx('flex items-center gap-3 rounded-3xl bg-surface shadow-card p-3', claimed && 'opacity-60')}>
              <span className="text-2xl w-9 text-center">{q.emoji}</span>
              <button className="flex-1 min-w-0 text-left" onClick={() => q.to && !done && nav(q.to)}>
                <span className={cx('font-bold block leading-tight', claimed && 'line-through')}>{q.title.replace('{birb}', birbName)}</span>
                <Progress value={prog} max={q.target} className="h-1.5 mt-1.5" />
              </button>
              {claimed ? (
                <span className="text-accent font-black text-sm">✓</span>
              ) : done ? (
                <Button size="sm" onClick={() => a.claimDaily(q.id)}>
                  <Price amount={DAILY_QUEST_STONES} />
                </Button>
              ) : (
                <Price amount={DAILY_QUEST_STONES} className="text-sm text-muted" />
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly */}
      <SectionTitle>Weekly milestones</SectionTitle>
      <p className="text-xs text-muted -mt-1 mb-2 px-1">Complete a goal in an area on {WEEKLY_TIERS.map((t) => t.days).join(' / ')} different days this week.</p>
      {areasWithGoals.length === 0 && <p className="text-sm text-muted px-1">Add goals to a self-care area to start earning milestones.</p>}
      <div className="flex flex-col gap-2">
        {areasWithGoals.map((ar) => {
          const d = week[ar.id] ?? 0;
          const claimed = state.weeklyClaims[wk]?.[ar.id] ?? 0;
          const reached = WEEKLY_TIERS.filter((t) => d >= t.days).length;
          const pending = WEEKLY_TIERS.slice(claimed, reached).reduce((s, t) => s + t.stones, 0);
          return (
            <div key={ar.id} className="flex items-center gap-3 rounded-3xl bg-surface shadow-card p-3">
              <span className="w-10 h-10 rounded-2xl grid place-items-center text-xl shrink-0" style={{ background: ar.color + '66' }}>
                {ar.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold leading-tight">{ar.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className={cx('h-2 flex-1 rounded-full', i < d ? 'bg-accent' : WEEKLY_TIERS.some((t) => t.days === i + 1) ? 'bg-energy-soft' : 'bg-surface-3')} />
                  ))}
                </div>
              </div>
              <span className="text-sm">{WEEKLY_TIERS.map((t, i) => (i < claimed ? '🌟' : d >= t.days ? '⭐' : '☆')).join('')}</span>
              {pending > 0 && (
                <Button size="sm" onClick={() => a.claimWeekly(ar.id)}>
                  <Price amount={pending} />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Special */}
      <SectionTitle>Special quests</SectionTitle>
      <div className="flex flex-col gap-2">
        {SPECIAL_QUESTS.map((q) => {
          const st = specialStatus(q, state);
          return (
            <div key={q.id} className="flex items-center gap-3 rounded-3xl bg-surface shadow-card p-3">
              <span className="text-2xl w-9 text-center">{q.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold leading-tight">{st.done ? 'All tiers complete!' : q.label(st.target!)}</p>
                {!st.done && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={st.value - st.prev} max={st.target! - st.prev} className="h-1.5 flex-1" />
                    <span className="text-[11px] font-bold text-muted">
                      {Math.min(st.value, st.target!)}/{st.target}
                    </span>
                  </div>
                )}
              </div>
              {st.claimable ? (
                <Button size="sm" onClick={() => a.claimSpecial(q.id)}>
                  <Price amount={SPECIAL_QUEST_STONES} />
                </Button>
              ) : (
                !st.done && <Price amount={SPECIAL_QUEST_STONES} className="text-sm text-muted" />
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
