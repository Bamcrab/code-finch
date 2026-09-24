import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { setSoundEnabled } from './lib/audio';
import { useReminders } from './lib/reminders';
import { useGame } from './state/store';
import { useSound } from './state/sound';
import { cx } from './ui/kit';
import { Celebrations, Toasts } from './ui/overlays';
import { MiniPlayer } from './screens/care/Sounds';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Upkeep from './screens/Upkeep';
import GoalEditor from './screens/GoalEditor';
import Goals from './screens/Goals';
import Care from './screens/Care';
import { BreatheList, BreatheSession } from './screens/care/Breathe';
import { ReflectList, ReflectWrite } from './screens/care/Reflect';
import Journal from './screens/Journal';
import Sounds from './screens/care/Sounds';
import Timer from './screens/care/Timer';
import { MoveList, MoveSession } from './screens/care/Move';
import { QuizList, QuizRun } from './screens/care/Quiz';
import { GroundingList, GroundingRun } from './screens/care/Grounding';
import Emotion from './screens/care/Emotion';
import Affirmation from './screens/care/Affirmation';
import Kindness from './screens/care/Kindness';
import FirstAid from './screens/care/FirstAid';
import Mood from './screens/Mood';
import Quests from './screens/Quests';
import Shop from './screens/Shop';
import BirbProfile from './screens/BirbProfile';
import Wardrobe from './screens/Wardrobe';
import Room from './screens/Room';
import Pets from './screens/Pets';
import Logbook from './screens/Logbook';
import Places from './screens/Places';
import Insights from './screens/Insights';
import History from './screens/History';
import Challenges, { ChallengeDetail } from './screens/Challenges';
import Settings from './screens/Settings';

const TABS = [
  { to: '/', label: 'Home', emoji: '🏡', end: true },
  { to: '/upkeep', label: 'Upkeep', emoji: '🧰' },
  { to: '/care', label: 'Self-care', emoji: '🌿' },
  { to: '/quests', label: 'Quests', emoji: '📜' },
  { to: '/shop', label: 'Shop', emoji: '🛍️' },
  { to: '/birb', label: 'Birb', emoji: '🐤' },
];

function TabBar() {
  const { pathname } = useLocation();
  const hidden = /^\/care\/(breathe|move|quiz|grounding)\/./.test(pathname);
  if (hidden) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line safe-bottom">
      <div className="mx-auto max-w-xl grid grid-cols-6">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cx('flex flex-col items-center justify-center h-16 gap-0.5 text-[11px] font-extrabold transition', isActive ? 'text-accent' : 'text-muted')
            }
          >
            {({ isActive }) => (
              <>
                <span className={cx('text-2xl leading-none transition', isActive ? 'scale-110' : 'grayscale-[40%] opacity-80')}>{t.emoji}</span>
                {t.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function useTheme() {
  const theme = useGame((s) => s.settings.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1d1b21' : '#fbf6ee');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

function useTicker(enabled: boolean) {
  const tick = useGame((s) => s.actions.tick);
  useEffect(() => {
    if (!enabled) return;
    tick();
    const t = setInterval(tick, 20_000);
    const onVis = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [tick, enabled]);
}

function useHydrated() {
  const [ok, setOk] = useState(() => useGame.persist.hasHydrated());
  useEffect(() => {
    if (ok) return;
    const unsub = useGame.persist.onFinishHydration(() => setOk(true));
    // Hydration may have finished between render and this effect; don't wait for an event that already fired.
    if (useGame.persist.hasHydrated()) setOk(true);
    // Ask the browser not to evict our IndexedDB data.
    void navigator.storage?.persist?.();
    return unsub;
  }, [ok]);
  return ok;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const hydrated = useHydrated();
  const onboarded = useGame((s) => s.onboarded);
  const sound = useGame((s) => s.settings.sound);
  const playing = useSound((s) => Object.keys(s.layers).length > 0);
  useTheme();
  useTicker(hydrated);
  useReminders();
  useEffect(() => {
    setSoundEnabled(sound);
  }, [sound]);

  if (!hydrated) {
    return <div className="h-full grid place-items-center text-5xl animate-pulse">🥚</div>;
  }
  if (!onboarded) return <Onboarding />;

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upkeep" element={<Upkeep />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/goals/new" element={<GoalEditor />} />
        <Route path="/goals/:id" element={<GoalEditor />} />
        <Route path="/care" element={<Care />} />
        <Route path="/care/breathe" element={<BreatheList />} />
        <Route path="/care/breathe/:id" element={<BreatheSession />} />
        <Route path="/care/reflect" element={<ReflectList />} />
        <Route path="/care/reflect/:promptId" element={<ReflectWrite />} />
        <Route path="/care/sounds" element={<Sounds />} />
        <Route path="/care/timer" element={<Timer />} />
        <Route path="/care/move" element={<MoveList />} />
        <Route path="/care/move/:id" element={<MoveSession />} />
        <Route path="/care/quiz" element={<QuizList />} />
        <Route path="/care/quiz/:id" element={<QuizRun />} />
        <Route path="/care/grounding" element={<GroundingList />} />
        <Route path="/care/grounding/:id" element={<GroundingRun />} />
        <Route path="/care/emotion" element={<Emotion />} />
        <Route path="/care/affirmation" element={<Affirmation />} />
        <Route path="/care/kindness" element={<Kindness />} />
        <Route path="/care/firstaid" element={<FirstAid />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:tab" element={<Shop />} />
        <Route path="/birb" element={<BirbProfile />} />
        <Route path="/birb/wardrobe" element={<Wardrobe />} />
        <Route path="/birb/room" element={<Room />} />
        <Route path="/birb/pets" element={<Pets />} />
        <Route path="/birb/logbook" element={<Logbook />} />
        <Route path="/birb/places" element={<Places />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:day" element={<History />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {playing && <MiniPlayer />}
      <TabBar />
      <Toasts />
      <Celebrations />
    </>
  );
}
