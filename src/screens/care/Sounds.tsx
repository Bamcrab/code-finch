import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOUNDS } from '../../lib/soundscapes';
import { formatDuration } from '../../lib/date';
import { useGoalLink } from '../../lib/useGoalLink';
import { useNow } from '../../state/hooks';
import { useSound } from '../../state/sound';
import { Button, Chip, Page, SectionTitle, cx } from '../../ui/kit';

const TIMERS: [string, number | undefined][] = [
  ['∞', undefined],
  ['10m', 10],
  ['30m', 30],
  ['1h', 60],
  ['2h', 120],
  ['4h', 240],
  ['8h', 480],
];

export default function Sounds() {
  const { layers, master, endsAt, rewarded, toggle, setVolume, setMaster, setTimer, stop } = useSound();
  const { finishGoal, goalId } = useGoalLink();
  const now = useNow(1000);
  const playing = Object.keys(layers).length > 0;

  useEffect(() => {
    if (rewarded && goalId) finishGoal();
  }, [rewarded, goalId, finishGoal]);

  const timerMinutes = endsAt ? Math.round((endsAt - now) / 60_000) : undefined;

  return (
    <Page back title="Soundscapes" subtitle="Mix sounds to relax, focus, or sleep">
      <div className="grid grid-cols-3 gap-2">
        {SOUNDS.map((s) => {
          const on = layers[s.id] !== undefined;
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cx('rounded-3xl p-3 flex flex-col items-center gap-1 transition active:scale-95 border-2', on ? 'border-accent shadow-card' : 'border-transparent')}
              style={{ background: s.color + (on ? 'ee' : '55') }}
            >
              <span className={cx('text-3xl', on && 'float')}>{s.emoji}</span>
              <span className="text-xs font-extrabold text-[#2f2a25] text-center leading-tight">{s.name}</span>
            </button>
          );
        })}
      </div>

      {playing && (
        <>
          <SectionTitle>Mix</SectionTitle>
          <div className="rounded-3xl bg-surface shadow-card p-4 flex flex-col gap-3">
            {Object.entries(layers).map(([id, v]) => {
              const s = SOUNDS.find((x) => x.id === id);
              return (
                <label key={id} className="flex items-center gap-3">
                  <span className="text-xl w-7">{s?.emoji}</span>
                  <span className="text-sm font-bold w-28 truncate">{s?.name}</span>
                  <input type="range" min={0} max={1} step={0.01} value={v} onChange={(e) => setVolume(id, Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
                </label>
              );
            })}
            <label className="flex items-center gap-3 pt-2 border-t border-line">
              <span className="text-xl w-7">🔊</span>
              <span className="text-sm font-black w-28">Master</span>
              <input type="range" min={0} max={1} step={0.01} value={master} onChange={(e) => setMaster(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
            </label>
          </div>
        </>
      )}

      <SectionTitle>Sleep timer</SectionTitle>
      <div className="flex gap-2 flex-wrap">
        {TIMERS.map(([label, m]) => (
          <Chip key={label} active={m === undefined ? !endsAt : !!endsAt && timerMinutes !== undefined && Math.abs(timerMinutes - m) < 1} onClick={() => setTimer(m)}>
            {label}
          </Chip>
        ))}
      </div>
      {endsAt && <p className="text-sm text-muted mt-2 px-1">Fading out in {formatDuration(endsAt - now)}</p>}

      {playing ? (
        <Button block variant="outline" className="mt-6" onClick={stop}>
          ⏹ Stop all
        </Button>
      ) : (
        <p className="text-center text-muted mt-8">Tap a sound to start. Listen for 5 minutes to earn +5⚡.</p>
      )}
      {rewarded && <p className="text-center text-accent font-bold mt-3">✨ Reward earned for this session</p>}
    </Page>
  );
}

export function MiniPlayer() {
  const nav = useNavigate();
  const { layers, endsAt, stop } = useSound();
  const now = useNow(1000);
  const ids = Object.keys(layers);
  return (
    <div className="fixed bottom-[76px] inset-x-0 z-30 flex justify-center px-4 pointer-events-none safe-bottom">
      <div className="pointer-events-auto w-full max-w-xl flex items-center gap-2 rounded-full bg-surface shadow-card pl-4 pr-1.5 h-12 border border-line">
        <button className="flex-1 min-w-0 flex items-center gap-2 text-left" onClick={() => nav('/care/sounds')}>
          <span className="text-xl float">{SOUNDS.find((s) => s.id === ids[0])?.emoji}</span>
          <span className="text-sm font-extrabold truncate">{ids.map((id) => SOUNDS.find((s) => s.id === id)?.name).join(' + ')}</span>
          {endsAt && <span className="text-xs text-muted shrink-0">· {formatDuration(endsAt - now)}</span>}
        </button>
        <Button size="sm" variant="soft" onClick={stop} className="rounded-full">
          Stop
        </Button>
      </div>
    </div>
  );
}
