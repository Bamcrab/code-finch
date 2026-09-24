import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { GROUNDING } from '../../data/grounding';
import { chime } from '../../lib/audio';
import { useGoalLink } from '../../lib/useGoalLink';
import { useStage } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Button, Card, Page, Progress, cx, inputClass } from '../../ui/kit';

export function GroundingList() {
  const nav = useNavigate();
  return (
    <Page back title="Grounding" subtitle="Come back to the present moment">
      <div className="flex flex-col gap-2">
        {GROUNDING.map((g) => (
          <Card key={g.id} onClick={() => nav(`/care/grounding/${g.id}`)} className="flex items-center gap-3 p-3">
            <span className="w-12 h-12 rounded-2xl bg-accent-soft grid place-items-center text-2xl">{g.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-black block">{g.name}</span>
              <span className="text-xs text-muted">{g.blurb}</span>
            </span>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/** Keyed by the route param so switching ids starts a fresh session. */
export function GroundingRun() {
  const { id = '' } = useParams();
  return <GroundingRunInner key={id} id={id} />;
}

function GroundingRunInner({ id }: { id: string }) {
  const nav = useNavigate();
  const ex = GROUNDING.find((g) => g.id === id) ?? GROUNDING[0];
  const birb = useGame((s) => s.birb);
  const logActivity = useGame((s) => s.actions.logActivity);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const [i, setI] = useState(0);
  const [values, setValues] = useState<string[][]>(() => ex.steps.map((s) => Array(s.inputs).fill('')));
  const [left, setLeft] = useState(ex.steps[0].seconds ?? 0);
  const [done, setDone] = useState(false);
  const step = ex.steps[i];

  useEffect(() => {
    setLeft(step?.seconds ?? 0);
    if (!step?.seconds) return;
    const t = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (i + 1 < ex.steps.length) setI(i + 1);
    else {
      setDone(true);
      chime('bell', true);
      logActivity({ type: 'grounding', refId: ex.id, title: ex.name, energy: 5, stones: 3, events: ['grounding'] });
      finishGoal();
    }
  };

  if (done) {
    return (
      <Page back title={ex.name}>
        <div className="text-center pt-8">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression="happy" className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">You're here. You're okay. 💛</h2>
          <p className="text-muted mt-1">Take one more slow breath. +5⚡ +3💎</p>
          <div className="grid grid-cols-2 gap-2 mt-8">
            <Button variant="outline" onClick={() => nav('/care/firstaid')}>
              First Aid Kit
            </Button>
            <Button onClick={() => nav(-1)}>Done</Button>
          </div>
        </div>
      </Page>
    );
  }

  const filled = values[i].every((v) => v.trim());
  return (
    <Page back title={ex.name}>
      <Progress value={i} max={ex.steps.length} className="h-2" />
      <div className="text-center pt-6 pop-in" key={i}>
        <div className="w-24 h-24 rounded-full mx-auto grid place-items-center text-5xl" style={{ background: step.color ? step.color + '55' : 'var(--accent-soft)' }}>
          {step.emoji}
        </div>
        <h2 className="text-2xl font-black mt-4 leading-snug">{step.prompt}</h2>
      </div>
      {step.inputs > 0 ? (
        <div className="flex flex-col gap-2 mt-6">
          {values[i].map((v, k) => (
            <input
              key={k}
              autoFocus={k === 0}
              className={inputClass}
              placeholder={`${k + 1}.`}
              value={v}
              onChange={(e) => setValues(values.map((row, r) => (r === i ? row.map((x, c) => (c === k ? e.target.value : x)) : row)))}
            />
          ))}
        </div>
      ) : (
        <p className={cx('text-center text-6xl font-black mt-8 tabular-nums', left === 0 ? 'text-accent' : 'text-muted')}>{left > 0 ? left : '✓'}</p>
      )}
      <Button block size="lg" className="mt-6" onClick={next} variant={step.inputs > 0 && !filled ? 'soft' : 'primary'}>
        {i + 1 < ex.steps.length ? (step.inputs > 0 && !filled ? 'Skip ahead' : 'Next') : 'Finish'}
      </Button>
    </Page>
  );
}
