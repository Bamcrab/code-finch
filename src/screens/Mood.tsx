import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Birb } from '../art/Birb';
import { EMOTION_FAMILIES, MOOD_FACTORS } from '../data/emotions';
import { MOODS } from '../game/constants';
import { useGoalLink } from '../lib/useGoalLink';
import { useStage, useToday } from '../state/hooks';
import { useGame } from '../state/store';
import type { Mood as MoodValue, MoodEntry } from '../state/types';
import { Button, Page, SectionTitle, cx, inputClass, textareaClass } from '../ui/kit';

const SCALE = ['😩', '😕', '😐', '🙂', '🤩'];

function ScalePicker({ value, onChange, labels }: { value?: number; onChange: (v: MoodValue) => void; labels: [string, string] }) {
  return (
    <div>
      <div className="flex justify-between gap-1">
        {SCALE.map((e, i) => (
          <button key={i} onClick={() => onChange((i + 1) as MoodValue)} className={cx('flex-1 h-14 rounded-2xl text-3xl transition', value === i + 1 ? 'bg-accent-soft ring-2 ring-accent scale-105' : 'bg-surface')}>
            {e}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted font-bold mt-1 px-1">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

export default function Mood() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const kind = (params.get('kind') ?? 'log') as MoodEntry['kind'];
  const initial = Number(params.get('m')) || undefined;
  const today = useToday();
  const birb = useGame((s) => s.birb);
  const moods = useGame((s) => s.moods);
  const a = useGame((s) => s.actions);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const [mood, setMood] = useState<MoodValue | undefined>(initial as MoodValue | undefined);
  const [scale, setScale] = useState<MoodValue | undefined>();
  const [intention, setIntention] = useState('');
  const [factors, setFactors] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<MoodValue | null>(null);
  const todays = useMemo(() => moods.filter((m) => m.day === today), [moods, today]);

  const feelingChoices = useMemo(() => {
    if (!mood) return [];
    const fam = mood >= 4 ? 'pleasant' : mood === 3 ? 'neutral' : 'unpleasant';
    return EMOTION_FAMILIES.find((f) => f.id === fam)!.groups.flatMap((g) => g.feelings.slice(0, 4));
  }, [mood]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = () => {
    if (!mood) return;
    a.logMood({ mood, factors, emotions, note: note.trim() || undefined, kind });
    if (kind === 'morning') a.setCheckIn({ motivation: scale, intention: intention.trim() || undefined });
    if (kind === 'evening') a.setCheckIn({ satisfaction: scale });
    finishGoal();
    setSaved(mood);
  };

  if (saved) {
    const low = saved <= 2;
    return (
      <Page back title="Mood logged">
        <div className="text-center pt-6">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={low ? 'sad' : 'happy'} className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">{low ? "Thank you for telling me. I'm here. 💛" : saved === 3 ? 'Thanks for checking in!' : 'Yay! I love seeing you happy!'}</h2>
          {low && <p className="text-muted mt-2">Today every goal gives extra energy and stones. Be gentle with yourself.</p>}
          <div className="flex flex-col gap-2 mt-8">
            {low && (
              <Button variant="warm" block onClick={() => nav('/care/firstaid')}>
                🩹 Open First Aid Kit
              </Button>
            )}
            {kind === 'evening' && (
              <Button variant="soft" block onClick={() => nav('/care/reflect/night')}>
                🌙 Night reflection
              </Button>
            )}
            {kind === 'morning' && (
              <Button variant="soft" block onClick={() => nav('/')}>
                🎯 See today's goals
              </Button>
            )}
            <Button variant="outline" block onClick={() => nav(-1)}>
              Done
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back title={kind === 'morning' ? 'Morning check-in' : kind === 'evening' ? 'Evening check-in' : 'How are you feeling?'}>
      <div className="flex justify-between gap-1 mt-2">
        {MOODS.map((m) => (
          <button key={m.value} onClick={() => setMood(m.value as MoodValue)} className={cx('flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition', mood === m.value ? 'bg-surface shadow-card scale-105' : 'opacity-70')}>
            <span className="text-4xl">{m.emoji}</span>
            <span className="text-xs font-extrabold">{m.label}</span>
          </button>
        ))}
      </div>

      {mood && (
        <div className="fade-in">
          {kind === 'morning' && (
            <>
              <SectionTitle>How motivated do you feel?</SectionTitle>
              <ScalePicker value={scale} onChange={setScale} labels={['Not at all', 'Ready to go!']} />
              <SectionTitle>One intention for today</SectionTitle>
              <input className={inputClass} placeholder="e.g. Be patient with myself" value={intention} onChange={(e) => setIntention(e.target.value)} />
            </>
          )}
          {kind === 'evening' && (
            <>
              <SectionTitle>How satisfied are you with today?</SectionTitle>
              <ScalePicker value={scale} onChange={setScale} labels={['Not really', 'Very']} />
            </>
          )}

          <SectionTitle>Feelings (optional)</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {feelingChoices.map((f) => (
              <button key={f} onClick={() => toggle(emotions, setEmotions, f)} className={cx('h-9 px-3 rounded-full text-sm font-bold border transition', emotions.includes(f) ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line')}>
                {f}
              </button>
            ))}
          </div>

          <SectionTitle>What's affecting you? (optional)</SectionTitle>
          {MOOD_FACTORS.map((cat) => (
            <div key={cat.category} className="mb-3">
              <p className="text-xs font-bold text-muted mb-1.5 px-1">{cat.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((f) => (
                  <button key={f.label} onClick={() => toggle(factors, setFactors, f.label)} className={cx('h-9 px-3 rounded-full text-sm font-bold border transition', factors.includes(f.label) ? 'bg-warm text-white border-warm' : 'bg-surface border-line')}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <SectionTitle>Anything on your mind? (optional)</SectionTitle>
          <textarea className={cx(textareaClass, 'min-h-24')} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A few words about why…" />

          <Button block size="lg" className="mt-5" onClick={save}>
            Save
          </Button>
        </div>
      )}

      {todays.length > 0 && (
        <>
          <SectionTitle>Today so far</SectionTitle>
          <div className="flex flex-col gap-2">
            {[...todays].reverse().map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2">
                <span className="text-2xl">{MOODS[m.mood - 1].emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="font-bold block">
                    {MOODS[m.mood - 1].label}
                    {m.kind !== 'log' && <span className="text-xs text-muted"> · {m.kind} check-in</span>}
                  </span>
                  {(m.emotions.length > 0 || m.factors.length > 0) && <span className="text-xs text-muted truncate block">{[...m.emotions, ...m.factors].join(', ')}</span>}
                </span>
                <span className="text-xs text-muted">{format(m.at, 'h:mm a')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
