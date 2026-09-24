import { useMemo, useState } from 'react';
import { Birb } from '../art/Birb';
import { Egg } from '../art/misc';
import { AREA_DEFS, EASY_WINS, type GoalSuggestion } from '../data/areas';
import { EGG_COLORS, PRONOUN_PRESETS, STAGES, TRAITS } from '../game/constants';
import { defaultColors } from '../game/engine';
import { chime } from '../lib/audio';
import { useActions } from '../state/store';
import type { Pronouns, TraitId } from '../state/types';
import { Button, cx, inputClass } from '../ui/kit';
import { Confetti } from '../ui/overlays';

const STARTER: { g: GoalSuggestion; area?: string }[] = [
  { g: EASY_WINS[0], area: 'health' },
  { g: AREA_DEFS.find((a) => a.id === 'hygiene')!.suggestions[0], area: 'hygiene' },
  { g: AREA_DEFS.find((a) => a.id === 'home')!.suggestions[0], area: 'home' },
  { g: AREA_DEFS.find((a) => a.id === 'home')!.suggestions[1], area: 'home' },
  { g: AREA_DEFS.find((a) => a.id === 'movement')!.suggestions[0], area: 'movement' },
  { g: AREA_DEFS.find((a) => a.id === 'calm')!.suggestions[0], area: 'calm' },
  { g: AREA_DEFS.find((a) => a.id === 'selfkindness')!.suggestions[5], area: 'selfkindness' },
  { g: AREA_DEFS.find((a) => a.id === 'gratitude')!.suggestions[0], area: 'gratitude' },
  { g: AREA_DEFS.find((a) => a.id === 'sleep')!.suggestions[0], area: 'sleep' },
  { g: AREA_DEFS.find((a) => a.id === 'nutrition')!.suggestions[0], area: 'nutrition' },
  { g: AREA_DEFS.find((a) => a.id === 'home')!.suggestions[4], area: 'home' },
  { g: AREA_DEFS.find((a) => a.id === 'connection')!.suggestions[0], area: 'connection' },
];

export default function Onboarding() {
  const { hatch } = useActions();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [egg, setEgg] = useState(EGG_COLORS[0].color);
  const [taps, setTaps] = useState(0);
  const [birbName, setBirbName] = useState('');
  const [pronouns, setPronouns] = useState<Pronouns>(PRONOUN_PRESETS[0]);
  const [custom, setCustom] = useState(false);
  const [trait, setTrait] = useState<TraitId>('curious');
  const [wake, setWake] = useState('07:30');
  const [bed, setBed] = useState('22:30');
  const [picked, setPicked] = useState<Set<number>>(new Set([0, 1, 2, 4, 6]));

  const colors = useMemo(() => defaultColors(egg), [egg]);
  const hatched = taps >= 3;
  const next = () => setStep((s) => s + 1);

  const finish = () => {
    const chosen = [...picked].map((i) => STARTER[i]);
    hatch({
      userName,
      birbName,
      pronouns,
      eggColor: egg,
      trait,
      wakeTime: wake,
      bedTime: bed,
      goals: chosen.map((c) => c.g),
      areaOf: (g) => chosen.find((c) => c.g === g)?.area,
    });
  };

  return (
    <div className="min-h-full flex flex-col mx-auto max-w-md px-6 py-10 safe-top">
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={cx('h-1.5 flex-1 rounded-full transition', i <= step ? 'bg-accent' : 'bg-surface-3')} />
        ))}
      </div>

      {step === 0 && (
        <Step title="Welcome 🌱" body="This is a cozy space to take care of yourself—and your home—with a little birb cheering you on. Every small thing you do gives your birb energy to go on adventures.">
          <Egg color={egg} className="w-40 h-48 mx-auto my-6" wobble />
          <Button block size="lg" onClick={next}>
            Let's begin
          </Button>
        </Step>
      )}

      {step === 1 && (
        <Step title="What should your birb call you?">
          <input autoFocus className={inputClass} placeholder="Your name" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && userName.trim() && next()} />
          <Button block size="lg" className="mt-6" disabled={!userName.trim()} onClick={next}>
            Continue
          </Button>
        </Step>
      )}

      {step === 2 && (
        <Step title="Choose an egg" body="Its color will be your birb's color.">
          <Egg color={egg} className="w-36 h-44 mx-auto my-4" wobble />
          <div className="grid grid-cols-6 gap-2 mb-6">
            {EGG_COLORS.map((e) => (
              <button key={e.id} aria-label={e.label} onClick={() => setEgg(e.color)} className={cx('aspect-square rounded-2xl border-4 transition', egg === e.color ? 'border-accent scale-110' : 'border-transparent')} style={{ background: e.color }} />
            ))}
          </div>
          <Button block size="lg" onClick={next}>
            This one!
          </Button>
        </Step>
      )}

      {step === 3 && (
        <Step title={hatched ? 'Hello, world! 🐣' : 'Tap the egg to hatch it'}>
          <div className="relative h-64 grid place-items-center my-4">
            {hatched ? (
              <>
                <Confetti count={30} />
                <Birb colors={colors} scale={STAGES[0].scale} expression="happy" flap className="w-64 h-64 pop-in" />
              </>
            ) : (
              <button
                aria-label="Tap egg"
                onClick={() => {
                  chime(taps === 2 ? 'hatch' : 'pat', true);
                  setTaps((t) => t + 1);
                }}
                className="active:scale-95 transition"
              >
                <Egg color={egg} progress={taps * 3} total={7} className="w-44 h-52" wobble />
              </button>
            )}
          </div>
          <Button block size="lg" disabled={!hatched} onClick={next}>
            Say hi
          </Button>
        </Step>
      )}

      {step === 4 && (
        <Step title="Name your birb">
          <Birb colors={colors} scale={STAGES[0].scale} className="w-40 h-40 mx-auto" />
          <input autoFocus className={inputClass} placeholder="Birb's name" value={birbName} onChange={(e) => setBirbName(e.target.value)} />
          <p className="font-extrabold text-muted text-sm mt-5 mb-2">Pronouns</p>
          <div className="flex flex-wrap gap-2">
            {PRONOUN_PRESETS.map((p) => (
              <button
                key={p.subject}
                onClick={() => {
                  setPronouns(p);
                  setCustom(false);
                }}
                className={cx('px-4 h-10 rounded-full font-bold border', !custom && pronouns.subject === p.subject ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line')}
              >
                {p.subject}/{p.object}
              </button>
            ))}
            <button onClick={() => setCustom(true)} className={cx('px-4 h-10 rounded-full font-bold border', custom ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line')}>
              Custom
            </button>
          </div>
          {custom && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(['subject', 'object', 'possessive'] as const).map((k) => (
                <input key={k} className={cx(inputClass, 'h-10 text-sm px-3')} placeholder={k === 'subject' ? 'xe' : k === 'object' ? 'xem' : 'xyr'} value={pronouns[k]} onChange={(e) => setPronouns({ ...pronouns, [k]: e.target.value })} />
              ))}
            </div>
          )}
          <Button block size="lg" className="mt-6" disabled={!birbName.trim()} onClick={next}>
            Continue
          </Button>
        </Step>
      )}

      {step === 5 && (
        <Step title={`What is ${birbName} like?`} body="Pick a starting trait. Their personality will keep growing from your conversations.">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {TRAITS.map((t) => (
              <button key={t.id} onClick={() => setTrait(t.id)} className={cx('rounded-2xl p-3 text-left border-2 transition', trait === t.id ? 'border-accent bg-accent-soft' : 'border-transparent bg-surface')}>
                <div className="text-2xl">{t.emoji}</div>
                <div className="font-black">{t.label}</div>
                <div className="text-xs text-muted">{t.blurb}</div>
              </button>
            ))}
          </div>
          <Button block size="lg" onClick={next}>
            Continue
          </Button>
        </Step>
      )}

      {step === 6 && (
        <Step title="Your daily rhythm" body={`${birbName} will wake up and go to sleep with you.`}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <label className="rounded-2xl bg-surface p-4 block">
              <span className="text-3xl">🌅</span>
              <span className="block font-black mt-1">Wake up</span>
              <input type="time" className="mt-2 w-full bg-surface-2 rounded-xl h-10 px-2" value={wake} onChange={(e) => setWake(e.target.value)} />
            </label>
            <label className="rounded-2xl bg-surface p-4 block">
              <span className="text-3xl">🌙</span>
              <span className="block font-black mt-1">Bedtime</span>
              <input type="time" className="mt-2 w-full bg-surface-2 rounded-xl h-10 px-2" value={bed} onChange={(e) => setBed(e.target.value)} />
            </label>
          </div>
          <Button block size="lg" onClick={next}>
            Continue
          </Button>
        </Step>
      )}

      {step === 7 && (
        <Step title="Pick a few goals to start" body="Small is perfect. You can add more—and home upkeep tasks—any time.">
          <div className="grid grid-cols-1 gap-2 mb-6">
            {STARTER.map((s, i) => {
              const on = picked.has(i);
              return (
                <button
                  key={i}
                  onClick={() => {
                    const n = new Set(picked);
                    if (on) n.delete(i);
                    else n.add(i);
                    setPicked(n);
                  }}
                  className={cx('flex items-center gap-3 rounded-2xl px-4 h-14 border-2 text-left transition', on ? 'border-accent bg-accent-soft' : 'border-transparent bg-surface')}
                >
                  <span className="text-2xl">{s.g.emoji}</span>
                  <span className="font-bold flex-1">{s.g.title}</span>
                  <span className={cx('w-6 h-6 rounded-full grid place-items-center text-sm font-black', on ? 'bg-accent text-accent-ink' : 'bg-surface-3')}>{on ? '✓' : ''}</span>
                </button>
              );
            })}
          </div>
          <Button block size="lg" onClick={finish}>
            Start our journey 🎒
          </Button>
        </Step>
      )}

      {step > 0 && step !== 3 && (
        <button className="mt-4 text-sm font-bold text-muted self-center" onClick={() => setStep((s) => Math.max(0, s - 1))}>
          ← Back
        </button>
      )}
    </div>
  );
}

function Step({ title, body, children }: { title: string; body?: string; children: React.ReactNode }) {
  return (
    <div className="pop-in">
      <h1 className="text-3xl font-black leading-tight">{title}</h1>
      {body && <p className="text-muted mt-2 mb-4">{body}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
