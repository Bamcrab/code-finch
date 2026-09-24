import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOODS, friendshipLevel } from '../game/constants';
import { formatDay } from '../lib/date';
import { useLatestMood, useStage, useStreak, useToday, useVisibleGoals } from '../state/hooks';
import { useGame } from '../state/store';
import { Button, StonesPill } from '../ui/kit';
import { IconMenu, IconPlus } from '../ui/icons';
import { EnergyCard } from './home/EnergyCard';
import { GoalList } from './home/GoalList';
import { HomeCards } from './home/HomeCards';
import { MenuSheet } from './home/MenuSheet';
import { ReturnDialog } from './home/ReturnDialog';
import { Scene } from './home/Scene';

export default function Home() {
  const nav = useNavigate();
  const today = useToday();
  const stones = useGame((s) => s.stones);
  const name = useGame((s) => s.birb.name);
  const points = useGame((s) => s.friendship.points);
  const streaksEnabled = useGame((s) => s.settings.streaksEnabled);
  const pending = useGame((s) => s.pendingReturns);
  const goals = useVisibleGoals(today);
  const mood = useLatestMood(today);
  const streak = useStreak();
  const stage = useStage();
  const [menu, setMenu] = useState(false);
  const [story, setStory] = useState(false);
  const moodInfo = mood ? MOODS[mood.mood - 1] : undefined;
  const level = friendshipLevel(points);

  return (
    <div className="min-h-full pb-28">
      <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur safe-top">
        <div className="mx-auto max-w-xl flex items-center gap-2 px-4 h-14">
          <button aria-label="Menu" onClick={() => setMenu(true)} className="-ml-2 w-10 h-10 grid place-items-center rounded-full hover:bg-surface-2">
            <IconMenu className="w-6 h-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-black leading-tight truncate">{name}</p>
            <p className="text-xs text-muted -mt-0.5 truncate">
              {stage.label} · {level ? `${level.heart} ${level.name}` : '🤍 New friends'} · {formatDay(today)}
            </p>
          </div>
          {streaksEnabled && (
            <button onClick={() => nav('/history')} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 h-8 text-sm font-extrabold shadow-card">
              🔥 {streak.current}
            </button>
          )}
          <button onClick={() => nav('/shop')}>
            <StonesPill amount={stones} />
          </button>
          <button aria-label="Log mood" onClick={() => nav('/mood')} className="w-9 h-9 rounded-full bg-surface shadow-card text-xl grid place-items-center">
            {moodInfo?.emoji ?? '🙂'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4">
        <Scene hasStory={pending.length > 0} onBirbTap={() => setStory(true)} />
        <div className="mt-3">
          <EnergyCard />
        </div>
        <HomeCards />
        <GoalList goals={goals} day={today} />
        <Button variant="soft" block className="mt-4" onClick={() => nav('/goals/new')}>
          <IconPlus /> Add a goal
        </Button>
      </main>

      <MenuSheet open={menu} onClose={() => setMenu(false)} />
      {story && pending[0] && <ReturnDialog key={pending[0].id} ret={pending[0]} onClose={() => setStory(false)} />}
    </div>
  );
}
