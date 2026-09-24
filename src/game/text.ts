export type TagCategory = 'people' | 'activity' | 'emotion' | 'other';

const PEOPLE = new Set([
  'mom', 'mum', 'dad', 'mother', 'father', 'parents', 'sister', 'brother', 'sibling', 'siblings', 'family',
  'friend', 'friends', 'bestie', 'partner', 'boyfriend', 'girlfriend', 'wife', 'husband', 'spouse', 'fiance',
  'boss', 'manager', 'coworker', 'coworkers', 'colleague', 'colleagues', 'team', 'kids', 'kid', 'son', 'daughter',
  'baby', 'grandma', 'grandpa', 'aunt', 'uncle', 'cousin', 'roommate', 'neighbor', 'neighbour', 'therapist',
  'dog', 'cat', 'pet', 'puppy', 'kitten',
]);

const ACTIVITIES = new Set([
  'work', 'job', 'meeting', 'meetings', 'school', 'class', 'study', 'studying', 'homework', 'exam',
  'sleep', 'nap', 'gym', 'exercise', 'workout', 'run', 'running', 'walk', 'walking', 'hike', 'yoga', 'swim',
  'cook', 'cooking', 'baking', 'clean', 'cleaning', 'laundry', 'chores', 'dishes', 'tidy', 'tidying', 'vacuum',
  'read', 'reading', 'book', 'music', 'game', 'games', 'gaming', 'movie', 'tv', 'shopping', 'garden', 'gardening',
  'meditate', 'meditation', 'journal', 'journaling', 'travel', 'drive', 'driving', 'commute', 'party', 'date',
]);

const EMOTIONS = new Set([
  'happy', 'sad', 'angry', 'mad', 'anxious', 'anxiety', 'stressed', 'stress', 'tired', 'exhausted', 'excited',
  'grateful', 'thankful', 'calm', 'peaceful', 'lonely', 'proud', 'worried', 'frustrated', 'overwhelmed', 'hopeful',
  'content', 'scared', 'afraid', 'nervous', 'joy', 'joyful', 'relieved', 'guilty', 'ashamed', 'bored', 'confident',
  'hurt', 'jealous', 'loved', 'motivated', 'depressed', 'upset', 'annoyed', 'irritated', 'optimistic',
]);

const POSITIVE = new Set([
  'good', 'great', 'happy', 'love', 'loved', 'lovely', 'fun', 'nice', 'amazing', 'awesome', 'wonderful',
  'excited', 'grateful', 'thankful', 'calm', 'peaceful', 'proud', 'relaxed', 'relieved', 'hopeful', 'content',
  'joy', 'joyful', 'beautiful', 'better', 'best', 'enjoyed', 'enjoy', 'laugh', 'laughed', 'smile', 'smiled',
  'win', 'won', 'success', 'successful', 'kind', 'care', 'cozy', 'fresh', 'clean', 'accomplished', 'confident',
  'motivated', 'productive', 'rested', 'safe', 'supported', 'glad', 'delicious', 'favorite', 'yay',
]);

const NEGATIVE = new Set([
  'bad', 'sad', 'angry', 'mad', 'hate', 'awful', 'terrible', 'horrible', 'anxious', 'anxiety', 'stressed',
  'stress', 'tired', 'exhausted', 'lonely', 'worried', 'worry', 'frustrated', 'overwhelmed', 'scared', 'afraid',
  'nervous', 'guilty', 'ashamed', 'bored', 'hurt', 'jealous', 'depressed', 'upset', 'annoyed', 'irritated', 'cry',
  'cried', 'crying', 'pain', 'sick', 'ill', 'worse', 'worst', 'fail', 'failed', 'failure', 'mess', 'messy',
  'broken', 'argument', 'fight', 'fought', 'difficult', 'hard', 'struggle', 'struggling', 'panic', 'ugh',
]);

const NEGATORS = new Set(['not', "don't", 'dont', 'never', "didn't", 'didnt', "wasn't", 'wasnt', "isn't", 'isnt', 'no']);

export function tagCategory(tag: string): TagCategory {
  const t = tag.toLowerCase();
  if (PEOPLE.has(t)) return 'people';
  if (ACTIVITIES.has(t)) return 'activity';
  if (EMOTIONS.has(t)) return 'emotion';
  return 'other';
}

/** Explicit #hashtags plus (optionally) auto-detected keywords. */
export function extractTags(text: string, auto: boolean): string[] {
  const tags = new Set<string>();
  for (const m of text.matchAll(/#([\p{L}\p{N}_]+)/gu)) tags.add(m[1].toLowerCase().replace(/_/g, ' '));
  if (auto) {
    for (const w of text.toLowerCase().match(/[a-z']+/g) ?? []) {
      if (PEOPLE.has(w) || ACTIVITIES.has(w) || EMOTIONS.has(w)) tags.add(w);
    }
  }
  return [...tags];
}

/** Rough sentiment in [-1, 1] using a tiny lexicon with simple negation. */
export function sentiment(text: string): number {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  let pos = 0;
  let neg = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const negated = NEGATORS.has(words[i - 1] ?? '') || NEGATORS.has(words[i - 2] ?? '');
    if (POSITIVE.has(w)) negated ? neg++ : pos++;
    else if (NEGATIVE.has(w)) negated ? pos++ : neg++;
  }
  if (pos + neg === 0) return 0;
  return (pos - neg) / (pos + neg);
}
