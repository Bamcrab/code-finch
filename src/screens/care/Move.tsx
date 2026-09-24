import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { rewardForMinutes } from '../../data/breathing';
import { MOVEMENT_DURATIONS, MOVEMENT_SETS, type Move } from '../../data/movements';
import { chime } from '../../lib/audio';
import { useGoalLink } from '../../lib/useGoalLink';
import { useStage } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Button, Card, Page, Progress, Segmented } from '../../ui/kit';
import { Confetti } from '../../ui/overlays';

export function MoveList() {
  const nav = useNavigate();
  return (
    <Page back title="Movement" subtitle="Gentle, follow-along routines">
      <div className="flex flex-col gap-2">
        {MOVEMENT_SETS.map((m) => (
          <Card key={m.id} onClick={() => nav(`/care/move/${m.id}`)} className="flex items-center gap-3 p-3">
            <span className="w-12 h-12 rounded-2xl bg-warm-soft grid place-items-center text-2xl">{m.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-black block">{m.name}</span>
              <span className="text-xs text-muted block">{m.blurb}</span>
              <span className="text-[11px] font-bold text-warm">{m.moves.map((x) => x.emoji).join(' ')}</span>
            </span>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function buildPlaylist(moves: Move[], minutes: number): Move[] {
  const out: Move[] = [];
  let total = 0;
  let i = 0;
  const target = minutes * 60;
  while (total < target) {
    const m = moves[i % moves.length];
    const secs = Math.min(m.seconds, target - total);
    out.push({ ...m, seconds: Math.max(10, secs) });
    total += secs;
    i++;
  }
  return out;
}

/** Keyed by the route param so switching ids starts a fresh session. */
export function MoveSession() {
  const { id = '' } = useParams();
  return <MoveSessionInner key={id} id={id} />;
}

function MoveSessionInner({ id }: { id: string }) {
  const nav = useNavigate();
  const set = MOVEMENT_SETS.find((m) => m.id === id) ?? MOVEMENT_SETS[0];
  const birb = useGame((s) => s.birb);
  const logActivity = useGame((s) => s.actions.logActivity);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const [minutes, setMinutes] = useState(3);
  const [phase, setPhase] = useState<'setup' | 'run' | 'done'>('setup');
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const playlist = useMemo(() => buildPlaylist(set.moves, minutes), [set, minutes]);
  const endRef = useRef(0);

  useEffect(() => {
    if (phase !== 'run' || paused) return;
    endRef.current = Date.now() + left * 1000;
    const t = window.setInterval(() => {
      const l = Math.ceil((endRef.current - Date.now()) / 1000);
      if (l <= 0) {
        chime('pat', true);
        if (idx + 1 >= playlist.length) {
          clearInterval(t);
          setPhase('done');
          chime('bell', true);
          const r = rewardForMinutes(minutes);
          logActivity({ type: 'movement', refId: set.id, title: set.name, seconds: minutes * 60, energy: r.energy, stones: r.stones, events: ['movement'] });
          finishGoal();
          return;
        }
        setIdx((i) => i + 1);
        const next = playlist[idx + 1].seconds;
        endRef.current = Date.now() + next * 1000;
        setLeft(next);
      } else setLeft(l);
    }, 250);
    return () => clearInterval(t);
  }, [phase, paused, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'done') {
    const r = rewardForMinutes(minutes);
    return (
      <Page back title={set.name}>
        <Confetti />
        <div className="text-center pt-8">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression="happy" flap className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">You moved your body! 💪</h2>
          <p className="text-muted mt-1">
            +{r.energy}⚡ +{r.stones}💎
          </p>
          <Button className="mt-8" block onClick={() => nav(-1)}>
            Done
          </Button>
        </div>
      </Page>
    );
  }

  if (phase === 'run') {
    const m = playlist[idx];
    const next = playlist[idx + 1];
    return (
      <Page back title={set.name}>
        <Progress value={idx} max={playlist.length} className="h-2" />
        <div className="text-center pt-6">
          <div className="text-8xl pop-in" key={idx}>
            {m.emoji}
          </div>
          <h2 className="text-3xl font-black mt-4">{m.name}</h2>
          <p className="text-muted mt-2 px-4">{m.cue}</p>
          <p className="text-6xl font-black text-warm mt-6 tabular-nums">{left}</p>
          <div className="walk inline-block mt-2">
            <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} animate={false} className="w-24 h-24" />
          </div>
          {next && <p className="text-sm text-muted mt-2">Next: {next.emoji} {next.name}</p>}
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (idx + 1 < playlist.length) {
                  setIdx(idx + 1);
                  setLeft(playlist[idx + 1].seconds);
                  endRef.current = Date.now() + playlist[idx + 1].seconds * 1000;
                }
              }}
            >
              Skip ›
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const r = rewardForMinutes(minutes);
  return (
    <Page back title={set.name} subtitle={set.blurb}>
      <div className="flex flex-col gap-2">
        {set.moves.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5">
            <span className="text-2xl">{m.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-bold block">{m.name}</span>
              <span className="text-xs text-muted">{m.cue}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="font-black text-sm text-muted mt-5 mb-2 px-1">Duration</p>
      <Segmented value={minutes} onChange={setMinutes} options={MOVEMENT_DURATIONS.map((m) => ({ value: m, label: `${m} min` }))} />
      <p className="text-xs text-muted mt-2 px-1">
        Earns +{r.energy}⚡ +{r.stones}💎. Move gently and skip anything that doesn't feel right.
      </p>
      <Button
        block
        size="lg"
        className="mt-5"
        onClick={() => {
          setIdx(0);
          setLeft(playlist[0].seconds);
          setPhase('run');
          chime('bell', true);
        }}
      >
        Start
      </Button>
    </Page>
  );
}
