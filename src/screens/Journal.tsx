import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tagCategory } from '../game/text';
import { formatDay } from '../lib/date';
import { useGame } from '../state/store';
import type { Reflection } from '../state/types';
import { Button, Chip, Confirm, Empty, Page, SectionTitle, Sheet, cx, inputClass, textareaClass } from '../ui/kit';
import { IconSearch } from '../ui/icons';

const TAG_COLORS = { people: '#8fb3e6', activity: '#f29bb5', emotion: '#f5a04e', other: '#b7a1e3' } as const;

function sentimentEmoji(s: number) {
  if (s > 0.3) return '🌞';
  if (s < -0.3) return '🌧️';
  return '⛅';
}

function ReflectionSheet({ r, onClose }: { r: Reflection; onClose: () => void }) {
  const a = useGame((s) => s.actions);
  const [editing, setEditing] = useState(false);
  const [answers, setAnswers] = useState(r.answers.map((x) => x.text));
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet open onClose={onClose} title={<span>{r.emoji} {r.title}</span>}>
      <p className="text-xs text-muted -mt-2 mb-4">{formatDay(r.day, 'EEEE, MMMM d, yyyy')}</p>
      <div className="flex flex-col gap-4">
        {r.answers.map((ans, i) => (
          <div key={i}>
            <p className="text-sm font-black text-muted mb-1">{ans.question}</p>
            {editing ? (
              <textarea className={cx(textareaClass, 'min-h-28')} value={answers[i]} onChange={(e) => setAnswers(answers.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{ans.text}</p>
            )}
          </div>
        ))}
      </div>
      {r.tags.length > 0 && !editing && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {r.tags.map((t) => (
            <span key={t} className="rounded-full px-2.5 h-7 inline-flex items-center text-xs font-bold text-[#2f2a25]" style={{ background: TAG_COLORS[tagCategory(t)] + '88' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mt-6">
        {editing ? (
          <>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                a.updateReflection(
                  r.id,
                  r.answers.map((x, i) => ({ question: x.question, text: answers[i] })),
                );
                setEditing(false);
                onClose();
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              ✏️ Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              🗑️ Delete
            </Button>
          </>
        )}
      </div>
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          a.deleteReflection(r.id);
          onClose();
        }}
        title="Delete this reflection?"
        confirmLabel="Delete"
        danger
      />
    </Sheet>
  );
}

export default function Journal() {
  const nav = useNavigate();
  const reflections = useGame((s) => s.reflections);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<Reflection | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reflections) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [reflections]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // Newest day first; reflections can be written for past days, so don't rely on insertion order.
    return [...reflections]
      .sort((a, b) => (a.day === b.day ? b.at - a.at : a.day < b.day ? 1 : -1))
      .filter((r) => (!tag || r.tags.includes(tag)) && (!needle || r.title.toLowerCase().includes(needle) || r.answers.some((a) => a.text.toLowerCase().includes(needle))));
  }, [reflections, q, tag]);

  const byMonth = useMemo(() => {
    const out: { month: string; items: Reflection[] }[] = [];
    for (const r of list) {
      const m = formatDay(r.day, 'MMMM yyyy');
      const last = out[out.length - 1];
      if (last?.month === m) last.items.push(r);
      else out.push({ month: m, items: [r] });
    }
    return out;
  }, [list]);

  return (
    <Page back title="Journal" subtitle={`${reflections.length} reflections`} right={<Button size="sm" onClick={() => nav('/care/reflect')}>+ Write</Button>}>
      <div className="relative">
        <IconSearch className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input className={cx(inputClass, 'pl-11')} placeholder="Search your reflections" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {tags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mt-3 pb-1">
          {tags.map(([t, n]) => (
            <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} className="h-8 text-xs">
              #{t} <span className="opacity-60">{n}</span>
            </Chip>
          ))}
        </div>
      )}
      {byMonth.map((g) => (
        <div key={g.month}>
          <SectionTitle>{g.month}</SectionTitle>
          <div className="flex flex-col gap-2">
            {g.items.map((r) => (
              <button key={r.id} onClick={() => setOpen(r)} className="rounded-3xl bg-surface shadow-card p-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{r.emoji}</span>
                  <span className="font-black flex-1 truncate">{r.title}</span>
                  <span title="Tone">{sentimentEmoji(r.sentiment)}</span>
                </div>
                <p className="text-sm text-muted line-clamp-2 mt-1">{r.answers.map((a) => a.text).join(' · ')}</p>
                <p className="text-[11px] font-bold text-muted mt-1.5">{formatDay(r.day, 'EEE, MMM d')}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
      {!list.length && <Empty emoji="📓" title={reflections.length ? 'No matches' : 'Your journal is empty'}>{!reflections.length && 'Reflections you write will live here, just for you.'}</Empty>}
      {open && <ReflectionSheet r={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}
