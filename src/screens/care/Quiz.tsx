import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QUIZZES, QUIZ_MAP, quizMax, scoreQuiz } from '../../data/quizzes';
import { formatDay } from '../../lib/date';
import { useGoalLink } from '../../lib/useGoalLink';
import { useGame } from '../../state/store';
import { Button, Card, Page, Progress, SectionTitle, cx } from '../../ui/kit';

export function HelplineCard() {
  return (
    <Card className="bg-danger-soft">
      <p className="font-black">💛 You don't have to go through this alone</p>
      <p className="text-sm mt-1">If you're thinking about hurting yourself, please reach out now. In the US, call or text <b>988</b> (Suicide & Crisis Lifeline). Elsewhere, find a free, confidential helpline near you:</p>
      <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="inline-block mt-3 font-black text-danger underline">
        findahelpline.com →
      </a>
    </Card>
  );
}

export function QuizList() {
  const nav = useNavigate();
  const results = useGame((s) => s.quizResults);
  return (
    <Page back title="Quizzes" subtitle="Check in with yourself. Not a diagnosis.">
      <div className="flex flex-col gap-2">
        {QUIZZES.map((q) => {
          const last = [...results].reverse().find((r) => r.quizId === q.id);
          return (
            <Card key={q.id} onClick={() => nav(`/care/quiz/${q.id}`)} className="flex items-center gap-3 p-3">
              <span className="w-12 h-12 rounded-2xl bg-sky-soft grid place-items-center text-2xl">{q.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="font-black block">{q.name}</span>
                <span className="text-xs text-muted block">{q.blurb}</span>
                {last && (
                  <span className="text-[11px] font-bold text-accent">
                    Last: {last.band} · {formatDay(last.day, 'MMM d')}
                  </span>
                )}
              </span>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

/** Keyed by the route param so switching ids starts a fresh session. */
export function QuizRun() {
  const { id = '' } = useParams();
  return <QuizRunInner key={id} id={id} />;
}

function QuizRunInner({ id }: { id: string }) {
  const nav = useNavigate();
  const quiz = QUIZ_MAP[id] ?? QUIZZES[0];
  const saveQuiz = useGame((s) => s.actions.saveQuiz);
  const allResults = useGame((s) => s.quizResults);
  const history = useMemo(() => allResults.filter((r) => r.quizId === quiz.id), [allResults, quiz.id]);
  const { finishGoal } = useGoalLink();
  const [answers, setAnswers] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof scoreQuiz> | null>(null);

  const answer = (v: number) => {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
    if (i + 1 < quiz.items.length) setI(i + 1);
    else {
      const res = scoreQuiz(quiz, next);
      setResult(res);
      saveQuiz({ quizId: quiz.id, answers: next, score: res.score, band: res.band.label, title: quiz.name });
      finishGoal();
    }
  };

  if (result) {
    const flagged = quiz.safetyItem !== undefined && (answers[quiz.safetyItem] ?? 0) > 0;
    const past = history.slice(-6);
    return (
      <Page back title={quiz.name}>
        {flagged && <HelplineCard />}
        <Card className="text-center mt-3">
          <p className="text-5xl">{quiz.emoji}</p>
          <p className="text-muted font-bold mt-2">Your result</p>
          <p className="text-3xl font-black">{result.band.label}</p>
          <p className="text-sm text-muted">
            Score {result.score} / {quizMax(quiz)}
          </p>
          <p className="mt-3">{result.band.text}</p>
        </Card>
        {past.length > 1 && (
          <>
            <SectionTitle>Over time</SectionTitle>
            <Card>
              <div className="flex items-end gap-2 h-28">
                {past.map((r) => (
                  <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-sky" style={{ height: `${Math.max(6, (r.score / quizMax(quiz)) * 90)}px` }} title={`${r.score}`} />
                    <span className="text-[10px] text-muted">{formatDay(r.day, 'M/d')}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
        <p className="text-xs text-muted mt-4 px-1">
          This is a self-check based on {quiz.source}. It's not a diagnosis. If you're struggling, a doctor or therapist can help.
        </p>
        <Button block className="mt-5" onClick={() => nav(-1)}>
          Done
        </Button>
      </Page>
    );
  }

  const item = quiz.items[i];
  return (
    <Page back title={quiz.name} subtitle={`${i + 1} of ${quiz.items.length}`}>
      <Progress value={i} max={quiz.items.length} className="h-2" />
      <p className="text-sm text-muted mt-5">{quiz.instructions}</p>
      <h2 className="text-2xl font-black mt-2 mb-6 leading-snug pop-in" key={i}>
        {item.text}
      </h2>
      <div className="flex flex-col gap-2">
        {quiz.options.map((o) => (
          <button key={o.value} onClick={() => answer(o.value)} className={cx('h-14 rounded-2xl bg-surface shadow-card font-bold text-left px-4 active:scale-[0.98] transition border-2', answers[i] === o.value ? 'border-accent' : 'border-transparent')}>
            {o.label}
          </button>
        ))}
      </div>
      {i > 0 && (
        <Button variant="ghost" className="mt-4" onClick={() => setI(i - 1)}>
          ← Previous
        </Button>
      )}
    </Page>
  );
}
