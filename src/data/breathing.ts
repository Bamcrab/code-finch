export type BreathPhase = 'in' | 'hold' | 'out' | 'rest' | 'in2';

export interface BreathStep {
  phase: BreathPhase;
  seconds: number;
}

export interface BreathingPattern {
  id: string;
  name: string;
  emoji: string;
  categories: string[];
  blurb: string;
  steps: BreathStep[];
}

const s = (phase: BreathPhase, seconds: number): BreathStep => ({ phase, seconds });

export const BREATH_CATEGORIES = ['Focus', 'Calm', 'Morning', 'Night', 'Energize', 'SOS'];

export const BREATHING: BreathingPattern[] = [
  { id: 'focus', name: 'Focus Breathing', emoji: '🎯', categories: ['Focus'], blurb: 'Box breathing: four equal sides to steady your mind.', steps: [s('in', 4), s('hold', 4), s('out', 4), s('rest', 4)] },
  { id: 'calm', name: 'Calm Breathing', emoji: '🌿', categories: ['Calm', 'Morning'], blurb: 'A slightly longer exhale to relax your body.', steps: [s('in', 4), s('out', 6)] },
  { id: 'anxiety', name: 'Anxiety Breathing', emoji: '🫧', categories: ['Calm', 'Morning', 'SOS'], blurb: 'Slow, long exhales to settle a racing heart.', steps: [s('in', 4), s('hold', 2), s('out', 7)] },
  { id: 'relax', name: 'Relaxation Breathing', emoji: '🛋️', categories: ['Calm', 'Night'], blurb: 'Even, gentle breaths around 5–6 per minute.', steps: [s('in', 5), s('out', 5)] },
  { id: 'energy', name: 'Energy Breathing', emoji: '⚡', categories: ['Morning', 'Energize'], blurb: 'Quick, lively breaths to wake you up.', steps: [s('in', 2), s('out', 2)] },
  { id: 'alert', name: 'Alert Breathing', emoji: '🔆', categories: ['Morning', 'Energize'], blurb: 'Deep inhale, short hold, brisk exhale.', steps: [s('in', 4), s('hold', 1), s('out', 2)] },
  { id: 'stamina', name: 'Stamina Breathing', emoji: '🏃', categories: ['Energize'], blurb: 'Steady rhythm for endurance.', steps: [s('in', 3), s('hold', 3), s('out', 3)] },
  { id: 'destress', name: 'Destress Breathing', emoji: '😮‍💨', categories: ['Energize', 'Focus', 'SOS'], blurb: 'Two quick inhales then one long sigh out.', steps: [s('in', 2), s('in2', 1), s('out', 6)] },
  { id: 'sleep', name: 'Sleep Breathing', emoji: '🌙', categories: ['Night'], blurb: 'The classic 4-7-8 pattern for drifting off.', steps: [s('in', 4), s('hold', 7), s('out', 8)] },
  { id: 'dream', name: 'Dream Breathing', emoji: '💫', categories: ['Night'], blurb: 'Slow and dreamy with a long exhale.', steps: [s('in', 4), s('hold', 4), s('out', 8)] },
  { id: 'unwind', name: 'Unwind Breathing', emoji: '🧶', categories: ['Night', 'Focus'], blurb: 'Let the day go, one breath at a time.', steps: [s('in', 5), s('hold', 2), s('out', 7)] },
  { id: 'panic', name: 'Panic Breathing', emoji: '🆘', categories: ['SOS'], blurb: 'Very slow and steady. You are safe. Just follow the circle.', steps: [s('in', 4), s('hold', 4), s('out', 6), s('rest', 2)] },
];

export const BREATH_DURATIONS = [1, 3, 5, 10];

export const PHASE_LABEL: Record<BreathPhase, string> = {
  in: 'Breathe in',
  in2: 'Sip in a little more',
  hold: 'Hold',
  out: 'Breathe out',
  rest: 'Rest',
};

export function rewardForMinutes(min: number): { energy: number; stones: number } {
  if (min >= 10) return { energy: 20, stones: 12 };
  if (min >= 5) return { energy: 15, stones: 8 };
  if (min >= 3) return { energy: 10, stones: 5 };
  return { energy: 5, stones: 3 };
}
