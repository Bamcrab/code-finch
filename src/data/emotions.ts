export interface EmotionGroup {
  id: string;
  label: string;
  emoji: string;
  color: string;
  feelings: string[];
}

export interface EmotionFamily {
  id: 'pleasant' | 'neutral' | 'unpleasant';
  label: string;
  emoji: string;
  groups: EmotionGroup[];
}

export const EMOTION_FAMILIES: EmotionFamily[] = [
  {
    id: 'pleasant',
    label: 'Pleasant',
    emoji: '😊',
    groups: [
      { id: 'happy', label: 'Happy', emoji: '😄', color: '#f7d36b', feelings: ['Joyful', 'Playful', 'Cheerful', 'Excited', 'Proud', 'Amused', 'Delighted'] },
      { id: 'loved', label: 'Loved', emoji: '🥰', color: '#f4a3bd', feelings: ['Loving', 'Connected', 'Valued', 'Accepted', 'Respected', 'Thankful', 'Intimate'] },
      { id: 'confident', label: 'Confident', emoji: '😎', color: '#f2a66b', feelings: ['Courageous', 'Powerful', 'Successful', 'Capable', 'Productive', 'Motivated'] },
      { id: 'peaceful', label: 'Peaceful', emoji: '😌', color: '#9fd3b4', feelings: ['Calm', 'Content', 'Safe', 'Relaxed', 'Free', 'Relieved', 'Fulfilled'] },
      { id: 'inspired', label: 'Inspired', emoji: '🤩', color: '#b8a7ec', feelings: ['Curious', 'Creative', 'Hopeful', 'Optimistic', 'Amazed', 'In awe', 'Eager'] },
    ],
  },
  {
    id: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    groups: [
      { id: 'okay', label: 'Okay', emoji: '🙂', color: '#d8d1c3', feelings: ['Fine', 'Balanced', 'Comfortable', 'Mellow', 'Thoughtful', 'Steady'] },
      { id: 'flat', label: 'Flat', emoji: '😶', color: '#c4c8cf', feelings: ['Bored', 'Meh', 'Indifferent', 'Distracted', 'Tired', 'Unmotivated'] },
      { id: 'surprised', label: 'Surprised', emoji: '😮', color: '#a9d4ee', feelings: ['Startled', 'Confused', 'Perplexed', 'Shocked', 'Curious'] },
    ],
  },
  {
    id: 'unpleasant',
    label: 'Unpleasant',
    emoji: '😣',
    groups: [
      { id: 'sad', label: 'Sad', emoji: '😢', color: '#8fa9d8', feelings: ['Lonely', 'Hurt', 'Disappointed', 'Grieving', 'Hopeless', 'Empty', 'Nostalgic', 'Guilty'] },
      { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#b6a1d8', feelings: ['Worried', 'Nervous', 'Overwhelmed', 'Scared', 'Insecure', 'Panicked', 'Jittery', 'Inadequate'] },
      { id: 'angry', label: 'Angry', emoji: '😠', color: '#e78a7b', feelings: ['Frustrated', 'Annoyed', 'Irritated', 'Resentful', 'Jealous', 'Betrayed', 'Disrespected', 'Furious'] },
      { id: 'stressed', label: 'Stressed', emoji: '😫', color: '#e9ac72', feelings: ['Rushed', 'Pressured', 'Burned out', 'Exhausted', 'Restless', 'Scattered', 'Out of control'] },
      { id: 'ashamed', label: 'Ashamed', emoji: '😳', color: '#d7a3a3', feelings: ['Embarrassed', 'Humiliated', 'Regretful', 'Self-conscious', 'Exposed', 'Worthless'] },
      { id: 'disgusted', label: 'Disgusted', emoji: '🤢', color: '#a6c28a', feelings: ['Repulsed', 'Disapproving', 'Uncomfortable', 'Averse', 'Judgmental'] },
    ],
  },
];

export const ALL_FEELINGS = EMOTION_FAMILIES.flatMap((f) => f.groups.flatMap((g) => g.feelings.map((x) => ({ feeling: x, group: g, family: f.id }))));

export const MOOD_FACTORS: { category: string; items: { label: string; emoji: string }[] }[] = [
  {
    category: 'People & pets',
    items: [
      { label: 'Family', emoji: '👪' },
      { label: 'Friends', emoji: '🧑‍🤝‍🧑' },
      { label: 'Partner', emoji: '💑' },
      { label: 'Coworkers', emoji: '💼' },
      { label: 'Pets', emoji: '🐾' },
      { label: 'Alone time', emoji: '🧘' },
    ],
  },
  {
    category: 'Activities',
    items: [
      { label: 'Work', emoji: '💻' },
      { label: 'School', emoji: '🎒' },
      { label: 'Exercise', emoji: '🏃' },
      { label: 'Hobbies', emoji: '🎨' },
      { label: 'Chores', emoji: '🧹' },
      { label: 'Travel', emoji: '✈️' },
      { label: 'Screens', emoji: '📱' },
      { label: 'Food', emoji: '🍽️' },
    ],
  },
  {
    category: 'Body & health',
    items: [
      { label: 'Sleep', emoji: '😴' },
      { label: 'Energy', emoji: '⚡' },
      { label: 'Pain', emoji: '🤕' },
      { label: 'Illness', emoji: '🤒' },
      { label: 'Hormones', emoji: '🌙' },
      { label: 'Medication', emoji: '💊' },
    ],
  },
  {
    category: 'Environment',
    items: [
      { label: 'Home', emoji: '🏠' },
      { label: 'Weather', emoji: '🌦️' },
      { label: 'Money', emoji: '💸' },
      { label: 'News', emoji: '📰' },
      { label: 'Nature', emoji: '🌳' },
      { label: 'Noise', emoji: '🔊' },
    ],
  },
];
