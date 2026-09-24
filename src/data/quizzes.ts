export interface QuizOption {
  label: string;
  value: number;
}

export interface QuizItem {
  text: string;
  reverse?: boolean;
  /** Filler items are asked but not scored. */
  filler?: boolean;
}

export interface QuizBand {
  max: number;
  label: string;
  text: string;
}

export interface Quiz {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  instructions: string;
  options: QuizOption[];
  items: QuizItem[];
  scoring: 'sum' | 'mean';
  bands: QuizBand[];
  /** Item index that, if answered above 0, should surface crisis resources. */
  safetyItem?: number;
  source: string;
}

const FREQ_2W: QuizOption[] = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const AGREE_7: QuizOption[] = [
  { label: 'Strongly disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Slightly disagree', value: 3 },
  { label: 'Neutral', value: 4 },
  { label: 'Slightly agree', value: 5 },
  { label: 'Agree', value: 6 },
  { label: 'Strongly agree', value: 7 },
];

export const QUIZZES: Quiz[] = [
  {
    id: 'anxiety',
    name: 'Anxiety Check-in',
    emoji: '🫧',
    blurb: 'A look at how anxious you\'ve felt over the last two weeks.',
    instructions: 'Over the last 2 weeks, how often have you been bothered by the following?',
    options: FREQ_2W,
    items: [
      { text: 'Feeling nervous, anxious, or on edge' },
      { text: 'Not being able to stop or control worrying' },
      { text: 'Worrying too much about different things' },
      { text: 'Trouble relaxing' },
      { text: 'Being so restless that it\'s hard to sit still' },
      { text: 'Becoming easily annoyed or irritable' },
      { text: 'Feeling afraid, as if something awful might happen' },
    ],
    scoring: 'sum',
    bands: [
      { max: 4, label: 'Minimal', text: 'Your answers suggest minimal anxiety right now. Keep doing what helps!' },
      { max: 9, label: 'Mild', text: 'Some anxiety is showing up. Breathing exercises and grounding may help.' },
      { max: 14, label: 'Moderate', text: 'Anxiety seems to be affecting you. Consider talking with someone you trust or a professional.' },
      { max: 21, label: 'Severe', text: 'You\'re carrying a lot. Please consider reaching out to a doctor or mental health professional.' },
    ],
    source: 'GAD-7 (Spitzer, Kroenke, Williams & Löwe, 2006)',
  },
  {
    id: 'depression',
    name: 'Mood Check-in',
    emoji: '🌧️',
    blurb: 'A quick screen for symptoms of depression.',
    instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following?',
    options: FREQ_2W,
    items: [
      { text: 'Little interest or pleasure in doing things' },
      { text: 'Feeling down, depressed, or hopeless' },
      { text: 'Trouble falling or staying asleep, or sleeping too much' },
      { text: 'Feeling tired or having little energy' },
      { text: 'Poor appetite or overeating' },
      { text: 'Feeling bad about yourself—or that you are a failure or have let yourself or others down' },
      { text: 'Trouble concentrating on things, such as reading or watching TV' },
      { text: 'Moving or speaking so slowly that others could notice—or being so fidgety or restless that you move around a lot more than usual' },
      { text: 'Thoughts that you would be better off dead, or of hurting yourself' },
    ],
    scoring: 'sum',
    bands: [
      { max: 4, label: 'Minimal', text: 'Your answers suggest minimal symptoms right now.' },
      { max: 9, label: 'Mild', text: 'Some low mood is showing up. Gentle routines and connection can help.' },
      { max: 14, label: 'Moderate', text: 'Your mood seems to be affecting your life. Consider talking to a professional.' },
      { max: 19, label: 'Moderately severe', text: 'This is a lot to carry. Please reach out to a doctor or therapist.' },
      { max: 27, label: 'Severe', text: 'Please reach out to a doctor or mental health professional soon. You deserve support.' },
    ],
    safetyItem: 8,
    source: 'PHQ-9 (Kroenke, Spitzer & Williams, 2001)',
  },
  {
    id: 'stress',
    name: 'Stress Check-in',
    emoji: '🌪️',
    blurb: 'How stressful has life felt lately?',
    instructions: 'In the last month, how often have you…',
    options: [
      { label: 'Never', value: 0 },
      { label: 'Almost never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Fairly often', value: 3 },
      { label: 'Very often', value: 4 },
    ],
    items: [
      { text: 'Been upset because of something that happened unexpectedly?' },
      { text: 'Felt unable to control the important things in your life?' },
      { text: 'Felt nervous and stressed?' },
      { text: 'Felt confident about your ability to handle your personal problems?', reverse: true },
      { text: 'Felt that things were going your way?', reverse: true },
      { text: 'Found that you could not cope with all the things you had to do?' },
      { text: 'Been able to control irritations in your life?', reverse: true },
      { text: 'Felt that you were on top of things?', reverse: true },
      { text: 'Been angered because of things outside of your control?' },
      { text: 'Felt difficulties were piling up so high that you could not overcome them?' },
    ],
    scoring: 'sum',
    bands: [
      { max: 13, label: 'Low stress', text: 'You seem to be managing stress well right now.' },
      { max: 26, label: 'Moderate stress', text: 'Stress is present. Build in rest, movement, and time with people you love.' },
      { max: 40, label: 'High stress', text: 'Stress is running high. Try lightening your load where you can, and reach out for support.' },
    ],
    source: 'Perceived Stress Scale, PSS-10 (Cohen, Kamarck & Mermelstein, 1983)',
  },
  {
    id: 'flourishing',
    name: 'Flourishing',
    emoji: '🌻',
    blurb: 'How are you doing across the big areas of life?',
    instructions: 'How much do you agree with each statement?',
    options: AGREE_7,
    items: [
      { text: 'I lead a purposeful and meaningful life.' },
      { text: 'My social relationships are supportive and rewarding.' },
      { text: 'I am engaged and interested in my daily activities.' },
      { text: 'I actively contribute to the happiness and well-being of others.' },
      { text: 'I am competent and capable in the activities that are important to me.' },
      { text: 'I am a good person and live a good life.' },
      { text: 'I am optimistic about my future.' },
      { text: 'People respect me.' },
    ],
    scoring: 'sum',
    bands: [
      { max: 31, label: 'Room to grow', text: 'Some areas of life may feel thin right now. Small steps in one area can ripple into others.' },
      { max: 47, label: 'Doing okay', text: 'You\'re doing well in many areas. Notice which one could use a little love.' },
      { max: 56, label: 'Flourishing', text: 'You\'re flourishing! Keep nurturing what\'s working.' },
    ],
    source: 'Flourishing Scale (Diener et al., 2009)',
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    emoji: '🙏',
    blurb: 'How often does gratitude show up for you?',
    instructions: 'How much do you agree with each statement?',
    options: AGREE_7,
    items: [
      { text: 'I have so much in life to be thankful for.' },
      { text: 'If I had to list everything I felt grateful for, it would be a very long list.' },
      { text: 'When I look at the world, I don\'t see much to be grateful for.', reverse: true },
      { text: 'I am grateful to a wide variety of people.' },
      { text: 'As I get older, I find myself more able to appreciate the people, events, and situations in my life.' },
      { text: 'Long amounts of time can go by before I feel grateful to something or someone.', reverse: true },
    ],
    scoring: 'sum',
    bands: [
      { max: 29, label: 'Gratitude feels hard', text: 'Gratitude might feel distant right now—and that\'s okay. Try noticing one small good thing a day.' },
      { max: 37, label: 'Moderate gratitude', text: 'You notice good things fairly often. A gratitude jar could make it a habit.' },
      { max: 42, label: 'Very grateful', text: 'Gratitude is a strong part of your life. Beautiful!' },
    ],
    source: 'GQ-6 (McCullough, Emmons & Tsang, 2002)',
  },
  {
    id: 'optimism',
    name: 'Outlook',
    emoji: '🌤️',
    blurb: 'Do you tend to expect good things or brace for the worst?',
    instructions: 'How much do you agree with each statement?',
    options: [
      { label: 'Strongly disagree', value: 0 },
      { label: 'Disagree', value: 1 },
      { label: 'Neutral', value: 2 },
      { label: 'Agree', value: 3 },
      { label: 'Strongly agree', value: 4 },
    ],
    items: [
      { text: 'In uncertain times, I usually expect the best.' },
      { text: 'It\'s easy for me to relax.', filler: true },
      { text: 'If something can go wrong for me, it will.', reverse: true },
      { text: 'I\'m always optimistic about my future.' },
      { text: 'I enjoy my friends a lot.', filler: true },
      { text: 'It\'s important for me to keep busy.', filler: true },
      { text: 'I hardly ever expect things to go my way.', reverse: true },
      { text: 'I don\'t get upset too easily.', filler: true },
      { text: 'I rarely count on good things happening to me.', reverse: true },
      { text: 'Overall, I expect more good things to happen to me than bad.' },
    ],
    scoring: 'sum',
    bands: [
      { max: 13, label: 'Leaning pessimistic', text: 'You tend to brace for the worst. Noticing small good outcomes can gently shift this.' },
      { max: 18, label: 'Balanced', text: 'You have a fairly balanced outlook.' },
      { max: 24, label: 'Optimistic', text: 'You generally expect good things. That hopefulness is a strength!' },
    ],
    source: 'Life Orientation Test–Revised (Scheier, Carver & Bridges, 1994)',
  },
  {
    id: 'body',
    name: 'Body Appreciation',
    emoji: '🫶',
    blurb: 'How do you feel about and care for your body?',
    instructions: 'How often is each statement true for you?',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Seldom', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Always', value: 5 },
    ],
    items: [
      { text: 'I respect my body.' },
      { text: 'I feel good about my body.' },
      { text: 'I feel that my body has at least some good qualities.' },
      { text: 'I take a positive attitude towards my body.' },
      { text: 'I am attentive to my body\'s needs.' },
      { text: 'I feel love for my body.' },
      { text: 'I appreciate the different and unique characteristics of my body.' },
      { text: 'My behavior reveals my positive attitude toward my body—for example, I hold my head high and smile.' },
      { text: 'I am comfortable in my body.' },
      { text: 'I feel beautiful even if I am different from media images of attractive people.' },
    ],
    scoring: 'mean',
    bands: [
      { max: 2.5, label: 'Growing appreciation', text: 'Body appreciation may be hard right now. Try thanking your body for one thing it does for you.' },
      { max: 3.7, label: 'Moderate appreciation', text: 'You appreciate your body some of the time. Keep being kind to it.' },
      { max: 5, label: 'High appreciation', text: 'You treat your body with appreciation and care. Wonderful!' },
    ],
    source: 'Body Appreciation Scale-2 (Tylka & Wood-Barcalow, 2015)',
  },
  {
    id: 'ptsd',
    name: 'Stress After Trauma',
    emoji: '🛡️',
    blurb: 'For anyone who has lived through something frightening or traumatic.',
    instructions:
      'Sometimes things happen that are unusually frightening, horrible, or traumatic. If you\'ve experienced something like that, answer: in the past month, have you…',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes', value: 1 },
    ],
    items: [
      { text: 'Had nightmares about it or thought about it when you did not want to?' },
      { text: 'Tried hard not to think about it or gone out of your way to avoid reminders of it?' },
      { text: 'Been constantly on guard, watchful, or easily startled?' },
      { text: 'Felt numb or detached from people, activities, or your surroundings?' },
      { text: 'Felt guilty or unable to stop blaming yourself or others for it?' },
    ],
    scoring: 'sum',
    bands: [
      { max: 2, label: 'Lower likelihood', text: 'Your answers suggest a lower likelihood of PTSD. Still, if something is weighing on you, it\'s worth talking about.' },
      { max: 5, label: 'Worth checking', text: 'Your answers suggest it may be worth speaking with a professional about what you\'ve been through.' },
    ],
    source: 'PC-PTSD-5 (Prins et al., 2016)',
  },
];

export const QUIZ_MAP: Record<string, Quiz> = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));

export function scoreQuiz(quiz: Quiz, answers: number[]): { score: number; band: QuizBand } {
  const values = quiz.options.map((o) => o.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  let total = 0;
  let n = 0;
  quiz.items.forEach((it, i) => {
    if (it.filler) return;
    const v = answers[i] ?? lo;
    total += it.reverse ? lo + hi - v : v;
    n++;
  });
  const score = quiz.scoring === 'mean' ? Math.round((total / Math.max(1, n)) * 10) / 10 : total;
  const band = quiz.bands.find((b) => score <= b.max) ?? quiz.bands[quiz.bands.length - 1];
  return { score, band };
}

export function quizMax(quiz: Quiz): number {
  const values = quiz.options.map((o) => o.value);
  const hi = Math.max(...values);
  if (quiz.scoring === 'mean') return hi;
  return quiz.items.filter((i) => !i.filler).length * hi;
}
