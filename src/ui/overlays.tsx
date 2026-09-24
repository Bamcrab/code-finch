import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bolt, Gem } from '../art/misc';
import { chime } from '../lib/audio';
import { useUi, type UiNotice } from '../state/ui';
import { Button } from './kit';

function Toast({ n }: { n: UiNotice }) {
  const dismiss = useUi((s) => s.dismiss);
  useEffect(() => {
    const t = setTimeout(() => dismiss(n.id), n.kind === 'reward' ? 2600 : 3200);
    return () => clearTimeout(t);
  }, [n.id, n.kind, dismiss]);
  if (n.kind === 'reward') {
    return (
      <button onClick={() => dismiss(n.id)} className="toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-surface shadow-card px-4 h-11 max-w-[92vw]">
        {n.energy > 0 && (
          <span className="flex items-center gap-0.5 font-black text-[#c98a0e]">
            <Bolt className="w-4 h-4" />+{n.energy}
          </span>
        )}
        {n.stones > 0 && (
          <span className="flex items-center gap-0.5 font-black text-[#7a6aa8]">
            <Gem className="w-4 h-4" />+{n.stones}
          </span>
        )}
        {n.label && <span className="text-sm font-bold text-muted truncate">{n.label}</span>}
      </button>
    );
  }
  if (n.kind === 'info') {
    return (
      <button onClick={() => dismiss(n.id)} className="toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-surface shadow-card px-4 h-11 max-w-[92vw]">
        {n.emoji && <span className="text-lg">{n.emoji}</span>}
        <span className="text-sm font-bold truncate">{n.text}</span>
      </button>
    );
  }
  return null;
}

export function Toasts() {
  const notices = useUi((s) => s.notices);
  const last = notices[notices.length - 1];
  useEffect(() => {
    if (!last) return;
    if (last.kind === 'reward') chime(last.energy > 0 ? 'complete' : 'coin');
  }, [last?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return createPortal(
    <div className="fixed top-2 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none safe-top">
      {notices.map((n) => (
        <Toast key={n.id} n={n} />
      ))}
    </div>,
    document.body,
  );
}

const CONFETTI = ['#f29bb5', '#f7d95c', '#8fd19e', '#8cc8ec', '#b7a1e3', '#f5a04e'];

export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: CONFETTI[i % CONFETTI.length],
        rot: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[70]">
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

export function Celebrations() {
  const cels = useUi((s) => s.celebrations);
  const dismiss = useUi((s) => s.dismissCelebration);
  const nav = useNavigate();
  const n = cels[0];
  useEffect(() => {
    if (n?.kind === 'celebrate') chime(n.emoji === '🥚' ? 'hatch' : 'adventure');
  }, [n?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!n) return null;
  if (n.kind === 'reflect') {
    return createPortal(
      <div className="fixed inset-x-0 bottom-24 z-[65] flex justify-center px-4 pointer-events-none">
        <div className="pop-in pointer-events-auto w-full max-w-md rounded-3xl bg-surface shadow-card p-4 flex items-center gap-3">
          <span className="text-3xl">{n.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black truncate">Nice work: {n.title}!</p>
            <p className="text-sm text-muted">Take a moment to savor it?</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => dismiss(n.id)}>
            Later
          </Button>
          <Button
            size="sm"
            onClick={() => {
              dismiss(n.id);
              nav(`/care/reflect/goal-done?goal=${n.goalId}`);
            }}
          >
            Reflect
          </Button>
        </div>
      </div>,
      document.body,
    );
  }
  if (n.kind !== 'celebrate') return null;
  return createPortal(
    <div className="fixed inset-0 z-[65] grid place-items-center p-6">
      <div className="absolute inset-0 bg-black/40 fade-in" onClick={() => dismiss(n.id)} />
      <Confetti />
      <div className="pop-in relative w-full max-w-sm rounded-[32px] bg-bg p-6 text-center shadow-card">
        <div className="text-6xl mb-3">{n.emoji}</div>
        <h2 className="text-2xl font-black leading-tight">{n.title}</h2>
        {n.body && <p className="text-muted mt-2">{n.body}</p>}
        <Button className="mt-6" block size="lg" onClick={() => dismiss(n.id)}>
          Yay!
        </Button>
      </div>
    </div>,
    document.body,
  );
}
