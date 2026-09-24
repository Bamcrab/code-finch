import type { ActivityLink, Schedule, TimeOfDay } from '../state/types';

export interface GoalSuggestion {
  title: string;
  emoji: string;
  timeOfDay?: TimeOfDay;
  schedule?: Schedule;
  link?: ActivityLink;
  timesPerDay?: number;
}

export interface AreaDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
  suggestions: GoalSuggestion[];
}

const G = (emoji: string, title: string, extra: Partial<GoalSuggestion> = {}): GoalSuggestion => ({
  emoji,
  title,
  ...extra,
});

export const AREA_DEFS: AreaDef[] = [
  {
    id: 'calm',
    name: 'Calm',
    emoji: '🌿',
    color: '#9cc9a8',
    blurb: 'Slow down and give your mind some room.',
    suggestions: [
      G('🌬️', 'Do a breathing exercise', { link: { type: 'breathe', refId: 'calm' } }),
      G('🎧', 'Listen to a soundscape', { link: { type: 'soundscape' } }),
      G('🧘', 'Meditate for 5 minutes', { link: { type: 'timer' } }),
      G('🌳', 'Spend time in nature'),
      G('📵', 'Take a break from screens'),
      G('🍵', 'Drink something warm, slowly', { timeOfDay: 'afternoon' }),
      G('🫧', 'Try a grounding exercise', { link: { type: 'grounding', refId: '54321' } }),
      G('🛁', 'Take a relaxing bath or shower', { timeOfDay: 'evening' }),
    ],
  },
  {
    id: 'connection',
    name: 'Connection',
    emoji: '💞',
    color: '#f2a7bf',
    blurb: 'Nurture the people (and pets) who matter.',
    suggestions: [
      G('💬', 'Text a friend'),
      G('📞', 'Call a family member'),
      G('🤗', 'Hug someone'),
      G('🍽️', 'Share a meal with someone', { timeOfDay: 'evening' }),
      G('💌', 'Do an act of kindness', { link: { type: 'kindness' } }),
      G('🐶', 'Play with a pet'),
      G('👋', 'Say hi to a neighbor'),
      G('🗓️', 'Make plans with a friend', { schedule: { type: 'timesPerWeek', times: 1 } }),
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    emoji: '🙏',
    color: '#f5cf6b',
    blurb: 'Notice the good things, big and small.',
    suggestions: [
      G('📝', 'Write 3 things I\'m grateful for', { link: { type: 'reflection', refId: 'gratitude-jar' }, timeOfDay: 'evening' }),
      G('🙌', 'Thank someone'),
      G('🌅', 'Notice something beautiful'),
      G('💭', 'Savor a good moment', { link: { type: 'reflection', refId: 'savor' } }),
      G('✉️', 'Write a thank-you note', { schedule: { type: 'timesPerWeek', times: 1 } }),
    ],
  },
  {
    id: 'health',
    name: 'Health',
    emoji: '🩺',
    color: '#8fc6e8',
    blurb: 'Take care of your body.',
    suggestions: [
      G('💧', 'Drink water', { timesPerDay: 6 }),
      G('💊', 'Take my medication', { timeOfDay: 'morning' }),
      G('🌞', 'Get some sunlight', { timeOfDay: 'morning' }),
      G('🦷', 'Floss', { timeOfDay: 'evening' }),
      G('🩹', 'Check in with how my body feels'),
      G('🧴', 'Put on sunscreen', { timeOfDay: 'morning' }),
      G('🩺', 'Book a check-up', { schedule: { type: 'interval', every: 1, unit: 'year' } }),
    ],
  },
  {
    id: 'hygiene',
    name: 'Hygiene',
    emoji: '🛁',
    color: '#9fd8d2',
    blurb: 'Small routines that make you feel fresh.',
    suggestions: [
      G('🪥', 'Brush my teeth', { timesPerDay: 2 }),
      G('🚿', 'Shower'),
      G('🧼', 'Wash my face', { timeOfDay: 'evening' }),
      G('🧴', 'Skincare routine', { timeOfDay: 'evening' }),
      G('💇', 'Brush my hair', { timeOfDay: 'morning' }),
      G('👕', 'Put on clean clothes', { timeOfDay: 'morning' }),
      G('💅', 'Trim my nails', { schedule: { type: 'interval', every: 1, unit: 'week' } }),
      G('🪥', 'Replace toothbrush', { schedule: { type: 'interval', every: 3, unit: 'month' } }),
    ],
  },
  {
    id: 'movement',
    name: 'Movement',
    emoji: '🏃',
    color: '#f4a48a',
    blurb: 'Move your body in ways that feel good.',
    suggestions: [
      G('🚶', 'Go for a walk'),
      G('🧘', 'Stretch', { link: { type: 'movement', refId: 'wake-up' }, timeOfDay: 'morning' }),
      G('🏋️', 'Work out', { schedule: { type: 'timesPerWeek', times: 3 } }),
      G('💃', 'Dance to a song'),
      G('🪜', 'Take the stairs'),
      G('🚲', 'Go for a bike ride', { schedule: { type: 'timesPerWeek', times: 2 } }),
      G('🧍', 'Stand up and move every hour', { timesPerDay: 4 }),
      G('🤸', 'Do a desk-break stretch', { link: { type: 'movement', refId: 'desk' } }),
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    emoji: '🥗',
    color: '#b5d98a',
    blurb: 'Nourish yourself kindly.',
    suggestions: [
      G('🍳', 'Eat breakfast', { timeOfDay: 'morning' }),
      G('🥪', 'Eat lunch', { timeOfDay: 'afternoon' }),
      G('🍲', 'Eat dinner', { timeOfDay: 'evening' }),
      G('🍎', 'Eat a fruit or vegetable'),
      G('🥘', 'Cook a meal at home', { timeOfDay: 'evening' }),
      G('🥡', 'Meal prep', { schedule: { type: 'weekdays', days: [0] } }),
      G('🛒', 'Make a grocery list', { schedule: { type: 'timesPerWeek', times: 1 } }),
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    emoji: '✅',
    color: '#b3a6e6',
    blurb: 'Get things done, one small step at a time.',
    suggestions: [
      G('📋', 'Plan my day', { timeOfDay: 'morning' }),
      G('🎯', 'Do one important task'),
      G('⏱️', 'Focus for 25 minutes', { link: { type: 'timer', refId: '25' } }),
      G('📥', 'Clear my inbox'),
      G('📚', 'Read for 15 minutes'),
      G('🧾', 'Pay bills', { schedule: { type: 'monthly', dayOfMonth: 1 } }),
      G('🗓️', 'Plan my week', { schedule: { type: 'weekdays', days: [0] } }),
    ],
  },
  {
    id: 'selfkindness',
    name: 'Self-kindness',
    emoji: '💛',
    color: '#f7d488',
    blurb: 'Be as gentle with yourself as you are with others.',
    suggestions: [
      G('💬', 'Repeat an affirmation', { link: { type: 'affirmation' } }),
      G('🛋️', 'Rest without guilt'),
      G('🎨', 'Do something just for fun'),
      G('🙅', 'Say no to something that drains me'),
      G('📓', 'Journal my thoughts', { link: { type: 'reflection', refId: 'free' } }),
      G('😊', 'Log my mood', { link: { type: 'mood' } }),
      G('🫶', 'Name my emotion', { link: { type: 'emotion' } }),
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    emoji: '😴',
    color: '#8ea2d8',
    blurb: 'Rest is productive too.',
    suggestions: [
      G('🛏️', 'Get in bed by bedtime', { timeOfDay: 'evening' }),
      G('📵', 'No screens 30 minutes before bed', { timeOfDay: 'evening' }),
      G('🌙', 'Do a sleep breathing exercise', { link: { type: 'breathe', refId: 'sleep' }, timeOfDay: 'evening' }),
      G('⏰', 'Wake up on time', { timeOfDay: 'morning' }),
      G('📖', 'Read before bed', { timeOfDay: 'evening' }),
      G('🌧️', 'Fall asleep to a soundscape', { link: { type: 'soundscape', refId: 'rain' }, timeOfDay: 'evening' }),
    ],
  },
  {
    id: 'home',
    name: 'Home & Tidy',
    emoji: '🏠',
    color: '#e8b98f',
    blurb: 'Tidy up and keep your space feeling good.',
    suggestions: [
      G('🛏️', 'Make my bed', { timeOfDay: 'morning' }),
      G('🍽️', 'Do the dishes', { timeOfDay: 'evening' }),
      G('🧺', 'Do a load of laundry', { schedule: { type: 'timesPerWeek', times: 2 } }),
      G('🗑️', 'Take out the trash'),
      G('🧹', 'Tidy for 10 minutes'),
      G('🧽', 'Wipe the kitchen counters', { timeOfDay: 'evening' }),
      G('🪴', 'Water the plants', { schedule: { type: 'everyNDays', n: 3, anchor: '2026-01-01' } }),
      G('📦', 'Put away 10 things'),
      G('🧼', 'Clean the bathroom sink'),
      G('🧹', 'Vacuum', { schedule: { type: 'timesPerWeek', times: 1 } }),
    ],
  },
];

export const EASY_WINS: GoalSuggestion[] = [
  G('💧', 'Drink a glass of water'),
  G('🌬️', 'Take three deep breaths', { link: { type: 'breathe', refId: 'calm' } }),
  G('🪟', 'Open a window'),
  G('🍌', 'Eat a snack'),
  G('🛋️', 'Rest for 5 minutes'),
  G('🧍', 'Stretch for one minute'),
  G('🪥', 'Brush my teeth'),
  G('👕', 'Change into comfy clothes'),
  G('🎵', 'Listen to a favorite song'),
  G('💬', 'Send one message'),
];
