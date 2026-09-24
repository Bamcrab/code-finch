import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Egg } from '../../art/misc';
import { CHALLENGE_MAP } from '../../data/challenges';
import { MOODS } from '../../game/constants';
import { dailyQuestsFor, eventClaimableTiers, questProgress } from '../../game/quests';
import { dayPart, formatDay } from '../../lib/date';
import { useDay, useStreak, useToday } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Button, Card, cx } from '../../ui/kit';
import { IconX } from '../../ui/icons';

function MoodCheckIn({ kind }: { kind: 'morning' | 'evening' }) {
  const nav = useNavigate();
  const name = useGame((s) => s.birb.name);
  return (
    <Card>
      <p className="font-black">{kind === 'morning' ? `Good morning! ${name} wants to know…` : 'Time to wind down 🌙'}</p>
      <p className="text-sm text-muted mb-3">{kind === 'morning' ? 'How are you feeling today?' : 'How was your day?'}</p>
      <div className="flex justify-between">
        {MOODS.map((m) => (
          <button key={m.value} aria-label={m.label} onClick={() => nav(`/mood?kind=${kind}&m=${m.value}`)} className="flex flex-col items-center gap-1 active:scale-90 transition">
            <span className="text-4xl">{m.emoji}</span>
            <span className="text-[11px] font-bold text-muted">{m.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function HomeCards() {
  const nav = useNavigate();
  const today = useToday();
  const day = useDay(today);
  const moods = useGame((s) => s.moods);
  const egg = useGame((s) => s.egg);
  const micropets = useGame((s) => s.micropets);
  const goals = useGame((s) => s.goals);
  const pause = useGame((s) => s.pause);
  const streakSettings = useGame((s) => s.streak);
  const streaksEnabled = useGame((s) => s.settings.streaksEnabled);
  const challenges = useGame((s) => s.challenges);
  const state = useGame();
  const a = useGame((s) => s.actions);
  const streak = useStreak();
  const part = dayPart(Date.now());

  const questReady = useMemo(() => {
    const qs = dailyQuestsFor(today, state);
    const daily = qs.filter((q) => !day.questsClaimed.includes(q.id) && questProgress(q, state, today) >= q.target).length;
    return daily + eventClaimableTiers(state, today).length;
  }, [state, today, day.questsClaimed]);

  const hasMorning = moods.some((m) => m.day === today && (m.kind === 'morning' || m.kind === 'log'));
  const hasEvening = moods.some((m) => m.day === today && m.kind === 'evening');
  const cards: React.ReactNode[] = [];

  if (pause) {
    cards.push(
      <Card key="pause" className="bg-sky-soft">
        <p className="font-black">⏸️ Pause mode is on</p>
        <p className="text-sm text-muted">Your streak is safe until {formatDay(pause.until)}. Rest well.</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => a.endPause()}>
          I'm back!
        </Button>
      </Card>,
    );
  }

  if (day.lowMood && !day.firstAidDismissed) {
    cards.push(
      <Card key="firstaid" className="bg-danger-soft relative">
        <button aria-label="Dismiss" className="absolute right-3 top-3 text-muted" onClick={() => a.dismissFirstAid()}>
          <IconX className="w-4 h-4" />
        </button>
        <p className="font-black">🩹 Rough day? You're not alone.</p>
        <p className="text-sm text-muted">Goals earn extra energy today. The First Aid Kit has gentle tools for right now.</p>
        <Button size="sm" className="mt-3" onClick={() => nav('/care/firstaid')}>
          Open First Aid Kit
        </Button>
      </Card>,
    );
  }

  if (!hasMorning && (part === 'morning' || part === 'afternoon')) cards.push(<MoodCheckIn key="am" kind="morning" />);
  else if (!hasEvening && (part === 'evening' || part === 'night')) cards.push(<MoodCheckIn key="pm" kind="evening" />);

  if (streaksEnabled && streak.repairable && streakSettings.repairs > 0) {
    cards.push(
      <Card key="streak">
        <p className="font-black">🔨 You missed {formatDay(streak.repairable, 'EEEE')}</p>
        <p className="text-sm text-muted">
          Use a streak repair to restore your {streak.repairRestores}-day streak. ({streakSettings.repairs} left)
        </p>
        <Button size="sm" variant="warm" className="mt-3" onClick={() => a.repairStreak()}>
          Repair streak
        </Button>
      </Card>,
    );
  }

  for (const c of challenges.filter((x) => !x.finishedDay)) {
    const def = CHALLENGE_MAP[c.id];
    if (!def) continue;
    const doneToday = c.done.includes(today);
    const nextIdx = c.done.findIndex((d) => !d);
    if (nextIdx < 0) continue;
    const step = def.steps[nextIdx];
    const count = c.done.filter(Boolean).length;
    cards.push(
      <Card key={`ch-${c.id}`}>
        <button className="w-full text-left" onClick={() => nav(`/challenges/${c.id}`)}>
          <p className="text-xs font-extrabold text-muted uppercase tracking-wide">
            {def.emoji} {def.name} · {count}/{def.steps.length}
          </p>
        </button>
        {doneToday ? (
          <p className="font-black mt-1">✅ Today's step is done! Come back tomorrow.</p>
        ) : (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl">{step.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black leading-tight">{step.title}</p>
              <p className="text-xs text-muted">Low energy? {step.easier}</p>
            </div>
            <Button size="sm" onClick={() => a.completeChallengeStep(c.id, nextIdx)}>
              Done
            </Button>
          </div>
        )}
      </Card>,
    );
  }

  if (!egg && goals.length > 0) {
    cards.push(
      <Card key="egg" className="flex items-center gap-3">
        <Egg color="#f3e3b5" className="w-14 h-16 shrink-0" wobble />
        <div className="flex-1">
          <p className="font-black">{micropets.length ? 'Professor Oat found another egg!' : 'Professor Oat has an egg for you!'}</p>
          <p className="text-sm text-muted">Link it to a goal. Finish that goal 7 times and it hatches into a micropet.</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            a.takeEgg();
            nav('/birb/pets');
          }}
        >
          Take it
        </Button>
      </Card>,
    );
  } else if (egg && !egg.linkedGoalId) {
    cards.push(
      <Card key="egglink" className="flex items-center gap-3" onClick={() => nav('/birb/pets')}>
        <Egg color="#f3e3b5" className="w-12 h-14 shrink-0" wobble />
        <div>
          <p className="font-black">Your egg needs a goal</p>
          <p className="text-sm text-muted">Tap to link it to a goal you'd like to build.</p>
        </div>
      </Card>,
    );
  }

  if (questReady > 0) {
    cards.push(
      <Card key="quests" className="flex items-center gap-3" onClick={() => nav('/quests')}>
        <span className="text-3xl">🎁</span>
        <div className="flex-1">
          <p className="font-black">
            {questReady} reward{questReady > 1 ? 's' : ''} ready to claim
          </p>
          <p className="text-sm text-muted">Head to Quests to collect.</p>
        </div>
      </Card>,
    );
  }

  if (!cards.length) return null;
  return <div className={cx('flex flex-col gap-3 mt-3')}>{cards}</div>;
}
