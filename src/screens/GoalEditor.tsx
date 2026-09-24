import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AREA_DEFS, EASY_WINS, type GoalSuggestion } from '../data/areas';
import { BREATHING } from '../data/breathing';
import { GROUNDING } from '../data/grounding';
import { MOVEMENT_SETS } from '../data/movements';
import { QUIZZES } from '../data/quizzes';
import { REFLECTION_PROMPTS } from '../data/reflections';
import { INTERVAL_PRESETS, ROOMS, UPKEEP_TEMPLATES } from '../data/upkeep';
import { EFFORT_LABEL, BASE_GOAL_ENERGY, BASE_GOAL_STONES } from '../game/constants';
import { describeSchedule } from '../game/schedule';
import { shiftDay } from '../lib/date';
import { ACTIVITY_OPTIONS } from '../lib/links';
import { useToday } from '../state/hooks';
import { useGame } from '../state/store';
import type { ActivityLink, Effort, Goal, Schedule, TimeOfDay } from '../state/types';
import { Button, Chip, Confirm, EmojiPicker, Field, Page, Segmented, Sheet, Stepper, Toggle, cx, inputClass, textareaClass } from '../ui/kit';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type SType = Schedule['type'];
const TYPE_LABELS: { type: SType; label: string }[] = [
  { type: 'daily', label: 'Every day' },
  { type: 'weekdays', label: 'Days of week' },
  { type: 'timesPerWeek', label: 'X per week' },
  { type: 'everyNDays', label: 'Every N days' },
  { type: 'interval', label: 'After last done' },
  { type: 'monthly', label: 'Monthly' },
  { type: 'yearly', label: 'Yearly' },
  { type: 'once', label: 'One time' },
];

function defaultFor(type: SType, today: string): Schedule {
  switch (type) {
    case 'daily':
      return { type };
    case 'weekdays':
      return { type, days: [1, 2, 3, 4, 5] };
    case 'timesPerWeek':
      return { type, times: 3 };
    case 'everyNDays':
      return { type, n: 2, anchor: today };
    case 'interval':
      return { type, every: 1, unit: 'month' };
    case 'monthly':
      return { type, dayOfMonth: Number(today.slice(8, 10)) };
    case 'yearly':
      return { type, month: Number(today.slice(5, 7)), day: Number(today.slice(8, 10)) };
    case 'once':
      return { type };
  }
}

export function ScheduleEditor({ value, onChange }: { value: Schedule; onChange: (s: Schedule) => void }) {
  const today = useToday();
  return (
    <div className="rounded-3xl bg-surface p-3">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TYPE_LABELS.map((t) => (
          <Chip key={t.type} active={value.type === t.type} onClick={() => onChange(defaultFor(t.type, today))} className="h-8 text-xs">
            {t.label}
          </Chip>
        ))}
      </div>
      {value.type === 'weekdays' && (
        <div className="flex justify-between">
          {WEEKDAYS.map((d, i) => {
            const on = value.days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ ...value, days: on ? value.days.filter((x) => x !== i) : [...value.days, i].sort() })}
                className={cx('w-10 h-10 rounded-full font-black', on ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted')}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}
      {value.type === 'timesPerWeek' && (
        <div className="flex items-center justify-between">
          <span className="font-bold">Times per week</span>
          <Stepper value={value.times} min={1} max={7} onChange={(times) => onChange({ ...value, times })} />
        </div>
      )}
      {value.type === 'everyNDays' && (
        <div className="flex items-center justify-between">
          <span className="font-bold">Every</span>
          <Stepper value={value.n} min={1} max={365} suffix="d" onChange={(n) => onChange({ ...value, n })} />
        </div>
      )}
      {value.type === 'interval' && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Every</span>
            <Stepper value={value.every} min={1} max={60} onChange={(every) => onChange({ ...value, every })} />
            <select className="h-11 rounded-2xl bg-surface-2 px-3 font-bold" value={value.unit} onChange={(e) => onChange({ ...value, unit: e.target.value as 'day' })}>
              <option value="day">days</option>
              <option value="week">weeks</option>
              <option value="month">months</option>
              <option value="year">years</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {INTERVAL_PRESETS.map((p) => (
              <Chip key={p.label} className="h-7 text-xs" active={describeSchedule(p.schedule) === describeSchedule(value)} onClick={() => onChange(p.schedule)}>
                {p.label}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Comes due again after this long since you last did it—great for chores and maintenance.</p>
        </div>
      )}
      {value.type === 'monthly' && (
        <div className="flex items-center justify-between">
          <span className="font-bold">Day of month</span>
          <Stepper value={value.dayOfMonth} min={1} max={31} onChange={(dayOfMonth) => onChange({ ...value, dayOfMonth })} />
        </div>
      )}
      {value.type === 'yearly' && (
        <div className="flex items-center gap-2">
          <span className="font-bold">On</span>
          <input
            type="date"
            className="h-11 rounded-2xl bg-surface-2 px-3"
            value={`${today.slice(0, 4)}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`}
            onChange={(e) => {
              const [, m, d] = e.target.value.split('-').map(Number);
              if (m && d) onChange({ ...value, month: m, day: d });
            }}
          />
        </div>
      )}
      {value.type === 'once' && (
        <div className="flex items-center gap-2">
          <span className="font-bold">Starting</span>
          <input type="date" className="h-11 rounded-2xl bg-surface-2 px-3" value={value.date ?? today} onChange={(e) => onChange({ ...value, date: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function refOptions(type: ActivityLink['type']): { id: string; label: string }[] {
  switch (type) {
    case 'breathe':
      return BREATHING.map((b) => ({ id: b.id, label: `${b.emoji} ${b.name}` }));
    case 'reflection':
      return REFLECTION_PROMPTS.filter((p) => !['skip', 'goal-done'].includes(p.id)).map((p) => ({ id: p.id, label: `${p.emoji} ${p.title}` }));
    case 'movement':
      return MOVEMENT_SETS.map((m) => ({ id: m.id, label: `${m.emoji} ${m.name}` }));
    case 'grounding':
      return GROUNDING.map((g) => ({ id: g.id, label: `${g.emoji} ${g.name}` }));
    case 'quiz':
      return QUIZZES.map((q) => ({ id: q.id, label: `${q.emoji} ${q.name}` }));
    case 'timer':
      return ['5', '10', '15', '25', '45', '60'].map((m) => ({ id: m, label: `${m} minutes` }));
    default:
      return [];
  }
}

function SuggestionPicker({ kind, onPick, onClose }: { kind: 'goal' | 'upkeep'; onPick: (g: GoalSuggestion & { areaId?: string; room?: string; effort?: Effort }) => void; onClose: () => void }) {
  const [tab, setTab] = useState(kind === 'upkeep' ? ROOMS[0].id : 'easy');
  const tabs = kind === 'upkeep' ? ROOMS.map((r) => ({ id: r.id, label: `${r.emoji} ${r.name}` })) : [{ id: 'easy', label: '🌱 Easy wins' }, ...AREA_DEFS.map((a) => ({ id: a.id, label: `${a.emoji} ${a.name}` }))];
  const list: (GoalSuggestion & { areaId?: string; room?: string; effort?: Effort; tip?: string })[] =
    kind === 'upkeep'
      ? UPKEEP_TEMPLATES.filter((t) => t.room === tab).map((t) => ({ ...t, areaId: 'home' }))
      : tab === 'easy'
        ? EASY_WINS
        : (AREA_DEFS.find((a) => a.id === tab)?.suggestions ?? []).map((s) => ({ ...s, areaId: tab }));
  return (
    <Sheet open onClose={onClose} title={kind === 'upkeep' ? 'Upkeep ideas' : 'Goal ideas'}>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {tabs.map((t) => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {list.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              onPick(s);
              onClose();
            }}
            className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left active:scale-[0.99] transition"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="font-bold block">{s.title}</span>
              <span className="text-xs text-muted">{s.schedule ? describeSchedule(s.schedule) : 'Every day'}{s.tip ? ` · ${s.tip}` : ''}</span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export default function GoalEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const today = useToday();
  const existing = useGame((s) => s.goals.find((g) => g.id === id));
  const allAreas = useGame((s) => s.areas);
  const areas = useMemo(() => allAreas.filter((ar) => ar.status !== 'archived'), [allAreas]);
  const a = useGame((s) => s.actions);
  const initialKind = (existing?.kind ?? params.get('kind') ?? 'goal') as Goal['kind'];

  const [form, setForm] = useState<Partial<Goal>>(() =>
    existing
      ? { ...existing }
      : {
          title: '',
          emoji: initialKind === 'upkeep' ? '🧽' : '⭐',
          kind: initialKind,
          areaId: initialKind === 'upkeep' ? 'home' : (params.get('area') ?? undefined),
          room: params.get('room') ?? (initialKind === 'upkeep' ? 'kitchen' : undefined),
          schedule: initialKind === 'upkeep' ? { type: 'interval', every: 1, unit: 'month' } : { type: 'daily' },
          timeOfDay: 'anytime',
          timesPerDay: 1,
          effort: 1,
          showOnHome: true,
          lastDoneDay: undefined,
        },
  );
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [ideas, setIdeas] = useState(!existing && !params.get('blank'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<Goal>) => setForm((f) => ({ ...f, ...patch }));
  const isUpkeep = form.kind === 'upkeep';
  const refs = useMemo(() => (form.link ? refOptions(form.link.type) : []), [form.link]);

  const save = () => {
    if (!form.title?.trim()) return;
    if (existing) a.updateGoal(existing.id, form);
    else a.addGoal({ ...form, title: form.title } as Parameters<typeof a.addGoal>[0]);
    nav(-1);
  };

  const energy = BASE_GOAL_ENERGY * (form.effort ?? 1);
  const stones = BASE_GOAL_STONES * (form.effort ?? 1);

  return (
    <Page
      back
      title={existing ? (isUpkeep ? 'Edit task' : 'Edit goal') : isUpkeep ? 'New upkeep task' : 'New goal'}
      right={
        <Button size="sm" onClick={save} disabled={!form.title?.trim()}>
          Save
        </Button>
      }
    >
      {!existing && (
        <div className="flex gap-2 mb-4">
          <Segmented
            className="flex-1"
            value={form.kind ?? 'goal'}
            onChange={(k) =>
              set({
                kind: k,
                areaId: k === 'upkeep' ? 'home' : form.areaId,
                room: k === 'upkeep' ? (form.room ?? 'kitchen') : undefined,
                schedule: k === 'upkeep' ? { type: 'interval', every: 1, unit: 'month' } : { type: 'daily' },
              })
            }
            options={[
              { value: 'goal', label: '🎯 Goal' },
              { value: 'upkeep', label: '🧰 Upkeep task' },
            ]}
          />
          <Button variant="soft" onClick={() => setIdeas(true)}>
            💡 Ideas
          </Button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button type="button" aria-label="Pick emoji" onClick={() => setEmojiOpen(true)} className="w-14 h-14 shrink-0 rounded-2xl bg-surface border border-line text-3xl">
          {form.emoji}
        </button>
        <input className={cx(inputClass, 'h-14 text-lg font-bold')} placeholder={isUpkeep ? 'e.g. Replace furnace filter' : 'e.g. Drink water'} value={form.title} onChange={(e) => set({ title: e.target.value })} autoFocus={!existing} />
      </div>

      {isUpkeep && (
        <>
          <Field label="Room / area">
            <div className="flex flex-wrap gap-1.5">
              {ROOMS.map((r) => (
                <Chip key={r.id} active={form.room === r.id} color={r.color} onClick={() => set({ room: r.id })} className="h-8 text-xs">
                  {r.emoji} {r.name}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Last done" hint="So the first due date is right. Leave empty if you're not sure—it'll be due now.">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Chip active={!form.lastDoneDay} onClick={() => set({ lastDoneDay: undefined })} className="h-8 text-xs">
                Not sure
              </Chip>
              {[
                ['Today', 0],
                ['A week ago', 7],
                ['A month ago', 30],
                ['3 months ago', 91],
                ['6 months ago', 182],
              ].map(([l, n]) => (
                <Chip key={l as string} active={form.lastDoneDay === shiftDay(today, -(n as number))} onClick={() => set({ lastDoneDay: shiftDay(today, -(n as number)) })} className="h-8 text-xs">
                  {l}
                </Chip>
              ))}
              <input type="date" max={today} className="h-8 rounded-full bg-surface border border-line px-3 text-xs" value={form.lastDoneDay ?? ''} onChange={(e) => set({ lastDoneDay: e.target.value || undefined })} />
            </div>
          </Field>
        </>
      )}

      <Field label="Repeat">
        <ScheduleEditor value={form.schedule ?? { type: 'daily' }} onChange={(schedule) => set({ schedule })} />
      </Field>

      {!isUpkeep && (
        <Field label="Time of day">
          <Segmented<TimeOfDay>
            value={form.timeOfDay ?? 'anytime'}
            onChange={(timeOfDay) => set({ timeOfDay })}
            options={[
              { value: 'morning', label: '🌅' },
              { value: 'afternoon', label: '☀️' },
              { value: 'evening', label: '🌙' },
              { value: 'anytime', label: 'Any' },
            ]}
          />
        </Field>
      )}

      <Field label="Self-care area">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!form.areaId} onClick={() => set({ areaId: undefined })} className="h-8 text-xs">
            None
          </Chip>
          {areas.map((ar) => (
            <Chip key={ar.id} active={form.areaId === ar.id} color={ar.color} onClick={() => set({ areaId: ar.id })} className="h-8 text-xs">
              {ar.emoji} {ar.name}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-1 rounded-3xl bg-surface p-4 mb-4">
        <div className="flex items-center justify-between py-1">
          <span>
            <span className="font-bold block">Times per day</span>
            <span className="text-xs text-muted">Each tap earns rewards</span>
          </span>
          <Stepper value={form.timesPerDay ?? 1} min={1} max={100} onChange={(timesPerDay) => set({ timesPerDay })} />
        </div>
        <div className="py-2">
          <span className="font-bold block mb-2">Effort</span>
          <Segmented<Effort>
            value={form.effort ?? 1}
            onChange={(effort) => set({ effort })}
            options={([1, 2, 3] as Effort[]).map((e) => ({ value: e, label: EFFORT_LABEL[e] }))}
          />
          <span className="text-xs text-muted block mt-1.5">
            Worth ⚡{energy} energy and 💎{stones} stones each time.
          </span>
        </div>
        {isUpkeep && <Toggle checked={form.showOnHome ?? true} onChange={(showOnHome) => set({ showOnHome })} label="Show on Home when due" />}
        <Toggle checked={!!form.reminder} onChange={(on) => set({ reminder: on ? '09:00' : undefined })} label="Reminder" hint="While the app is open" />
        {form.reminder && <input type="time" className="h-11 rounded-2xl bg-surface-2 px-3 w-40" value={form.reminder} onChange={(e) => set({ reminder: e.target.value })} />}
      </div>

      <Field label="Link an activity" hint="Tapping the goal opens this activity, and finishing it completes the goal.">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!form.link} onClick={() => set({ link: undefined })} className="h-8 text-xs">
            None
          </Chip>
          {ACTIVITY_OPTIONS.map((o) => (
            <Chip key={o.type} active={form.link?.type === o.type} onClick={() => set({ link: { type: o.type, refId: refOptions(o.type)[0]?.id } })} className="h-8 text-xs">
              {o.emoji} {o.label}
            </Chip>
          ))}
        </div>
        {refs.length > 0 && form.link && (
          <select className={cx(inputClass, 'mt-2')} value={form.link.refId ?? ''} onChange={(e) => set({ link: { ...form.link!, refId: e.target.value } })}>
            {refs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Notes">
        <textarea className={textareaClass} rows={3} placeholder={isUpkeep ? 'Filter size, model number, supplies…' : 'Anything to remember'} value={form.notes ?? ''} onChange={(e) => set({ notes: e.target.value })} />
      </Field>

      <Button block size="lg" onClick={save} disabled={!form.title?.trim()}>
        {existing ? 'Save changes' : isUpkeep ? 'Add task' : 'Add goal'}
      </Button>

      {existing && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {existing.status === 'active' ? (
            <Button variant="outline" onClick={() => { a.setGoalStatus(existing.id, 'paused'); nav(-1); }}>
              ⏸️ Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { a.setGoalStatus(existing.id, 'active'); nav(-1); }}>
              ▶️ Resume
            </Button>
          )}
          <Button variant="outline" onClick={() => { a.setGoalStatus(existing.id, 'archived'); nav(-1); }}>
            📦 Archive
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            🗑️ Delete
          </Button>
        </div>
      )}

      <Sheet open={emojiOpen} onClose={() => setEmojiOpen(false)} title="Pick an emoji">
        <EmojiPicker
          value={form.emoji ?? '⭐'}
          onChange={(emoji) => {
            set({ emoji });
            setEmojiOpen(false);
          }}
        />
      </Sheet>
      {ideas && (
        <SuggestionPicker
          kind={form.kind ?? 'goal'}
          onClose={() => setIdeas(false)}
          onPick={(s) =>
            set({
              title: s.title,
              emoji: s.emoji,
              areaId: s.areaId ?? form.areaId,
              room: s.room ?? form.room,
              effort: s.effort ?? form.effort,
              timeOfDay: s.timeOfDay ?? 'anytime',
              schedule: s.schedule?.type === 'everyNDays' ? { ...s.schedule, anchor: today } : (s.schedule ?? form.schedule),
              link: s.link,
              timesPerDay: s.timesPerDay ?? 1,
            })
          }
        />
      )}
      <Confirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (existing) a.deleteGoal(existing.id);
          nav(-1);
        }}
        title="Delete permanently?"
        body="Archive keeps your progress; delete removes the goal."
        confirmLabel="Delete"
        danger
      />
    </Page>
  );
}
