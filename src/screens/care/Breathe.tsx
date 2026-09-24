import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { BREATHING, BREATH_CATEGORIES, BREATH_DURATIONS, PHASE_LABEL, rewardForMinutes } from '../../data/breathing';
import { chime } from '../../lib/audio';
import { useGoalLink } from '../../lib/useGoalLink';
import { useStage } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Button, Card, Chip, Page, SectionTitle, Segmented } from '../../ui/kit';
import { Confetti } from '../../ui/overlays';

export function BreatheList() {
  const nav = useNavigate();
  const [cat, setCat] = useState('All');
  const list = BREATHING.filter((b) => cat === 'All' || b.categories.includes(cat));
  return (
    <Page back title="Breathe" subtitle="Follow the circle">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {['All', ...BREATH_CATEGORIES].map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <SectionTitle>{cat === 'All' ? 'All exercises' : cat}</SectionTitle>
      <div className="flex flex-col gap-2">
        {list.map((b) => (
          <Card key={b.id} onClick={() => nav(`/care/breathe/${b.id}`)} className="flex items-center gap-3 p-3">
            <span className="w-12 h-12 rounded-2xl bg-sky-soft grid place-items-center text-2xl">{b.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-black block">{b.name}</span>
              <span className="text-xs text-muted block">{b.blurb}</span>
              <span className="text-[11px] font-bold text-accent">{b.steps.map((s) => `${s.seconds}`).join('-')} rhythm</span>
            </span>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/** Keyed by the route param so switching ids starts a fresh session. */
export function BreatheSession() {
  const { id = '' } = useParams();
  return <BreatheSessionInner key={id} id={id} />;
}

function BreatheSessionInner({ id }: { id: string }) {
  const nav = useNavigate();
  const pattern = BREATHING.find((b) => b.id === id) ?? BREATHING[0];
  const birb = useGame((s) => s.birb);
  const logActivity = useGame((s) => s.actions.logActivity);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const [minutes, setMinutes] = useState(1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(pattern.steps[0].seconds);
  const startRef = useRef(0);
  const phaseStart = useRef(0);
  const phaseIdxRef = useRef(0);
  const totalMs = minutes * 60_000;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const now = Date.now();
      const el = now - startRef.current;
      setElapsed(el);
      const step = pattern.steps[phaseIdxRef.current];
      const inPhase = (now - phaseStart.current) / 1000;
      setPhaseLeft(Math.max(0, Math.ceil(step.seconds - inPhase)));
      if (inPhase >= step.seconds) {
        const next = (phaseIdxRef.current + 1) % pattern.steps.length;
        if (next === 0 && el >= totalMs) {
          setRunning(false);
          setDone(true);
          const r = rewardForMinutes(minutes);
          logActivity({ type: 'breathe', refId: pattern.id, title: pattern.name, seconds: minutes * 60, energy: r.energy, stones: r.stones, events: ['breathe'] });
          finishGoal();
          chime('bell');
          return;
        }
        phaseIdxRef.current = next;
        phaseStart.current = now;
        setPhaseIdx(next);
        setPhaseLeft(pattern.steps[next].seconds);
      }
    }, 100);
    return () => clearInterval(t);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    startRef.current = Date.now();
    phaseStart.current = Date.now();
    phaseIdxRef.current = 0;
    setPhaseIdx(0);
    setElapsed(0);
    setPhaseLeft(pattern.steps[0].seconds);
    setRunning(true);
    chime('bell');
  };

  const step = pattern.steps[phaseIdx];
  const expanded = step.phase === 'in' || step.phase === 'in2' || (step.phase === 'hold' && pattern.steps[(phaseIdx - 1 + pattern.steps.length) % pattern.steps.length].phase !== 'out');
  const scale = !running ? 0.7 : step.phase === 'in2' ? 1.05 : expanded ? 1 : 0.55;
  const r = rewardForMinutes(minutes);

  if (done) {
    return (
      <Page back title={pattern.name}>
        <Confetti />
        <div className="text-center pt-6">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression="happy" className="w-48 h-48 mx-auto" />
          <h2 className="text-2xl font-black">Beautifully done 🌬️</h2>
          <p className="text-muted mt-1">
            {minutes} minute{minutes > 1 ? 's' : ''} of mindful breathing. +{r.energy}⚡ +{r.stones}💎
          </p>
          <div className="grid grid-cols-2 gap-2 mt-8">
            <Button variant="outline" onClick={() => setDone(false)}>
              Again
            </Button>
            <Button onClick={() => nav(-1)}>Done</Button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back title={pattern.name} subtitle={pattern.blurb}>
      <div className="relative h-[360px] grid place-items-center mt-4">
        <div
          className="breathe-circle absolute w-72 h-72 rounded-full bg-sky-soft"
          style={{ transform: `scale(${scale})`, transitionDuration: running ? `${step.seconds}s` : '0.6s', transitionTimingFunction: 'ease-in-out' }}
        />
        <div
          className="breathe-circle absolute w-56 h-56 rounded-full bg-sky/25"
          style={{ transform: `scale(${scale})`, transitionDuration: running ? `${step.seconds}s` : '0.6s', transitionTimingFunction: 'ease-in-out' }}
        />
        <div className="relative text-center">
          <div className="breathe-circle" style={{ transform: `scale(${0.85 + scale * 0.2})`, transitionDuration: running ? `${step.seconds}s` : '0.6s' }}>
            <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={running && !expanded ? 'closed' : 'open'} animate={false} className="w-32 h-32 mx-auto" />
          </div>
          {running && (
            <>
              <p className="text-2xl font-black">{PHASE_LABEL[step.phase]}</p>
              <p className="text-4xl font-black text-sky">{phaseLeft}</p>
            </>
          )}
        </div>
      </div>
      {running ? (
        <div className="text-center">
          <p className="text-muted font-bold">{Math.max(0, Math.ceil((totalMs - elapsed) / 1000))}s left</p>
          <Button variant="outline" className="mt-4" onClick={() => setRunning(false)}>
            Stop
          </Button>
        </div>
      ) : (
        <>
          <p className="font-black text-sm text-muted mb-2 px-1">Duration</p>
          <Segmented value={minutes} onChange={setMinutes} options={BREATH_DURATIONS.map((m) => ({ value: m, label: `${m} min` }))} />
          <p className="text-xs text-muted mt-2 px-1">
            Earns +{r.energy}⚡ and +{r.stones}💎. Stop anytime if you feel lightheaded.
          </p>
          <Button block size="lg" className="mt-5" onClick={start}>
            Begin
          </Button>
        </>
      )}
    </Page>
  );
}
