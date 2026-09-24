import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PROMPT_MAP, REFLECTION_CATEGORIES, REFLECTION_PROMPTS, type ReflectionPrompt } from '../../data/reflections';
import { useGoalLink } from '../../lib/useGoalLink';
import { useGame } from '../../state/store';
import { Button, Card, Chip, Page, SectionTitle, cx, textareaClass } from '../../ui/kit';

export function ReflectList() {
  const nav = useNavigate();
  const [cat, setCat] = useState('all');
  const count = useGame((s) => s.reflections.length);
  const list = REFLECTION_PROMPTS.filter((p) => p.categories.length && (cat === 'all' || p.categories.includes(cat)));
  return (
    <Page back title="Reflect" right={<Button size="sm" variant="soft" onClick={() => nav('/journal')}>📓 {count}</Button>}>
      <Card onClick={() => nav('/care/reflect/free')} className="flex items-center gap-3 bg-warm-soft">
        <span className="text-4xl">✍️</span>
        <div>
          <p className="font-black">Free write</p>
          <p className="text-sm text-muted">Just you and a blank page. Use #tags to track people and things.</p>
        </div>
      </Card>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mt-4 pb-1">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>
          All
        </Chip>
        {REFLECTION_CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.emoji} {c.label}
          </Chip>
        ))}
      </div>
      <SectionTitle>Prompts</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {list.map((p) => (
          <button key={p.id} onClick={() => nav(`/care/reflect/${p.id}`)} className="rounded-3xl bg-surface shadow-card p-3.5 text-left active:scale-[0.98] transition">
            <span className="text-3xl">{p.emoji}</span>
            <span className="font-black block mt-1 leading-tight">{p.title}</span>
            <span className="text-xs text-muted">{p.blurb}</span>
          </button>
        ))}
      </div>
    </Page>
  );
}

/** Keyed by the route param so switching promptIds starts a fresh session. */
export function ReflectWrite() {
  const { promptId = '' } = useParams();
  return <ReflectWriteInner key={promptId} promptId={promptId} />;
}

function ReflectWriteInner({ promptId }: { promptId: string }) {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { goal, finishGoal } = useGoalLink();
  const discoveryId = params.get('discovery') ?? undefined;
  const pastDay = params.get('day') ?? undefined;
  const discovery = useGame((s) => (discoveryId ? s.discoveries.find((d) => d.id === discoveryId) : undefined));
  const birbName = useGame((s) => s.birb.name);
  const save = useGame((s) => s.actions.saveReflection);

  const prompt: ReflectionPrompt = useMemo(() => {
    const base = PROMPT_MAP[promptId] ?? PROMPT_MAP.free;
    if (discovery) {
      return {
        ...base,
        title: `${discovery.emoji} ${discovery.name}`,
        emoji: discovery.emoji,
        questions: [`${birbName} discovered ${discovery.name}. What do you think about it?`, 'Does it remind you of anything?'],
      };
    }
    if (goal && (promptId === 'goal-done' || promptId === 'skip')) {
      return { ...base, title: `${base.title}: ${goal.title}`, emoji: goal.emoji };
    }
    return base;
  }, [promptId, discovery, goal, birbName]);

  const [answers, setAnswers] = useState<string[]>(() => prompt.questions.map(() => ''));
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const text = answers.join('').trim();
  const multi = prompt.questions.length > 1;

  const submit = () => {
    save({
      promptId: prompt.id,
      title: prompt.title,
      emoji: prompt.emoji,
      answers: prompt.questions.map((q, i) => ({ question: q, text: answers[i] ?? '' })).filter((a) => a.text.trim()),
      discoveryId,
      goalId: goal?.id,
      day: pastDay,
    });
    if (goal && promptId !== 'goal-done' && promptId !== 'skip') finishGoal();
    setSaved(true);
  };

  if (saved) {
    return (
      <Page back title="Saved">
        <div className="text-center pt-10">
          <div className="text-6xl">📓</div>
          <h2 className="text-2xl font-black mt-3">Reflection saved</h2>
          <p className="text-muted mt-1">Thanks for taking the time to check in with yourself.</p>
          <div className="grid grid-cols-2 gap-2 mt-8">
            <Button variant="outline" onClick={() => nav('/journal')}>
              Open journal
            </Button>
            <Button onClick={() => nav(-1)}>Done</Button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back title={prompt.title} subtitle={pastDay ? `For ${pastDay}` : prompt.blurb}>
      {multi && (
        <div className="flex gap-1.5 mb-4">
          {prompt.questions.map((_, i) => (
            <div key={i} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-warm' : 'bg-surface-3')} />
          ))}
        </div>
      )}
      <div className="rounded-3xl bg-surface shadow-card p-4">
        <p className="text-lg font-black mb-3">
          <span className="mr-1.5">{prompt.emoji}</span>
          {prompt.questions[step]}
        </p>
        <textarea
          autoFocus
          className={cx(textareaClass, 'min-h-48 bg-surface-2 border-transparent text-base leading-relaxed')}
          placeholder="Write as much or as little as you like… #tags help you find patterns later."
          value={answers[step] ?? ''}
          onChange={(e) => setAnswers(answers.map((a, i) => (i === step ? e.target.value : a)))}
        />
        <p className="text-right text-xs text-muted mt-1">{(answers[step] ?? '').length} characters</p>
      </div>
      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < prompt.questions.length - 1 ? (
          <Button block onClick={() => setStep(step + 1)}>
            {answers[step]?.trim() ? 'Next' : 'Skip question'}
          </Button>
        ) : (
          <Button block onClick={submit} disabled={!text}>
            Save reflection {pastDay ? '' : '(+5⚡)'}
          </Button>
        )}
      </div>
    </Page>
  );
}
