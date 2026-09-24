export interface ReflectionPrompt {
  id: string;
  title: string;
  emoji: string;
  categories: string[];
  blurb: string;
  questions: string[];
}

export const REFLECTION_CATEGORIES = [
  { id: 'sos', label: 'SOS', emoji: '🆘' },
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'night', label: 'Night', emoji: '🌙' },
  { id: 'deep', label: 'Deep Dives', emoji: '🤿' },
  { id: 'big', label: 'Big Picture', emoji: '🔭' },
  { id: 'energize', label: 'Energize', emoji: '⚡' },
  { id: 'kindness', label: 'Kindness', emoji: '💗' },
  { id: 'home', label: 'Home', emoji: '🏠' },
];

const P = (id: string, emoji: string, title: string, categories: string[], blurb: string, questions: string[]): ReflectionPrompt => ({
  id,
  emoji,
  title,
  categories,
  blurb,
  questions,
});

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  P('free', '📝', 'Free Write', [], 'Write whatever is on your mind.', ['What\'s on your mind?']),
  // SOS
  P('rant', '😤', 'Rant Zone', ['sos'], 'Let it all out. No judgment here.', [
    'What\'s bothering you? Get it all out.',
    'Now that it\'s out of your head, how do you feel?',
  ]),
  P('regroup', '🧩', 'Regroup Time', ['sos', 'calm'], 'When everything feels like too much.', [
    'What feels overwhelming right now?',
    'Which part of it is actually in your control today?',
    'What is one tiny next step you could take?',
  ]),
  P('loved-one', '🫂', 'What Would You Tell a Friend?', ['sos', 'deep'], 'Borrow the kindness you give others.', [
    'Describe what you\'re going through.',
    'If a close friend were in this exact situation, what would you say to them?',
    'Can you say that same thing to yourself?',
  ]),
  P('triggers', '⚡', 'Managing Triggers', ['sos', 'deep'], 'Understand what sets off big feelings.', [
    'What happened right before you started feeling this way?',
    'What emotion came up, and where did you feel it in your body?',
    'What has helped you cope with this before?',
  ]),
  P('grief', '🕊️', 'Processing Grief', ['sos'], 'A gentle space for loss.', [
    'Who or what are you missing?',
    'What is a memory you want to hold on to?',
    'What do you need most right now?',
  ]),
  P('healing', '🌱', 'A Step Toward Healing', ['sos'], 'Small steps count.', [
    'What hurt are you carrying?',
    'What would healing look like, even a little bit?',
    'What is one kind thing you can do for yourself today?',
  ]),
  // Calm
  P('thought-dump', '🗑️', 'Thought Dump', ['calm'], 'Empty your brain onto the page.', ['List everything swirling around in your head.']),
  P('worry-time', '⏳', 'Worry Box', ['calm'], 'Put your worries somewhere safe.', [
    'What are you worried about?',
    'What\'s the most likely outcome, realistically?',
    'Can you set this worry aside until tomorrow?',
  ]),
  P('present', '🍃', 'Right Now', ['calm'], 'Arrive in this moment.', [
    'What can you see, hear, and feel right now?',
    'What is one thing that is okay in this exact moment?',
  ]),
  // Morning
  P('morning', '🌅', 'Morning Reflection', ['morning'], 'Set the tone for your day.', [
    'How did you sleep?',
    'What are you looking forward to today?',
    'What\'s one intention for today?',
  ]),
  P('confidence', '🦸', 'Confidence Booster', ['morning', 'energize'], 'Remember your strengths.', [
    'What is something you\'ve done that you\'re proud of?',
    'What strength helped you do it?',
    'How could you use that strength today?',
  ]),
  P('dream', '💤', 'Dream Diary', ['morning'], 'Catch your dreams before they fly away.', [
    'What did you dream about?',
    'How did the dream make you feel?',
  ]),
  P('affirmation-day', '💬', 'Affirmation of the Day', ['morning', 'energize'], 'Write your own affirmation.', [
    'Write an affirmation you need to hear today.',
    'Why does it matter to you?',
  ]),
  // Night
  P('night', '🌙', 'Night Reflection', ['night'], 'Wind down and look back on today.', [
    'What was the best part of today?',
    'What was hard today?',
    'What\'s something you want to let go of before sleep?',
  ]),
  P('til', '💡', 'Today I Learned', ['night'], 'Every day teaches something.', ['What did you learn today—about the world or yourself?']),
  P('gratitude-jar', '🫙', 'Gratitude Jar', ['night', 'kindness'], 'Fill your jar with good things.', [
    'What are three things you\'re grateful for today?',
    'Which one made you smile the most, and why?',
  ]),
  P('savor', '🍯', 'Savoring a Good Moment', ['night', 'deep'], 'Relive something lovely.', [
    'Describe a pleasant moment from today in detail.',
    'What made it feel good?',
    'How can you have more moments like that?',
  ]),
  P('wins', '🏆', 'Small Wins', ['night', 'energize'], 'Celebrate the little victories.', ['List every small win from today, no matter how tiny.']),
  // Deep dives
  P('inner-voice', '🗣️', 'Your Inner Voice', ['deep'], 'Notice how you talk to yourself.', [
    'What has your inner voice been saying lately?',
    'Is it kind? Is it true?',
    'How could you reword it more gently?',
  ]),
  P('values', '🧭', 'Life Values', ['deep', 'big'], 'What really matters to you?', [
    'What are three things that matter most to you in life?',
    'Did today reflect those values?',
  ]),
  P('growth', '🌳', 'Growth Mindset', ['deep', 'energize'], 'Mistakes are how we grow.', [
    'Describe a recent mistake or setback.',
    'What did it teach you?',
    'What will you try differently next time?',
  ]),
  P('childhood', '🧸', 'Childhood Memories', ['deep'], 'Visit your younger self.', [
    'What\'s a happy memory from your childhood?',
    'What would you tell your younger self today?',
  ]),
  P('boundaries', '🚧', 'Boundaries', ['deep'], 'Protect your energy.', [
    'Is there a situation where you need a boundary?',
    'What would you like to say or do?',
  ]),
  // Big picture
  P('week-back', '📅', 'Weekly Look Back', ['big'], 'Zoom out on your week.', [
    'What went well this week?',
    'What was challenging?',
    'What do you want to carry into next week?',
  ]),
  P('week-forward', '🗓️', 'Weekly Look Forward', ['big'], 'Plan the week ahead.', [
    'What are you looking forward to this week?',
    'What\'s one thing you want to accomplish?',
    'How will you take care of yourself?',
  ]),
  P('month-back', '🌙', 'Monthly Look Back', ['big'], 'Reflect on the past month.', [
    'What moments stood out this month?',
    'How have you grown?',
    'What would you like more of next month?',
  ]),
  P('year-forward', '🎆', 'Yearly Look Forward', ['big'], 'Dream about the year ahead.', [
    'Who do you want to be a year from now?',
    'What\'s one habit that would help get you there?',
  ]),
  P('memory-lane', '🛤️', 'Memory Lane', ['big'], 'A favorite memory, revisited.', ['Describe a memory you treasure. Who was there? What made it special?']),
  // Energize
  P('hype', '📣', 'Hype Machine', ['energize'], 'Be your own biggest fan.', [
    'Write yourself a pep talk for today.',
    'What\'s something awesome about you?',
  ]),
  P('fun', '🎉', 'Fun Times', ['energize'], 'What lights you up?', [
    'What\'s something that always makes you laugh?',
    'When did you last do something purely for fun?',
  ]),
  P('bucket', '🪣', 'Bucket List', ['energize', 'big'], 'Dream a little.', ['List five things you\'d love to do someday.']),
  // Kindness
  P('giving-kindness', '🎁', 'Giving Kindness', ['kindness'], 'Reflect on a kind act.', [
    'What kind thing did you do for someone?',
    'How did it feel?',
  ]),
  P('receiving-kindness', '💐', 'Appreciating Kindness', ['kindness'], 'Notice kindness from others.', [
    'Who was kind to you recently?',
    'How did it make you feel? Did you tell them?',
  ]),
  P('self-compassion', '💛', 'Self-compassion', ['kindness', 'sos'], 'You deserve gentleness too.', [
    'What are you being hard on yourself about?',
    'What would a compassionate response sound like?',
  ]),
  // Home
  P('home-feel', '🏡', 'Home Sweet Home', ['home'], 'Notice how your space makes you feel.', [
    'Which corner of your home makes you feel the best?',
    'Which spot drains you, and what would make it better?',
  ]),
  P('clutter', '📦', 'Clutter Check', ['home'], 'Let go of what you don\'t need.', [
    'What\'s one thing in your home you\'ve been meaning to let go of?',
    'What\'s holding you back from letting it go?',
  ]),
  P('upkeep-win', '🧰', 'Home Win', ['home', 'energize'], 'Celebrate taking care of your space.', [
    'What did you take care of around the house?',
    'How does it feel now that it\'s done?',
  ]),
  P('skip', '🪁', 'Skipped Goal', [], 'It\'s okay to skip. Let\'s understand why.', [
    'Why did you decide to skip this today?',
    'Is there a smaller version you could try next time?',
  ]),
  P('goal-done', '🌟', 'Goal Reflection', [], 'Savor your effort.', [
    'How did it feel to finish this?',
    'What helped you do it?',
  ]),
];

export const PROMPT_MAP: Record<string, ReflectionPrompt> = Object.fromEntries(REFLECTION_PROMPTS.map((p) => [p.id, p]));
