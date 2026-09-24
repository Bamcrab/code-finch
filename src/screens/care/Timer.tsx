import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { rewardForMinutes } from '../../data/breathing';
import { chime } from '../../lib/audio';
import { SOUNDS } from '../../lib/soundscapes';
import { useGoalLink } from '../../lib/useGoalLink';
import { useStage } from '../../state/hooks';
import { useSound } from '../../state/sound';
import { useGame } from '../../state/store';
import { Button, Chip, Page, Ring, SectionTitle, Segmented, inputClass } from '../../ui/kit';
import { Confetti } from '../../ui/overlays';

const PRESETS = [3, 5, 10, 15, 20, 25, 30, 45, 60];
const BACKGROUNDS = ['none', 'rain', 'forest', 'ocean', 'stream', 'brown'];

/** Longer sessions earn more, capped at the 10-minute breathing tier. */
const timerReward = (m: number) => rewardForMinutes(m >= 30 ? 10 : m >= 15 ? 5 : m >= 10 ? 3 : 1);

export default function Timer() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const birb = useGame((s) => s.birb);
  const logActivity = useGame((s) => s.actions.logActivity);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const sound = useSound();
  const [mode, setMode] = useState<'focus' | 'meditate'>('focus');
  const [minutes, setMinutes] = useState(Number(params.get('min')) || 10);
  const [bg, setBg] = useState('none');
  const [intention, setIntention] = useState('');
  const [state, setState] = useState<'setup' | 'running' | 'paused' | 'done'>('setup');
  const [left, setLeft] = useState(minutes * 60_000);
  const endAt = useRef(0);

  useEffect(() => {
    if (state !== 'running') return;
    const t = window.setInterval(() => {
      const l = endAt.current - Date.now();
      setLeft(Math.max(0, l));
      if (l <= 0) {
        clearInterval(t);
        setState('done');
        chime('bell', true);
        if (bg !== 'none' && useSound.getState().layers[bg] !== undefined) useSound.getState().toggle(bg);
        const r = timerReward(minutes);
        logActivity({ type: 'timer', refId: mode, title: `${mode === 'focus' ? 'Focus' : 'Meditation'} · ${minutes} min`, seconds: minutes * 60, energy: r.energy, stones: r.stones, events: ['timer'] });
        finishGoal();
      }
    }, 250);
    return () => clearInterval(t);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    endAt.current = Date.now() + minutes * 60_000;
    setLeft(minutes * 60_000);
    setState('running');
    chime('bell', true);
    if (bg !== 'none' && sound.layers[bg] === undefined) sound.toggle(bg);
  };

  const mm = Math.floor(left / 60_000);
  const ss = Math.floor((left % 60_000) / 1000);

  if (state === 'done') {
    const r = timerReward(minutes);
    return (
      <Page back title="Timer">
        <Confetti />
        <div className="text-center pt-8">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression="happy" className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">{minutes} minutes complete!</h2>
          {intention && <p className="text-muted mt-1">“{intention}”</p>}
          <p className="text-muted mt-1">
            +{r.energy}⚡ +{r.stones}💎
          </p>
          <div className="grid grid-cols-2 gap-2 mt-8">
            <Button variant="outline" onClick={() => setState('setup')}>
              Another
            </Button>
            <Button onClick={() => nav(-1)}>Done</Button>
          </div>
        </div>
      </Page>
    );
  }

  if (state !== 'setup') {
    return (
      <Page back title={mode === 'focus' ? 'Focusing' : 'Meditating'}>
        <div className="grid place-items-center pt-6">
          <Ring value={1 - left / (minutes * 60_000)} size={280} stroke={14}>
            <div className="text-center">
              <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={mode === 'meditate' ? 'closed' : 'open'} className="w-32 h-32 mx-auto" />
              <p className="text-4xl font-black tabular-nums">
                {mm}:{String(ss).padStart(2, '0')}
              </p>
            </div>
          </Ring>
          {intention && <p className="mt-4 font-bold text-muted">“{intention}”</p>}
          <div className="flex gap-2 mt-8">
            {state === 'running' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setLeft(endAt.current - Date.now());
                  setState('paused');
                }}
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={() => {
                  endAt.current = Date.now() + left;
                  setState('running');
                }}
              >
                Resume
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setState('setup');
                if (bg !== 'none' && useSound.getState().layers[bg] !== undefined) useSound.getState().toggle(bg);
              }}
            >
              End early
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const r = timerReward(minutes);
  return (
    <Page back title="Focus timer">
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'focus', label: '🎯 Focus' },
          { value: 'meditate', label: '🧘 Meditate' },
        ]}
      />
      <SectionTitle>Minutes</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <Chip key={m} active={minutes === m} onClick={() => setMinutes(m)}>
            {m}
          </Chip>
        ))}
        <input type="number" min={1} max={240} className="w-24 h-9 rounded-full bg-surface border border-line px-3 font-bold" value={minutes} onChange={(e) => setMinutes(Math.max(1, Math.min(240, Number(e.target.value) || 1)))} />
      </div>
      <SectionTitle>Background</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {BACKGROUNDS.map((b) => {
          const s = SOUNDS.find((x) => x.id === b);
          return (
            <Chip key={b} active={bg === b} onClick={() => setBg(b)}>
              {s ? `${s.emoji} ${s.name}` : '🔇 Silence'}
            </Chip>
          );
        })}
      </div>
      <SectionTitle>Intention (optional)</SectionTitle>
      <input className={inputClass} placeholder={mode === 'focus' ? 'What will you focus on?' : 'What do you want to let go of?'} value={intention} onChange={(e) => setIntention(e.target.value)} />
      <p className="text-xs text-muted mt-3 px-1">
        Finishing earns +{r.energy}⚡ +{r.stones}💎.
      </p>
      <Button block size="lg" className="mt-4" onClick={start}>
        Start {minutes}-minute {mode === 'focus' ? 'focus' : 'meditation'}
      </Button>
    </Page>
  );
}
