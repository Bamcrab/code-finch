export interface GroundingStep {
  prompt: string;
  emoji: string;
  /** How many answers to collect; 0 = just a guided pause. */
  inputs: number;
  seconds?: number;
  color?: string;
}

export interface GroundingExercise {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  steps: GroundingStep[];
}

export const GROUNDING: GroundingExercise[] = [
  {
    id: '54321',
    name: '5-4-3-2-1',
    emoji: '🖐️',
    blurb: 'Use your senses to come back to the present.',
    steps: [
      { emoji: '👀', prompt: 'Name 5 things you can see', inputs: 5 },
      { emoji: '✋', prompt: 'Name 4 things you can touch', inputs: 4 },
      { emoji: '👂', prompt: 'Name 3 things you can hear', inputs: 3 },
      { emoji: '👃', prompt: 'Name 2 things you can smell', inputs: 2 },
      { emoji: '👅', prompt: 'Name 1 thing you can taste', inputs: 1 },
    ],
  },
  {
    id: '333',
    name: '3-3-3 Rule',
    emoji: '3️⃣',
    blurb: 'A quick reset for anxious moments.',
    steps: [
      { emoji: '👀', prompt: 'Name 3 things you see', inputs: 3 },
      { emoji: '👂', prompt: 'Name 3 sounds you hear', inputs: 3 },
      { emoji: '🙌', prompt: 'Move 3 parts of your body—wiggle your fingers, roll your shoulders, tap your feet.', inputs: 0, seconds: 20 },
    ],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Grounding',
    emoji: '🌈',
    blurb: 'Find one thing for every color of the rainbow.',
    steps: [
      { emoji: '🔴', prompt: 'Find something red', inputs: 1, color: '#e0605a' },
      { emoji: '🟠', prompt: 'Find something orange', inputs: 1, color: '#f29a4a' },
      { emoji: '🟡', prompt: 'Find something yellow', inputs: 1, color: '#f2cf4a' },
      { emoji: '🟢', prompt: 'Find something green', inputs: 1, color: '#67b56b' },
      { emoji: '🔵', prompt: 'Find something blue', inputs: 1, color: '#5a8fd9' },
      { emoji: '🟣', prompt: 'Find something purple', inputs: 1, color: '#9068c9' },
    ],
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    emoji: '🧍',
    blurb: 'Slowly notice each part of your body.',
    steps: [
      { emoji: '😌', prompt: 'Close your eyes if you like. Notice your breathing without changing it.', inputs: 0, seconds: 20 },
      { emoji: '🧠', prompt: 'Notice your forehead, jaw, and face. Let them soften.', inputs: 0, seconds: 20 },
      { emoji: '💪', prompt: 'Notice your shoulders and arms. Let them drop and grow heavy.', inputs: 0, seconds: 20 },
      { emoji: '🫁', prompt: 'Notice your chest and belly rising and falling.', inputs: 0, seconds: 20 },
      { emoji: '🦵', prompt: 'Notice your hips, legs, and feet. Feel them supported.', inputs: 0, seconds: 20 },
      { emoji: '🌟', prompt: 'Notice your whole body at once. Thank it for carrying you.', inputs: 0, seconds: 20 },
    ],
  },
  {
    id: 'butterfly',
    name: 'Butterfly Hug',
    emoji: '🦋',
    blurb: 'Cross your arms and gently tap left, right, left, right.',
    steps: [
      { emoji: '🤗', prompt: 'Cross your arms over your chest, hands resting near your collarbones.', inputs: 0, seconds: 10 },
      { emoji: '🦋', prompt: 'Slowly tap your hands, alternating left and right, like a butterfly\'s wings. Breathe slowly.', inputs: 0, seconds: 45 },
      { emoji: '💭', prompt: 'Keep tapping. Notice any thoughts float by like clouds.', inputs: 0, seconds: 30 },
      { emoji: '💛', prompt: 'Slow down and stop. Notice how you feel now.', inputs: 0, seconds: 15 },
    ],
  },
  {
    id: 'safe-place',
    name: 'Safe Place',
    emoji: '🏝️',
    blurb: 'Visit a calm place in your imagination.',
    steps: [
      { emoji: '🗺️', prompt: 'Picture a place where you feel safe and calm. Where is it?', inputs: 1 },
      { emoji: '👀', prompt: 'What do you see there?', inputs: 1 },
      { emoji: '👂', prompt: 'What do you hear?', inputs: 1 },
      { emoji: '💛', prompt: 'How does your body feel there? Stay a moment.', inputs: 0, seconds: 20 },
    ],
  },
];

export const AFFIRMATIONS = [
  'I am doing the best I can, and that is enough.',
  'I deserve rest and kindness.',
  'My feelings are valid.',
  'I can do hard things.',
  'I am allowed to take up space.',
  'Small steps still move me forward.',
  'I am learning and growing every day.',
  'I choose to be gentle with myself.',
  'I am worthy of love just as I am.',
  'This feeling is temporary.',
  'I trust myself to handle what comes.',
  'I am proud of how far I\'ve come.',
  'My home is a place of comfort.',
  'I bring something special to the world.',
  'I can let go of what I cannot control.',
  'It\'s okay to ask for help.',
  'I am enough, even on my hard days.',
  'I give myself permission to rest.',
  'I am becoming the person I want to be.',
  'Today, I will notice the good.',
  'My mistakes do not define me.',
  'I am calm, capable, and grounded.',
  'I celebrate my small wins.',
  'I am safe in this moment.',
  'I am worthy of the care I give others.',
  'I can start again at any moment.',
  'My body deserves care and respect.',
  'I am patient with my progress.',
  'I welcome joy into my day.',
  'Taking care of my space is taking care of me.',
];

export const KINDNESS_ACTS: { category: string; emoji: string; items: string[] }[] = [
  {
    category: 'Friends & family',
    emoji: '💞',
    items: [
      'Send a text saying why you appreciate them',
      'Call someone just to catch up',
      'Share a song that reminds you of them',
      'Offer to help with a chore or errand',
      'Plan a small surprise',
      'Write a handwritten note',
    ],
  },
  {
    category: 'Community',
    emoji: '🏘️',
    items: [
      'Hold the door for someone',
      'Pick up litter on a walk',
      'Leave a kind review for a local business',
      'Donate items you no longer need',
      'Thank a worker by name',
      'Check on an elderly neighbor',
    ],
  },
  {
    category: 'Strangers',
    emoji: '🌍',
    items: [
      'Give a genuine compliment',
      'Let someone go ahead of you in line',
      'Leave an encouraging sticky note somewhere public',
      'Smile and say good morning',
      'Pay for someone\'s coffee',
    ],
  },
  {
    category: 'Yourself',
    emoji: '💛',
    items: [
      'Take a guilt-free break',
      'Forgive yourself for a mistake',
      'Cook yourself something nourishing',
      'Tidy one small space for future-you',
      'Say something kind to yourself in the mirror',
      'Go to bed a little earlier',
    ],
  },
];
