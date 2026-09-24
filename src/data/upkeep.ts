import type { Effort, Schedule } from '../state/types';

export interface RoomDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const ROOMS: RoomDef[] = [
  { id: 'kitchen', name: 'Kitchen', emoji: '🍳', color: '#f5c28b' },
  { id: 'bathroom', name: 'Bathroom', emoji: '🛁', color: '#9fd8d2' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️', color: '#b9b0ea' },
  { id: 'living', name: 'Living areas', emoji: '🛋️', color: '#f2b0a0' },
  { id: 'laundry', name: 'Laundry', emoji: '🧺', color: '#a9cdee' },
  { id: 'hvac', name: 'Heating & Air', emoji: '🌀', color: '#a7c4c9' },
  { id: 'safety', name: 'Safety', emoji: '🧯', color: '#ee9a90' },
  { id: 'plumbing', name: 'Plumbing & Water', emoji: '🚰', color: '#8fb7e6' },
  { id: 'exterior', name: 'Roof & Exterior', emoji: '🏠', color: '#c9b79c' },
  { id: 'yard', name: 'Yard & Garden', emoji: '🌳', color: '#9fcf8f' },
  { id: 'garage', name: 'Garage & Tools', emoji: '🧰', color: '#b8bcc4' },
  { id: 'car', name: 'Car', emoji: '🚗', color: '#95a8d8' },
  { id: 'pets', name: 'Pets', emoji: '🐾', color: '#e6c08a' },
  { id: 'admin', name: 'Home admin', emoji: '📋', color: '#d2b6e0' },
];

export const ROOM_MAP: Record<string, RoomDef> = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

export interface UpkeepTemplate {
  room: string;
  title: string;
  emoji: string;
  schedule: Schedule;
  effort: Effort;
  tip?: string;
}

const every = (n: number, unit: 'day' | 'week' | 'month' | 'year'): Schedule => ({ type: 'interval', every: n, unit });

function T(room: string, emoji: string, title: string, schedule: Schedule, effort: Effort = 1, tip?: string): UpkeepTemplate {
  return { room, emoji, title, schedule, effort, tip };
}

export const UPKEEP_TEMPLATES: UpkeepTemplate[] = [
  // Kitchen
  T('kitchen', '🧽', 'Replace kitchen sponge', every(2, 'week'), 1, 'Or microwave a damp sponge for a minute between swaps.'),
  T('kitchen', '🧊', 'Clean out the fridge', every(1, 'week'), 1, 'Toss leftovers and expired food before grocery day.'),
  T('kitchen', '🧊', 'Deep clean the fridge shelves', every(3, 'month'), 2),
  T('kitchen', '🧲', 'Vacuum refrigerator coils', every(6, 'month'), 2, 'Unplug first; coils are usually at the bottom front or back.'),
  T('kitchen', '💧', 'Replace fridge water filter', every(6, 'month'), 1, 'Write the filter model in the notes.'),
  T('kitchen', '♨️', 'Clean the oven', every(3, 'month'), 3),
  T('kitchen', '🌬️', 'Clean range hood filter', every(3, 'month'), 2, 'Soak in hot water with dish soap and baking soda.'),
  T('kitchen', '🔥', 'Clean the microwave', every(2, 'week'), 1),
  T('kitchen', '🍽️', 'Clean dishwasher filter', every(1, 'month'), 1),
  T('kitchen', '☕', 'Descale coffee maker / kettle', every(1, 'month'), 1),
  T('kitchen', '🗑️', 'Wash out trash & recycling bins', every(1, 'month'), 2),
  T('kitchen', '🚰', 'Freshen the garbage disposal', every(2, 'week'), 1, 'Ice cubes + citrus peel + cold water.'),
  T('kitchen', '🧂', 'Wipe down cabinet fronts', every(1, 'month'), 1),
  T('kitchen', '🫙', 'Tidy the pantry & toss expired food', every(3, 'month'), 2),
  T('kitchen', '🧹', 'Mop the kitchen floor', every(1, 'week'), 2),
  // Bathroom
  T('bathroom', '🚽', 'Clean the toilet', every(1, 'week'), 1),
  T('bathroom', '🚿', 'Scrub shower & tub', every(1, 'week'), 2),
  T('bathroom', '🪞', 'Clean mirrors & sink', every(1, 'week'), 1),
  T('bathroom', '🧺', 'Wash bath mats', every(2, 'week'), 1),
  T('bathroom', '🫧', 'Wash or replace shower curtain liner', every(1, 'month'), 1),
  T('bathroom', '🚿', 'Descale showerhead', every(3, 'month'), 1, 'Tie a bag of vinegar around it overnight.'),
  T('bathroom', '🌀', 'Clean exhaust fan cover', every(6, 'month'), 1),
  T('bathroom', '🧴', 'Toss expired toiletries & meds', every(6, 'month'), 1),
  T('bathroom', '🧱', 'Check caulk & grout', every(1, 'year'), 2),
  // Bedroom
  T('bedroom', '🛏️', 'Change bed sheets', every(1, 'week'), 1),
  T('bedroom', '🛌', 'Rotate / flip mattress', every(3, 'month'), 2),
  T('bedroom', '🪶', 'Wash pillows & duvet', every(3, 'month'), 2),
  T('bedroom', '🧥', 'Declutter closet', every(6, 'month'), 2),
  T('bedroom', '🌫️', 'Vacuum under the bed', every(1, 'month'), 1),
  // Living areas
  T('living', '🧹', 'Vacuum floors', every(1, 'week'), 2),
  T('living', '🪶', 'Dust surfaces & shelves', every(2, 'week'), 1),
  T('living', '🛋️', 'Vacuum couch cushions', every(1, 'month'), 1),
  T('living', '🪟', 'Wash windows (inside)', every(3, 'month'), 2),
  T('living', '🌀', 'Dust ceiling fans & light fixtures', every(1, 'month'), 1),
  T('living', '🖼️', 'Wipe baseboards', every(3, 'month'), 2),
  T('living', '🧸', 'Wash throw blankets & pillow covers', every(1, 'month'), 1),
  T('living', '🪴', 'Water houseplants', every(1, 'week'), 1),
  T('living', '🌱', 'Fertilize / repot houseplants', every(6, 'month'), 2),
  // Laundry
  T('laundry', '🧺', 'Clean washing machine (drum & gasket)', every(1, 'month'), 1, 'Run an empty hot cycle with a cleaner.'),
  T('laundry', '🔥', 'Clean dryer vent duct', every(1, 'year'), 3, 'Lint build-up is a fire hazard—clean the full duct to the outside.'),
  T('laundry', '🧤', 'Clean lint trap thoroughly (wash screen)', every(3, 'month'), 1),
  T('laundry', '💧', 'Inspect washer hoses for cracks', every(1, 'year'), 1),
  // HVAC
  T('hvac', '🌀', 'Replace HVAC / furnace filter', every(3, 'month'), 1, 'Put the filter size in the notes, e.g. 16x25x1.'),
  T('hvac', '🔧', 'Schedule furnace service', { type: 'yearly', month: 9, day: 15 }, 2),
  T('hvac', '❄️', 'Schedule AC service', { type: 'yearly', month: 4, day: 15 }, 2),
  T('hvac', '🌬️', 'Vacuum vents & returns', every(3, 'month'), 1),
  T('hvac', '💨', 'Clean / replace humidifier or dehumidifier filter', every(1, 'month'), 1),
  T('hvac', '🌡️', 'Replace thermostat batteries', every(1, 'year'), 1),
  // Safety
  T('safety', '🔔', 'Test smoke & CO detectors', every(1, 'month'), 1),
  T('safety', '🔋', 'Replace smoke detector batteries', every(1, 'year'), 1),
  T('safety', '🧯', 'Check fire extinguisher gauge', every(1, 'year'), 1),
  T('safety', '🔦', 'Refresh emergency kit & flashlights', every(6, 'month'), 1),
  T('safety', '🚪', 'Review fire escape plan', every(1, 'year'), 1),
  T('safety', '⚡', 'Test GFCI outlets', every(1, 'month'), 1),
  // Plumbing
  T('plumbing', '🔥', 'Flush the water heater', every(1, 'year'), 3),
  T('plumbing', '🧪', 'Test water heater pressure relief valve', every(1, 'year'), 1),
  T('plumbing', '🕳️', 'Clean slow drains', every(3, 'month'), 1, 'Baking soda + vinegar + hot water.'),
  T('plumbing', '💧', 'Check under sinks for leaks', every(3, 'month'), 1),
  T('plumbing', '🚰', 'Clean faucet aerators', every(6, 'month'), 1),
  T('plumbing', '🫗', 'Replace whole-house / pitcher water filter', every(2, 'month'), 1),
  T('plumbing', '🌊', 'Test the sump pump', every(3, 'month'), 1),
  // Exterior
  T('exterior', '🍂', 'Clean gutters & downspouts', every(6, 'month'), 3),
  T('exterior', '🏠', 'Inspect roof for damaged shingles', every(1, 'year'), 2),
  T('exterior', '🧱', 'Check foundation & siding for cracks', every(1, 'year'), 1),
  T('exterior', '🪟', 'Wash windows (outside)', every(6, 'month'), 3),
  T('exterior', '🚿', 'Shut off outdoor faucets for winter', { type: 'yearly', month: 10, day: 15 }, 1),
  T('exterior', '🪵', 'Reseal deck / fence', every(2, 'year'), 3),
  T('exterior', '🧹', 'Power wash walkways & siding', every(1, 'year'), 3),
  T('exterior', '🔥', 'Chimney inspection & sweep', every(1, 'year'), 2),
  // Yard
  T('yard', '🌿', 'Mow the lawn', every(1, 'week'), 2),
  T('yard', '🌱', 'Weed the garden beds', every(2, 'week'), 2),
  T('yard', '✂️', 'Trim hedges & shrubs', every(3, 'month'), 2),
  T('yard', '🍁', 'Rake leaves', every(1, 'week'), 2),
  T('yard', '🪵', 'Refresh mulch', every(1, 'year'), 2),
  T('yard', '⚙️', 'Service lawn mower (oil, blade, spark plug)', every(1, 'year'), 2),
  T('yard', '💦', 'Check sprinklers & hoses', every(3, 'month'), 1),
  T('yard', '🐦', 'Clean the bird feeder / bath', every(2, 'week'), 1),
  // Garage
  T('garage', '🚪', 'Lubricate garage door tracks & test auto-reverse', every(6, 'month'), 1),
  T('garage', '🧹', 'Sweep the garage', every(3, 'month'), 2),
  T('garage', '🔧', 'Sharpen / oil tools', every(1, 'year'), 1),
  T('garage', '🚲', 'Tune up bike (tires, chain)', every(3, 'month'), 1),
  // Car
  T('car', '🛢️', 'Oil change', every(6, 'month'), 2, 'Or by mileage—note your interval in the notes.'),
  T('car', '🛞', 'Check tire pressure', every(1, 'month'), 1),
  T('car', '🔄', 'Rotate tires', every(6, 'month'), 2),
  T('car', '🧼', 'Wash the car', every(1, 'month'), 2),
  T('car', '🧽', 'Clean out the car interior', every(1, 'month'), 1),
  T('car', '🌧️', 'Replace wiper blades', every(1, 'year'), 1),
  T('car', '🌬️', 'Replace cabin air filter', every(1, 'year'), 1),
  T('car', '📄', 'Renew registration', every(1, 'year'), 1),
  // Pets
  T('pets', '🐾', 'Wash pet bedding', every(2, 'week'), 1),
  T('pets', '💊', 'Give flea & tick prevention', every(1, 'month'), 1),
  T('pets', '🩺', 'Vet check-up', every(1, 'year'), 2),
  T('pets', '🐱', 'Deep clean litter box', every(1, 'month'), 1),
  T('pets', '✂️', 'Trim pet nails', every(1, 'month'), 1),
  T('pets', '🐠', 'Clean the fish tank', every(2, 'week'), 2),
  // Admin
  T('admin', '📸', 'Update home inventory photos', every(1, 'year'), 1),
  T('admin', '🛡️', 'Review home / renters insurance', every(1, 'year'), 1),
  T('admin', '🔑', 'Check spare keys & lock batteries', every(6, 'month'), 1),
  T('admin', '🧾', 'File home receipts & warranties', every(3, 'month'), 1),
  T('admin', '📋', 'Walk through the house for small repairs', every(3, 'month'), 1),
];

/** Friendly presets for the upkeep editor's interval picker. */
export const INTERVAL_PRESETS: { label: string; schedule: Schedule }[] = [
  { label: 'Weekly', schedule: every(1, 'week') },
  { label: 'Every 2 weeks', schedule: every(2, 'week') },
  { label: 'Monthly', schedule: every(1, 'month') },
  { label: 'Every 2 months', schedule: every(2, 'month') },
  { label: 'Quarterly', schedule: every(3, 'month') },
  { label: 'Twice a year', schedule: every(6, 'month') },
  { label: 'Yearly', schedule: every(1, 'year') },
];
