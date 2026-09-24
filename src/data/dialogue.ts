export const GREETINGS = {
  morning: ['Good morning, {user}! ☀️', 'Morning! Did you sleep okay?', 'Rise and shine! What should we do today?', '*yawns* Good morning, {user}!'],
  afternoon: ['Good afternoon, {user}!', 'Hi hi! How\'s your day going?', 'Afternoon! Have you had a snack?'],
  evening: ['Good evening, {user} 🌆', 'Hey! How was your day?', 'Evening already? Time flies with you!'],
  night: ['It\'s getting late… 🌙', '*sleepy chirp* Hi {user}…', 'Shh… the stars are out.'],
};

export const IDLE_LINES = [
  'Have you had some water today? 💧',
  'I\'m proud of you, you know.',
  'Did you know? Birbs love it when you just sit with them.',
  'I like it here with you.',
  'What\'s one small thing we can do next?',
  'Remember to take a stretch break! 🙆',
  'I tried counting clouds today. I got to seven!',
  'You don\'t have to do everything today. Just something.',
  'My feathers feel extra fluffy today.',
  'Let\'s make today a gentle one.',
  'I love our little home. 🏠',
  'Do you think snails ever get in a hurry?',
  'Even small steps are steps!',
  'You\'re doing better than you think.',
  'Can we tidy one tiny thing together?',
  'I hummed a song all morning. It was a good one.',
  'Rest is part of the adventure too.',
  'Hi. Just wanted to say hi. Hi!',
];

export const LOW_MOOD_LINES = [
  'I\'m here with you. 💛',
  'Hard days happen. Let\'s go slow today.',
  'You don\'t have to be okay right now.',
  'Want to do a breathing exercise with me?',
  'Every tiny thing you do today counts double.',
];

export const HIGH_MOOD_LINES = [
  'You seem happy today! That makes me happy!',
  'Your good mood is contagious! 🎉',
  'Let\'s ride this good energy!',
];

export const PET_LINES = ['Hehe, that tickles!', '*happy chirp* 💕', 'More pats please!', '*purrs like a birb*', 'I love you too!'];

export const SLEEP_LINES = ['Zzz… 💤', '*mumbles about blueberries*', 'Zzz… five more minutes…', '*snores softly*'];

export const ADVENTURE_ACTIVITIES = [
  'following a butterfly',
  'hopping across stepping stones',
  'looking under leaves for treasure',
  'chatting with a friendly squirrel',
  'resting on a sunny rock',
  'humming along the trail',
  'counting clouds',
  'exploring a hidden path',
  'sharing snacks with a new friend',
  'splashing in a puddle',
  'making a flower crown',
  'watching the sky change colors',
];

export const HOME_UPKEEP_LINES = [
  'Our home feels so fresh when we take care of it! 🧼',
  'Thank you for looking after our home. 🏡',
  'A tidy nest is a happy nest!',
  'Future-you is going to be so thankful.',
];

export function fill(line: string, vars: Record<string, string>): string {
  return line.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
