import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CHALLENGES, CHALLENGE_MAP } from '../data/challenges';
import { hex } from '../data/palette';
import { formatDay } from '../lib/date';
import { useToday } from '../state/hooks';
import { useGame } from '../state/store';
import { Button, Card, Confirm, Page, Progress, SectionTitle, cx } from '../ui/kit';

export default function Challenges() {
  const nav = useNavigate();
  const progress = useGame((s) => s.challenges);
  return (
    <Page back title="Challenges" subtitle="14 small steps, one per day">
      <p className="text-sm text-muted px-1 mb-3">
        Join a challenge and do one step each day, in any order. Finish all 14 to earn a wall award for your birbhouse. Low on energy? Every step has a gentler version.
      </p>
      <div className="flex flex-col gap-2">
        {CHALLENGES.map((c) => {
          const p = progress.find((x) => x.id === c.id);
          const n = p?.done.filter(Boolean).length ?? 0;
          return (
            <Card key={c.id} onClick={() => nav(`/challenges/${c.id}`)} className="flex items-center gap-3 p-3">
              <span className="w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0" style={{ background: hex(c.color) + '55' }}>
                {c.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-black block">
                  {c.name} {p?.finishedDay && '🏆'}
                </span>
                <span className="text-xs text-muted block truncate">{c.blurb}</span>
                {p && !p.finishedDay && <Progress value={n} max={c.steps.length} className="h-1.5 mt-1.5" />}
              </span>
              <span className="text-xs font-black text-muted shrink-0">{p ? (p.finishedDay ? 'Done!' : `${n}/14`) : ''}</span>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

export function ChallengeDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const today = useToday();
  const def = CHALLENGE_MAP[id] ?? CHALLENGES[0];
  const all = useGame((s) => s.challenges);
  const a = useGame((s) => s.actions);
  const [confirm, setConfirm] = useState(false);
  const p = all.find((x) => x.id === def.id);
  const active = p && !p.finishedDay;
  const doneToday = p?.done.includes(today);
  const n = p?.done.filter(Boolean).length ?? 0;

  return (
    <Page back title={`${def.emoji} ${def.name}`}>
      <Card className="text-center">
        <p className="text-muted">{def.blurb}</p>
        {p ? (
          <>
            <Progress value={n} max={def.steps.length} className="mt-3" />
            <p className="text-sm font-bold mt-2">
              {p.finishedDay ? `Completed ${formatDay(p.finishedDay, 'MMM d')}! 🏆 Your award is in the Decorate screen.` : `${n} of ${def.steps.length} steps · started ${formatDay(p.startedDay, 'MMM d')}`}
            </p>
            {active && doneToday && <p className="text-sm text-accent font-bold mt-1">✅ Today's step is done. See you tomorrow!</p>}
          </>
        ) : (
          <Button block size="lg" className="mt-4" onClick={() => a.joinChallenge(def.id)}>
            Join challenge
          </Button>
        )}
        {p?.finishedDay && (
          <Button variant="soft" className="mt-3" onClick={() => a.joinChallenge(def.id)}>
            Do it again
          </Button>
        )}
      </Card>
      <SectionTitle>Steps</SectionTitle>
      <div className="flex flex-col gap-2">
        {def.steps.map((s, i) => {
          const d = p?.done[i];
          const canDo = active && !d && !doneToday;
          return (
            <div key={i} className={cx('rounded-3xl bg-surface shadow-card p-3 flex items-center gap-3', d && 'opacity-60')}>
              <span className="text-2xl w-9 text-center">{d ? '✅' : s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cx('font-bold leading-tight', d && 'line-through')}>
                  {i + 1}. {s.title}
                </p>
                <p className="text-xs text-muted">{d ? `Done ${formatDay(d, 'MMM d')}` : `Gentler: ${s.easier}`}</p>
              </div>
              {canDo && (
                <Button size="sm" onClick={() => a.completeChallengeStep(def.id, i)}>
                  Done
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {active && (
        <Button variant="ghost" block className="mt-4 text-danger" onClick={() => setConfirm(true)}>
          Leave challenge
        </Button>
      )}
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          a.leaveChallenge(def.id);
          nav(-1);
        }}
        title="Leave this challenge?"
        body="Your progress will be lost. You can rejoin anytime."
        confirmLabel="Leave"
        danger
      />
    </Page>
  );
}
