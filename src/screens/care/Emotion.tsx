import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMOTION_FAMILIES, type EmotionFamily, type EmotionGroup } from '../../data/emotions';
import { useGoalLink } from '../../lib/useGoalLink';
import { useGame } from '../../state/store';
import { Button, Page, cx, textareaClass } from '../../ui/kit';

export default function Emotion() {
  const nav = useNavigate();
  const a = useGame((s) => s.actions);
  const { finishGoal } = useGoalLink();
  const [family, setFamily] = useState<EmotionFamily | null>(null);
  const [group, setGroup] = useState<EmotionGroup | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [why, setWhy] = useState('');
  const [done, setDone] = useState(false);

  const save = () => {
    a.logActivity({ type: 'emotion', title: `Named: ${picked.join(', ')}`, energy: 5, stones: 3, events: ['emotion'] });
    if (why.trim()) {
      a.saveReflection({
        promptId: 'free',
        title: `Feeling ${picked.join(', ').toLowerCase()}`,
        emoji: group?.emoji ?? '🫶',
        answers: [{ question: `Why do you feel ${picked.join(', ').toLowerCase()}?`, text: why }],
      });
    }
    finishGoal();
    setDone(true);
  };

  if (done) {
    return (
      <Page back title="Name your emotion">
        <div className="text-center pt-10">
          <div className="text-6xl">{group?.emoji}</div>
          <h2 className="text-2xl font-black mt-3">Naming it helps tame it.</h2>
          <p className="text-muted mt-1">You noticed: {picked.join(', ')}. That's real self-awareness. 💛</p>
          <Button block className="mt-8" onClick={() => nav(-1)}>
            Done
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page back title="Name your emotion" subtitle="Zoom in on what you're feeling">
      {!family && (
        <div className="flex flex-col gap-3 mt-2">
          <p className="font-black text-lg">Overall, is this feeling…</p>
          {EMOTION_FAMILIES.map((f) => (
            <button key={f.id} onClick={() => setFamily(f)} className="flex items-center gap-4 rounded-3xl bg-surface shadow-card p-4 text-left active:scale-[0.98] transition">
              <span className="text-4xl">{f.emoji}</span>
              <span className="text-xl font-black">{f.label}</span>
            </button>
          ))}
        </div>
      )}
      {family && !group && (
        <div className="mt-2">
          <p className="font-black text-lg mb-3">Which is closest?</p>
          <div className="grid grid-cols-2 gap-2">
            {family.groups.map((g) => (
              <button key={g.id} onClick={() => setGroup(g)} className="rounded-3xl p-4 text-left shadow-card active:scale-[0.97] transition" style={{ background: g.color + '66' }}>
                <span className="text-4xl">{g.emoji}</span>
                <span className="block font-black mt-1">{g.label}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" className="mt-3" onClick={() => setFamily(null)}>
            ← Back
          </Button>
        </div>
      )}
      {group && (
        <div className="mt-2">
          <p className="font-black text-lg mb-1">
            {group.emoji} More specifically…
          </p>
          <p className="text-sm text-muted mb-3">Pick all that fit.</p>
          <div className="flex flex-wrap gap-2">
            {group.feelings.map((f) => {
              const on = picked.includes(f);
              return (
                <button key={f} onClick={() => setPicked(on ? picked.filter((x) => x !== f) : [...picked, f])} className={cx('h-11 px-4 rounded-full font-bold border-2 transition', on ? 'border-transparent text-[#2f2a25]' : 'border-line bg-surface')} style={on ? { background: group.color } : undefined}>
                  {f}
                </button>
              );
            })}
          </div>
          {picked.length > 0 && (
            <>
              <p className="font-black mt-6 mb-2">What might be causing it? (optional)</p>
              <textarea className={cx(textareaClass, 'min-h-28')} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Saved to your journal if you write something" />
            </>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={() => { setGroup(null); setPicked([]); }}>
              ← Back
            </Button>
            <Button block disabled={!picked.length} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
