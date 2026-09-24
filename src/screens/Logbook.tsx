import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DISCOVERY_CATEGORIES } from '../data/discoveries';
import { LOCATION_MAP } from '../data/locations';
import { formatDay } from '../lib/date';
import { useGame } from '../state/store';
import type { Discovery } from '../state/types';
import { Button, Chip, Empty, Page, SectionTitle, Segmented, Sheet, cx } from '../ui/kit';

const OPINION = {
  love: { label: 'Loves', emoji: '💙⭐', cls: 'bg-sky-soft' },
  like: { label: 'Likes', emoji: '💙', cls: 'bg-sky-soft' },
  dislike: { label: 'Dislikes', emoji: '❤️‍🩹', cls: 'bg-danger-soft' },
  neutral: { label: 'Noticed', emoji: '📗', cls: 'bg-accent-soft' },
} as const;

export default function Logbook() {
  const nav = useNavigate();
  const discoveries = useGame((s) => s.discoveries);
  const birbName = useGame((s) => s.birb.name);
  const [view, setView] = useState<'likes' | 'dislikes' | 'all'>('likes');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState<Discovery | null>(null);

  const list = useMemo(
    () =>
      [...discoveries]
        .reverse()
        .filter((d) => (cat === 'all' || d.category === cat) && (view === 'all' || (view === 'likes' ? d.opinion === 'like' || d.opinion === 'love' : d.opinion === 'dislike'))),
    [discoveries, cat, view],
  );

  return (
    <Page back title="Logbook" subtitle={`Everything ${birbName} has discovered`}>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'likes', label: '💙 Likes' },
          { value: 'dislikes', label: '❤️‍🩹 Dislikes' },
          { value: 'all', label: '📗 All' },
        ]}
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mt-3 pb-1">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>
          All
        </Chip>
        {DISCOVERY_CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      <SectionTitle>
        {list.length} {list.length === 1 ? 'entry' : 'entries'}
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {list.map((d) => (
          <button key={d.id} onClick={() => setOpen(d)} className={cx('rounded-3xl p-2.5 text-center shadow-card active:scale-95 transition', OPINION[d.opinion].cls)}>
            <span className="text-4xl block">{d.emoji}</span>
            <span className="text-xs font-black block leading-tight mt-1 line-clamp-2">{d.name}</span>
            <span className="text-[10px]">{OPINION[d.opinion].emoji}</span>
          </button>
        ))}
      </div>
      {!list.length && <Empty emoji="🔎" title="Nothing here yet">After each adventure, {birbName} brings home a discovery.</Empty>}
      {open && (
        <Sheet open onClose={() => setOpen(null)} title={`${open.emoji} ${open.name}`}>
          <p className="text-lg">“{open.blurb}”</p>
          <p className="text-sm text-muted mt-2">
            {OPINION[open.opinion].emoji} {OPINION[open.opinion].label} · {LOCATION_MAP[open.locationId]?.emoji} {LOCATION_MAP[open.locationId]?.name} · {formatDay(open.day, 'MMM d, yyyy')}
          </p>
          {open.answered !== undefined && <p className="text-sm mt-3 rounded-2xl bg-surface p-3">You said: “{open.responses[open.answered]?.text}”</p>}
          <Button block className="mt-5" variant="soft" onClick={() => nav(open.reflectionId ? '/journal' : `/care/reflect/free?discovery=${open.id}`)}>
            {open.reflectionId ? '📓 See your reflection' : '📝 Reflect on it'}
          </Button>
        </Sheet>
      )}
    </Page>
  );
}
