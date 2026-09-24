import type { ActivityLink } from '../state/types';

export const ACTIVITY_OPTIONS: { type: ActivityLink['type']; label: string; emoji: string }[] = [
  { type: 'breathe', label: 'Breathing exercise', emoji: '🌬️' },
  { type: 'reflection', label: 'Reflection', emoji: '📝' },
  { type: 'mood', label: 'Mood check-in', emoji: '😊' },
  { type: 'emotion', label: 'Name your emotion', emoji: '🫶' },
  { type: 'movement', label: 'Movement', emoji: '🤸' },
  { type: 'soundscape', label: 'Soundscape', emoji: '🎧' },
  { type: 'timer', label: 'Focus timer', emoji: '⏱️' },
  { type: 'grounding', label: 'Grounding', emoji: '🪨' },
  { type: 'affirmation', label: 'Affirmation', emoji: '💬' },
  { type: 'kindness', label: 'Act of kindness', emoji: '💌' },
  { type: 'quiz', label: 'Quiz', emoji: '📋' },
];

export function activityRoute(link: ActivityLink, goalId?: string): string {
  const q = goalId ? `?goal=${goalId}` : '';
  switch (link.type) {
    case 'breathe':
      return `/care/breathe/${link.refId ?? 'calm'}${q}`;
    case 'reflection':
      return `/care/reflect/${link.refId ?? 'free'}${q}`;
    case 'soundscape':
      return `/care/sounds${q}`;
    case 'timer':
      return `/care/timer${q}${link.refId ? `${q ? '&' : '?'}min=${link.refId}` : ''}`;
    case 'movement':
      return `/care/move/${link.refId ?? 'wake-up'}${q}`;
    case 'quiz':
      return link.refId ? `/care/quiz/${link.refId}${q}` : `/care/quiz${q}`;
    case 'grounding':
      return `/care/grounding/${link.refId ?? '54321'}${q}`;
    case 'emotion':
      return `/care/emotion${q}`;
    case 'affirmation':
      return `/care/affirmation${q}`;
    case 'kindness':
      return `/care/kindness${q}`;
    case 'mood':
      return `/mood${q}`;
  }
}
