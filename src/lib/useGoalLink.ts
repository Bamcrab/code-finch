import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dayKey } from './date';
import { useGame } from '../state/store';

/**
 * Activities opened from a linked goal carry `?goal=<id>`. Calling `finishGoal()` when the
 * activity completes also ticks off that goal (once).
 */
export function useGoalLink() {
  const [params] = useSearchParams();
  const goalId = params.get('goal') ?? undefined;
  const goal = useGame((s) => (goalId ? s.goals.find((g) => g.id === goalId) : undefined));
  const finishGoal = useCallback(() => {
    if (!goalId) return;
    const s = useGame.getState();
    const g = s.goals.find((x) => x.id === goalId);
    if (!g) return;
    const today = dayKey(Date.now(), s.settings.dayStartHour);
    if ((s.days[today]?.goals[goalId]?.count ?? 0) < g.timesPerDay) s.actions.completeGoal(goalId);
  }, [goalId]);
  return { goalId, goal, finishGoal };
}
