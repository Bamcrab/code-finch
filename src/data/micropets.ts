export interface MicropetSpecies {
  id: string;
  name: string;
  kind: string;
  variants: [string, string, string];
  /** Only obtainable from its seasonal event, not from random eggs. */
  eventOnly?: boolean;
}

export const MICROPET_SPECIES: MicropetSpecies[] = [
  { id: 'mochi', name: 'Mochi', kind: 'Mouse', variants: ['#d9d4cf', '#f2c1cf', '#b9a58f'] },
  { id: 'biscuit', name: 'Biscuit', kind: 'Pup', variants: ['#e3b77f', '#f4efe6', '#8b6247'] },
  { id: 'whiskers', name: 'Whiskers', kind: 'Kitten', variants: ['#f2a65a', '#9ea3ad', '#3b3a40'] },
  { id: 'bun', name: 'Bun', kind: 'Bunny', variants: ['#f7f3ee', '#cfb49a', '#d8c6ee'] },
  { id: 'pebble', name: 'Pebble', kind: 'Turtle', variants: ['#8fcf8f', '#6fc2c0', '#c7b36b'] },
  { id: 'sprout', name: 'Sprout', kind: 'Snail', variants: ['#f2c77a', '#f39db2', '#9fc6ea'] },
  { id: 'nimbus', name: 'Nimbus', kind: 'Cloud', variants: ['#ffffff', '#cfe3ff', '#ffd9e8'] },
  { id: 'ember', name: 'Ember', kind: 'Salamander', variants: ['#f37b57', '#f6c14f', '#7bc6a4'] },
  { id: 'bloop', name: 'Bloop', kind: 'Slime', variants: ['#9ee39a', '#b59cf0', '#7fd1f0'] },
  { id: 'hazel', name: 'Hazel', kind: 'Hedgehog', variants: ['#a07a57', '#d6b48f', '#6d6a78'] },
  { id: 'button', name: 'Button', kind: 'Frog', variants: ['#7dcf7a', '#f2b24d', '#79b8ef'] },
  { id: 'clover', name: 'Clover', kind: 'Lamb', variants: ['#fbf7f0', '#f7d6e1', '#3e3a3f'] },
  { id: 'bramble', name: 'Bramble', kind: 'Fox', variants: ['#ee8a45', '#f3f0ea', '#8e8fa0'] },
  { id: 'pudding', name: 'Pudding', kind: 'Piglet', variants: ['#f7b8c4', '#e7c49b', '#b8a1d8'] },
  { id: 'tofu', name: 'Tofu', kind: 'Seal', variants: ['#d7dde6', '#f3efe7', '#8d97a6'] },
  { id: 'twinkle', name: 'Twinkle', kind: 'Star', variants: ['#ffd95a', '#ffb0d0', '#a9d8ff'] },
  { id: 'moss', name: 'Moss', kind: 'Mushroom', variants: ['#e85d5d', '#b48cde', '#e8a85d'] },
  { id: 'honey', name: 'Honey', kind: 'Bee', variants: ['#f6c945', '#f59fbd', '#9bd3f3'] },
  { id: 'juniper', name: 'Juniper', kind: 'Owlet', variants: ['#b08b6a', '#d9d4e6', '#7b90b5'] },
  { id: 'nugget', name: 'Nugget', kind: 'Hamster', variants: ['#f1c28f', '#f6efe3', '#c9a3a3'] },
  { id: 'marzi', name: 'Marzi', kind: 'Axolotl', variants: ['#f8b8cf', '#c5b3f2', '#f3e7b9'] },
  { id: 'figgy', name: 'Figgy', kind: 'Bat', variants: ['#6d5a8c', '#3b3645', '#9c7a6b'], eventOnly: true },
  { id: 'dewdrop', name: 'Dewdrop', kind: 'Jellyfish', variants: ['#a6d8f5', '#f5b6e0', '#c2f0c9'], eventOnly: true },
  { id: 'lovebug', name: 'Lovebug', kind: 'Ladybug', variants: ['#e8514f', '#f59ac2', '#f2c14a'], eventOnly: true },
  { id: 'drift', name: 'Drift', kind: 'Dragonlet', variants: ['#8fd1b4', '#b7a6ef', '#f4a988'], eventOnly: true },
];

export const SPECIES_MAP: Record<string, MicropetSpecies> = Object.fromEntries(MICROPET_SPECIES.map((s) => [s.id, s]));

export const NATURES = ['Cheerful', 'Gentle', 'Quiet', 'Loyal', 'Playful', 'Brave', 'Sleepy', 'Curious', 'Sassy', 'Dreamy'];
