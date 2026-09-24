export interface Move {
  name: string;
  emoji: string;
  cue: string;
  seconds: number;
}

export interface MovementSet {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  moves: Move[];
}

const m = (emoji: string, name: string, cue: string, seconds = 30): Move => ({ emoji, name, cue, seconds });

export const MOVEMENT_SETS: MovementSet[] = [
  {
    id: 'wake-up',
    name: 'Morning Wake-up',
    emoji: '🌅',
    blurb: 'Gentle stretches to greet the day.',
    moves: [
      m('🙆', 'Reach for the sky', 'Stretch both arms overhead and rise onto your toes.'),
      m('🌊', 'Side bends', 'Reach one arm over your head and lean to the side. Switch.'),
      m('🔄', 'Shoulder rolls', 'Roll your shoulders back slowly, then forward.'),
      m('🙇', 'Forward fold', 'Hinge at the hips and let your head hang heavy. Bend your knees.'),
      m('🐱', 'Cat–cow', 'On hands and knees, arch then round your back with your breath.'),
      m('🦵', 'Knee hugs', 'Standing, hug one knee to your chest. Switch.'),
    ],
  },
  {
    id: 'desk',
    name: 'Desk Break',
    emoji: '💻',
    blurb: 'Undo the sitting slump.',
    moves: [
      m('↔️', 'Neck turns', 'Slowly turn your head left, then right.'),
      m('🤲', 'Wrist circles', 'Circle your wrists in both directions.'),
      m('🪑', 'Seated twist', 'Hold the back of your chair and twist gently. Switch sides.'),
      m('🧍', 'Stand and reach', 'Stand up, interlace fingers, push palms to the ceiling.'),
      m('💪', 'Chest opener', 'Clasp hands behind your back and lift your chest.'),
      m('🦶', 'Calf raises', 'Rise onto your toes and lower slowly.'),
    ],
  },
  {
    id: 'neck',
    name: 'Neck & Shoulders',
    emoji: '💆',
    blurb: 'Melt the tension you carry up top.',
    moves: [
      m('↘️', 'Ear to shoulder', 'Tilt one ear toward your shoulder. Breathe. Switch.'),
      m('⬇️', 'Chin tucks', 'Gently draw your chin back, making a double chin. Release.'),
      m('🔄', 'Shoulder shrugs', 'Lift shoulders to ears, hold, and drop them with a sigh.'),
      m('🦅', 'Eagle arms', 'Wrap one arm under the other and lift your elbows.'),
      m('🤗', 'Self hug', 'Wrap your arms around yourself and breathe into your back.'),
    ],
  },
  {
    id: 'yoga',
    name: 'Gentle Yoga',
    emoji: '🧘',
    blurb: 'A slow, grounding flow.',
    moves: [
      m('⛰️', 'Mountain pose', 'Stand tall, feet grounded, arms by your sides.', 30),
      m('🌳', 'Tree pose', 'Place one foot on your ankle or calf. Balance. Switch halfway.', 40),
      m('⚔️', 'Warrior II', 'Wide stance, arms out, gaze over your front hand.', 40),
      m('🐕', 'Downward dog', 'Hands and feet on the floor, hips high. Pedal your feet.', 40),
      m('👶', 'Child\'s pose', 'Knees wide, sit back on heels, forehead down.', 45),
      m('🌉', 'Bridge', 'Lie on your back, knees bent, lift your hips.', 30),
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime Unwind',
    emoji: '🌙',
    blurb: 'Slow stretches to help you sleep.',
    moves: [
      m('👶', 'Child\'s pose', 'Rest your forehead down and breathe slowly.', 45),
      m('🦋', 'Butterfly', 'Sit with soles of your feet together. Let knees fall open.', 45),
      m('🌀', 'Supine twist', 'Lying down, drop both knees to one side. Switch.', 45),
      m('🦵', 'Legs up the wall', 'Lie near a wall with your legs resting up it.', 60),
      m('😴', 'Body melt', 'Lie still and let your whole body get heavy.', 45),
    ],
  },
  {
    id: 'cardio',
    name: 'Quick Cardio',
    emoji: '💓',
    blurb: 'Get your heart pumping.',
    moves: [
      m('🦘', 'Jumping jacks', 'Or step-jacks for low impact.', 30),
      m('🏃', 'March in place', 'Lift your knees high and swing your arms.', 30),
      m('🥊', 'Shadow boxing', 'Punch the air—jab, cross, repeat.', 30),
      m('🪑', 'Squats', 'Sit back like there\'s a chair behind you.', 30),
      m('⛸️', 'Skaters', 'Hop or step side to side.', 30),
      m('😮‍💨', 'Cool down', 'Walk slowly and breathe.', 30),
    ],
  },
  {
    id: 'hips',
    name: 'Hip Openers',
    emoji: '🦵',
    blurb: 'Loosen tight hips from sitting.',
    moves: [
      m('🧎', 'Low lunge', 'Step one foot forward, back knee down, sink hips. Switch halfway.', 40),
      m('🦋', 'Butterfly', 'Soles together, gently press knees down.', 40),
      m('🐸', 'Frog pose', 'On hands and knees, widen knees slowly.', 40),
      m('4️⃣', 'Figure four', 'Lying down, cross one ankle over the other knee. Switch halfway.', 40),
      m('🔄', 'Hip circles', 'Standing, circle your hips like a hula hoop.', 30),
    ],
  },
  {
    id: 'hands',
    name: 'Hands & Wrists',
    emoji: '✋',
    blurb: 'For typers, crafters, and scrollers.',
    moves: [
      m('✊', 'Fist to fan', 'Make a fist, then spread your fingers wide.', 20),
      m('🔄', 'Wrist circles', 'Circle both directions.', 20),
      m('🙏', 'Prayer stretch', 'Palms together, lower hands until you feel a stretch.', 30),
      m('👌', 'Finger taps', 'Tap each fingertip to your thumb.', 20),
      m('🤚', 'Finger pulls', 'Gently pull back each finger with the other hand.', 30),
    ],
  },
];

export const MOVEMENT_DURATIONS = [1, 3, 5, 10];
