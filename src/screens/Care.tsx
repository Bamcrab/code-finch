import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useGame } from '../state/store';
import { Card, Page, SectionTitle } from '../ui/kit';

const TILES = [
  { to: '/care/breathe', emoji: '🌬️', label: 'Breathe', blurb: 'Guided breathing', color: '#cfe8f7' },
  { to: '/care/reflect', emoji: '📝', label: 'Reflect', blurb: 'Journal prompts', color: '#f9e3c8' },
  { to: '/care/sounds', emoji: '🎧', label: 'Soundscapes', blurb: 'Rain, waves, forest…', color: '#d8e8d0' },
  { to: '/care/timer', emoji: '⏱️', label: 'Focus timer', blurb: 'Focus or meditate', color: '#e6dff7' },
  { to: '/care/move', emoji: '🤸', label: 'Movement', blurb: 'Stretch & move', color: '#fbd9d2' },
  { to: '/care/emotion', emoji: '🫶', label: 'Name your emotion', blurb: 'Find the right word', color: '#f7d7e4' },
  { to: '/care/grounding', emoji: '🪨', label: 'Grounding', blurb: '5-4-3-2-1 & more', color: '#e3ddd0' },
  { to: '/care/affirmation', emoji: '💬', label: 'Affirmations', blurb: 'Kind words', color: '#fdf0c4' },
  { to: '/care/kindness', emoji: '💌', label: 'Kindness', blurb: 'Acts of kindness', color: '#f8d9e8' },
  { to: '/care/quiz', emoji: '📋', label: 'Quizzes', blurb: 'Check in with yourself', color: '#d6e4f5' },
];

export default function Care() {
  const nav = useNavigate();
  const activities = useGame((s) => s.activities);
  const recent = activities.slice(-5).reverse();
  return (
    <Page title="Self-care" subtitle="Every activity gives your birb energy">
      <Card onClick={() => nav('/care/firstaid')} className="flex items-center gap-3 bg-danger-soft">
        <span className="text-4xl">🩹</span>
        <div>
          <p className="font-black">First Aid Kit</p>
          <p className="text-sm text-muted">Feeling overwhelmed? Start here.</p>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {TILES.map((t) => (
          <button key={t.to} onClick={() => nav(t.to)} className="rounded-3xl p-4 text-left shadow-card active:scale-[0.97] transition dark:opacity-90" style={{ background: t.color }}>
            <span className="text-4xl block">{t.emoji}</span>
            <span className="font-black block mt-2 text-[#3a3530]">{t.label}</span>
            <span className="text-xs text-[#6b6158]">{t.blurb}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Card onClick={() => nav('/mood')} className="flex items-center gap-3">
          <span className="text-3xl">😊</span>
          <span className="font-black">Log mood</span>
        </Card>
        <Card onClick={() => nav('/journal')} className="flex items-center gap-3">
          <span className="text-3xl">📓</span>
          <span className="font-black">Journal</span>
        </Card>
      </div>
      {recent.length > 0 && (
        <>
          <SectionTitle>Recently</SectionTitle>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 h-12">
                <span className="font-bold truncate">{r.title}</span>
                <span className="text-xs text-muted shrink-0">{formatDistanceToNow(r.at, { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
