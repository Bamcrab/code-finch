import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { AFFIRMATIONS } from '../../data/grounding';
import { chime } from '../../lib/audio';
import { seeded } from '../../lib/rng';
import { useGoalLink } from '../../lib/useGoalLink';
import { useStage, useToday } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Button, Page, cx } from '../../ui/kit';

export default function Affirmation() {
  const nav = useNavigate();
  const today = useToday();
  const birb = useGame((s) => s.birb);
  const logActivity = useGame((s) => s.actions.logActivity);
  const stage = useStage();
  const { finishGoal } = useGoalLink();
  const daily = useMemo(() => Math.floor(seeded(`aff:${today}`)() * AFFIRMATIONS.length), [today]);
  const [idx, setIdx] = useState(daily);
  const [count, setCount] = useState(0);
  const text = AFFIRMATIONS[idx];

  const say = () => {
    const n = count + 1;
    setCount(n);
    chime(n >= 3 ? 'complete' : 'pat', true);
    if (n === 3) {
      logActivity({ type: 'affirmation', title: 'Affirmation ×3', energy: 5, stones: 3, events: ['affirmation'] });
      finishGoal();
    }
  };

  return (
    <Page back title="Affirmations" subtitle="Say it out loud, three times">
      <div className="text-center pt-4">
        <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={count >= 3 ? 'happy' : 'open'} flap={count >= 3} className="w-36 h-36 mx-auto" />
        <div className="rounded-[28px] bg-warm-soft p-6 mt-2 pop-in" key={idx}>
          <p className="text-2xl font-black leading-snug">“{text}”</p>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cx('w-4 h-4 rounded-full transition', i < count ? 'bg-warm scale-110' : 'bg-surface-3')} />
          ))}
        </div>
        {count < 3 ? (
          <Button block size="lg" variant="warm" className="mt-6" onClick={say}>
            I said it ({count}/3)
          </Button>
        ) : (
          <div className="mt-6">
            <p className="font-black text-lg">Beautiful. Let it sink in. 💛</p>
            <Button block className="mt-4" onClick={() => nav(-1)}>
              Done
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => {
            setIdx((idx + 1) % AFFIRMATIONS.length);
            setCount(0);
          }}
        >
          🔀 Different affirmation
        </Button>
      </div>
    </Page>
  );
}
