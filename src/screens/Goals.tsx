import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WEEKLY_TIERS } from '../game/constants';
import { weeklyAreaDays } from '../game/quests';
import { describeSchedule } from '../game/schedule';
import { useToday } from '../state/hooks';
import { useGame } from '../state/store';
import type { Area, Goal } from '../state/types';
import { Button, Card, Chip, Confirm, EmojiPicker, Empty, Field, Page, SectionTitle, Segmented, Sheet, cx, inputClass } from '../ui/kit';
import { IconChevron, IconPlus } from '../ui/icons';

const AREA_COLORS = ['#9cc9a8', '#f2a7bf', '#f5cf6b', '#8fc6e8', '#9fd8d2', '#f4a48a', '#b5d98a', '#b3a6e6', '#f7d488', '#8ea2d8', '#e8b98f', '#c9b79c'];

function GoalItem({ g }: { g: Goal }) {
  const nav = useNavigate();
  const a = useGame((s) => s.actions);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5">
      <button className="flex flex-1 min-w-0 items-center gap-3 text-left" onClick={() => nav(`/goals/${g.id}`)}>
        <span className="text-2xl">{g.emoji}</span>
        <span className="min-w-0">
          <span className="font-bold block truncate">{g.title}</span>
          <span className="text-xs text-muted">
            {g.kind === 'upkeep' ? '🧰 ' : ''}
            {describeSchedule(g.schedule)}
            {g.timesPerDay > 1 && ` · ${g.timesPerDay}×/day`} · done {g.totalDone}×
          </span>
        </span>
      </button>
      {g.status !== 'active' ? (
        <Button size="sm" variant="soft" onClick={() => a.setGoalStatus(g.id, 'active')}>
          Restore
        </Button>
      ) : (
        <IconChevron className="w-5 h-5 text-muted" />
      )}
    </div>
  );
}

function AreaEditor({ area, onClose }: { area: Area | 'new'; onClose: () => void }) {
  const a = useGame((s) => s.actions);
  const isNew = area === 'new';
  const [name, setName] = useState(isNew ? '' : area.name);
  const [emoji, setEmoji] = useState(isNew ? '🌟' : area.emoji);
  const [color, setColor] = useState(isNew ? AREA_COLORS[0] : area.color);
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet open onClose={onClose} title={isNew ? 'New self-care area' : 'Edit area'}>
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Creativity" />
      </Field>
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {AREA_COLORS.map((c) => (
            <button key={c} aria-label={c} onClick={() => setColor(c)} className={cx('w-9 h-9 rounded-full border-4', color === c ? 'border-ink/40' : 'border-transparent')} style={{ background: c }} />
          ))}
        </div>
      </Field>
      <Field label="Emoji">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>
      <Button
        block
        size="lg"
        disabled={!name.trim()}
        onClick={() => {
          if (isNew) a.addArea({ name: name.trim(), emoji, color });
          else a.updateArea(area.id, { name: name.trim(), emoji, color });
          onClose();
        }}
      >
        Save
      </Button>
      {!isNew && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" onClick={() => { a.updateArea(area.id, { status: area.status === 'active' ? 'paused' : 'active' }); onClose(); }}>
            {area.status === 'active' ? '⏸️ Pause area' : '▶️ Resume area'}
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            🗑️ Delete
          </Button>
        </div>
      )}
      {!isNew && (
        <Confirm
          open={confirm}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            a.deleteArea(area.id);
            onClose();
          }}
          title={`Delete ${area.name}?`}
          body="Goals in this area stay, but won't belong to an area anymore."
          confirmLabel="Delete"
          danger
        />
      )}
    </Sheet>
  );
}

export default function Goals() {
  const nav = useNavigate();
  const today = useToday();
  const goals = useGame((s) => s.goals);
  const areas = useGame((s) => s.areas);
  const state = useGame();
  const [tab, setTab] = useState<'goals' | 'areas'>('goals');
  const [status, setStatus] = useState<Goal['status']>('active');
  const [kind, setKind] = useState<'all' | 'goal' | 'upkeep'>('all');
  const [editing, setEditing] = useState<Area | 'new' | null>(null);
  const week = useMemo(() => weeklyAreaDays(state, today), [state, today]);

  const filtered = goals.filter((g) => g.status === status && (kind === 'all' || g.kind === kind));
  const byArea = [...areas.map((ar) => ({ key: ar.id, label: `${ar.emoji} ${ar.name}`, list: filtered.filter((g) => g.areaId === ar.id) })), { key: 'none', label: '✨ No area', list: filtered.filter((g) => !g.areaId || !areas.some((ar) => ar.id === g.areaId)) }].filter((x) => x.list.length);

  return (
    <Page
      back
      title="My goals"
      right={
        <Button size="sm" onClick={() => (tab === 'goals' ? nav('/goals/new') : setEditing('new'))}>
          <IconPlus className="w-4 h-4" /> New
        </Button>
      }
    >
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'goals', label: '🎯 Goals' },
          { value: 'areas', label: '🧭 Self-care areas' },
        ]}
      />
      {tab === 'goals' ? (
        <>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {(['active', 'paused', 'archived'] as const).map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'active' ? 'Active' : s === 'paused' ? 'Paused' : 'Archived'} ({goals.filter((g) => g.status === s).length})
              </Chip>
            ))}
            <span className="w-px bg-line mx-1" />
            {(['all', 'goal', 'upkeep'] as const).map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                {k === 'all' ? 'All' : k === 'goal' ? 'Goals' : 'Upkeep'}
              </Chip>
            ))}
          </div>
          {byArea.map((grp) => (
            <div key={grp.key}>
              <SectionTitle>{grp.label}</SectionTitle>
              <div className="flex flex-col gap-2">
                {grp.list.map((g) => (
                  <GoalItem key={g.id} g={g} />
                ))}
              </div>
            </div>
          ))}
          {!filtered.length && <Empty emoji="🎯" title={`No ${status} goals`}>{status === 'active' ? 'Tap New to add one.' : ''}</Empty>}
        </>
      ) : (
        <>
          <p className="text-sm text-muted mt-3 px-1">
            Finish at least one goal in an area on {WEEKLY_TIERS.map((t) => t.days).join(', ')} different days each week to earn bonus stones on the Quests tab.
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {areas.map((ar) => {
              const n = goals.filter((g) => g.areaId === ar.id && g.status === 'active').length;
              const d = week[ar.id] ?? 0;
              return (
                <Card key={ar.id} className={cx('flex items-center gap-3 p-3', ar.status !== 'active' && 'opacity-60')}>
                  <span className="w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0" style={{ background: ar.color + '66' }}>
                    {ar.emoji}
                  </span>
                  <button className="flex-1 min-w-0 text-left" onClick={() => setEditing(ar)}>
                    <span className="font-black block">
                      {ar.name} {ar.status === 'paused' && <span className="text-xs text-muted">(paused)</span>}
                    </span>
                    <span className="text-xs text-muted">
                      {n} goal{n === 1 ? '' : 's'} · {d}/7 days this week{' '}
                      {WEEKLY_TIERS.map((t) => (d >= t.days ? '⭐' : '☆')).join('')}
                    </span>
                  </button>
                  <Button size="sm" variant="soft" onClick={() => nav(`/goals/new?area=${ar.id}`)}>
                    + Goal
                  </Button>
                </Card>
              );
            })}
          </div>
        </>
      )}
      {editing && <AreaEditor area={editing} onClose={() => setEditing(null)} />}
    </Page>
  );
}
