import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KINDNESS_ACTS } from '../../data/grounding';
import { useGoalLink } from '../../lib/useGoalLink';
import { useGame } from '../../state/store';
import { Button, Page, SectionTitle, cx, inputClass } from '../../ui/kit';

export default function Kindness() {
  const nav = useNavigate();
  const logActivity = useGame((s) => s.actions.logActivity);
  const { finishGoal } = useGoalLink();
  const [picked, setPicked] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [done, setDone] = useState(false);

  const complete = () => {
    const what = picked ?? custom.trim();
    if (!what) return;
    logActivity({ type: 'kindness', title: `Kindness: ${what}`, energy: 5, stones: 5, events: ['kindness'] });
    finishGoal();
    setDone(true);
  };

  if (done) {
    return (
      <Page back title="Acts of kindness">
        <div className="text-center pt-10">
          <div className="text-6xl">💌</div>
          <h2 className="text-2xl font-black mt-3">The world is a little warmer.</h2>
          <p className="text-muted mt-1">+5⚡ +5💎</p>
          <div className="grid grid-cols-2 gap-2 mt-8">
            <Button variant="outline" onClick={() => nav('/care/reflect/giving-kindness')}>
              Reflect on it
            </Button>
            <Button onClick={() => nav(-1)}>Done</Button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back title="Acts of kindness" subtitle="Pick one, do it, then check it off">
      {KINDNESS_ACTS.map((cat) => (
        <div key={cat.category}>
          <SectionTitle>
            {cat.emoji} {cat.category}
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {cat.items.map((it) => (
              <button key={it} onClick={() => setPicked(picked === it ? null : it)} className={cx('rounded-2xl px-4 py-3 text-left font-bold border-2 transition', picked === it ? 'border-accent bg-accent-soft' : 'border-transparent bg-surface')}>
                {it}
              </button>
            ))}
          </div>
        </div>
      ))}
      <SectionTitle>Something else</SectionTitle>
      <input className={inputClass} placeholder="What kind thing did you do?" value={custom} onChange={(e) => { setCustom(e.target.value); setPicked(null); }} />
      <Button block size="lg" className="mt-5" disabled={!picked && !custom.trim()} onClick={complete}>
        I did it! 💌
      </Button>
    </Page>
  );
}
