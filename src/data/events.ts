export interface EventItem {
  id: string;
  name: string;
  art: string;
  color: string;
  accent?: string;
}

export interface SeasonalEvent {
  month: number;
  name: string;
  emoji: string;
  blurb: string;
  micropet: string;
  items: EventItem[];
}

/** Active days needed in the month for each reward tier; the last tier is the micropet. */
export const EVENT_TIERS = [2, 5, 9, 14, 20, 25];

function E(month: number, n: number, name: string, art: string, color: string, accent?: string): EventItem {
  return { id: `ev${month}-${n}`, name, art, color, accent };
}

export const EVENTS: SeasonalEvent[] = [
  {
    month: 1,
    name: 'Starlight Snowfall',
    emoji: '❄️',
    blurb: 'A fresh year, a quiet snow, and a sky full of wishes.',
    micropet: 'nimbus',
    items: [
      E(1, 1, 'Stargazer Wizard Hat', 'wizard-hat', 'navy', 'yellow'),
      E(1, 2, 'Midnight Cape', 'cape', 'navy'),
      E(1, 3, 'Snowy Night Wallpaper', 'wp-stars', 'purple', 'white'),
      E(1, 4, 'Wishing Star Mobile', 'ce-mobile', 'silver'),
      E(1, 5, 'Snowfall Earmuffs', 'earmuffs', 'white', 'sky'),
    ],
  },
  {
    month: 2,
    name: 'Sweet Hearts',
    emoji: '💝',
    blurb: 'Love letters, candy hearts, and a lot of self-love.',
    micropet: 'lovebug',
    items: [
      E(2, 1, 'Sweetheart Glasses', 'heart-glasses', 'rose'),
      E(2, 2, 'Valentine Heart Bed', 'bed-heart', 'pink'),
      E(2, 3, 'Candy Heart Wallpaper', 'wp-hearts', 'blush', 'red'),
      E(2, 4, 'Cupid Wings', 'angel-wings', 'blush'),
      E(2, 5, 'Love Note Heart Rug', 'rug-heart', 'red'),
    ],
  },
  {
    month: 3,
    name: 'Spring Sprouts',
    emoji: '🌱',
    blurb: 'Fresh starts, open windows, and a sparkly clean nest.',
    micropet: 'sprout',
    items: [
      E(3, 1, 'Blossom Sprout', 'sprout', 'pink'),
      E(3, 2, 'Spring Flower Crown', 'flower-crown', 'lavender', 'green'),
      E(3, 3, 'Garden Floral Wallpaper', 'wp-flowers', 'sage', 'pink'),
      E(3, 4, 'Tulip Pot', 'pl-flowers', 'pink', 'tan'),
      E(3, 5, 'Spring Clean Apron', 'apron', 'sage', 'white'),
    ],
  },
  {
    month: 4,
    name: 'Rainy Day Rhythms',
    emoji: '🌧️',
    blurb: 'Puddle jumps and cozy afternoons listening to the rain.',
    micropet: 'dewdrop',
    items: [
      E(4, 1, 'Puddle Raincoat', 'raincoat', 'sky', 'charcoal'),
      E(4, 2, 'Rainy Cloud Wallpaper', 'wp-clouds', 'lavender', 'white'),
      E(4, 3, 'Drizzle Bucket Hat', 'bucket-hat', 'yellow'),
      E(4, 4, 'Raincloud Bed', 'bed-cloud', 'sky'),
      E(4, 5, 'Cozy Record Cabinet', 'dr-record', 'teal'),
    ],
  },
  {
    month: 5,
    name: 'Garden Party',
    emoji: '🌼',
    blurb: 'Tea on the lawn, bees in the flowers, sun on your feathers.',
    micropet: 'honey',
    items: [
      E(5, 1, 'Garden Party Sun Hat', 'straw-hat', 'cream', 'pink'),
      E(5, 2, 'Petal Tutu', 'tutu', 'yellow'),
      E(5, 3, 'Garden Bunting', 'ce-bunting', 'pink', 'white'),
      E(5, 4, 'Sunflower Pot', 'pl-sunflower', 'sky'),
      E(5, 5, 'Pearl Strand', 'pearls', 'blush'),
    ],
  },
  {
    month: 6,
    name: 'Seaside Splash',
    emoji: '🌊',
    blurb: 'Sandcastles, shells, and salty breezes.',
    micropet: 'tofu',
    items: [
      E(6, 1, 'Seashell Sunglasses', 'sunglasses', 'blue'),
      E(6, 2, 'Beach Lei', 'lei', 'coral', 'green'),
      E(6, 3, 'Ship Porthole', 'win-porthole', 'gold'),
      E(6, 4, 'Boardwalk Beach Ball', 'toy-ball', 'blue', 'white'),
      E(6, 5, 'Lifeguard Tee', 'tshirt', 'red', 'white'),
    ],
  },
  {
    month: 7,
    name: 'Camp Cozy',
    emoji: '🏕️',
    blurb: 'Campfire songs, marshmallows, and sleeping under the stars.',
    micropet: 'bramble',
    items: [
      E(7, 1, 'Trail Bucket Hat', 'bucket-hat', 'sage'),
      E(7, 2, 'Camper Backpack', 'backpack', 'orange', 'brown'),
      E(7, 3, 'Campfire Lantern', 'lamp-lantern', 'forest'),
      E(7, 4, 'Singalong Guitar', 'toy-guitar', 'red', 'tan'),
      E(7, 5, 'Hammock Nook', 'bed-hammock', 'sage'),
    ],
  },
  {
    month: 8,
    name: 'Stargazers',
    emoji: '🔭',
    blurb: 'Meteor showers and constellations on warm summer nights.',
    micropet: 'twinkle',
    items: [
      E(8, 1, 'Shooting Star Glasses', 'star-glasses', 'yellow'),
      E(8, 2, 'Cosmic Jetpack', 'jetpack', 'silver', 'orange'),
      E(8, 3, 'Observatory Telescope', 'toy-telescope', 'navy', 'gold'),
      E(8, 4, 'Galaxy Wallpaper', 'wp-stars', 'navy', 'yellow'),
      E(8, 5, 'Moonlit Mobile', 'ce-mobile', 'lavender'),
    ],
  },
  {
    month: 9,
    name: 'Back to Books',
    emoji: '📚',
    blurb: 'Sharpened pencils, crunchy leaves, and a good book.',
    micropet: 'hazel',
    items: [
      E(9, 1, 'Scholar Cap', 'grad-cap', 'navy', 'gold'),
      E(9, 2, 'Library Cardigan', 'cardigan', 'mustard', 'tan'),
      E(9, 3, 'Reading Nook Bookshelf', 'dr-bookshelf', 'brown'),
      E(9, 4, 'Bookworm Stack', 'toy-books', 'red', 'cream'),
      E(9, 5, 'Reading Glasses', 'round-glasses', 'gold'),
    ],
  },
  {
    month: 10,
    name: 'Spooky Sprinkles',
    emoji: '🎃',
    blurb: 'Friendly ghosts, pumpkin patches, and candy corn.',
    micropet: 'figgy',
    items: [
      E(10, 1, 'Moonlight Witch Hat', 'witch-hat', 'purple', 'orange'),
      E(10, 2, 'Little Bat Wings', 'bat-wings', 'black'),
      E(10, 3, 'Jack-o-Lantern Hat', 'pumpkin-hat', 'orange', 'forest'),
      E(10, 4, 'Glowing Mushroom Lamp', 'lamp-mushroom', 'orange', 'white'),
      E(10, 5, 'Haunted Stripes', 'wp-stripes', 'plum', 'black'),
    ],
  },
  {
    month: 11,
    name: 'Harvest Hug',
    emoji: '🍂',
    blurb: 'Warm soup, thankful hearts, and crunchy leaves.',
    micropet: 'nugget',
    items: [
      E(11, 1, 'Harvest Sweater', 'sweater', 'mustard', 'cream'),
      E(11, 2, 'Maple Leaf', 'leaf', 'red'),
      E(11, 3, 'Autumn Garland', 'ce-garland', 'orange'),
      E(11, 4, 'Cozy Braided Rug', 'rug-braided', 'red', 'cream'),
      E(11, 5, 'Gratitude Wreath', 'wd-wreath', 'sage', 'orange'),
    ],
  },
  {
    month: 12,
    name: 'Winter Glow',
    emoji: '✨',
    blurb: 'Twinkly lights, cocoa, and cozy traditions.',
    micropet: 'drift',
    items: [
      E(12, 1, 'Holiday Hat', 'santa-hat', 'red', 'white'),
      E(12, 2, 'Reindeer Antlers', 'antlers', 'brown'),
      E(12, 3, 'Evergreen Wreath', 'wd-wreath', 'forest', 'red'),
      E(12, 4, 'Twinkle Lights', 'ce-lights', 'yellow'),
      E(12, 5, 'Cocoa Scarf', 'scarf', 'green', 'red'),
    ],
  },
];

export function eventForMonth(month: number): SeasonalEvent {
  return EVENTS[(month - 1 + 12) % 12];
}
