export const PALETTE: Record<string, { name: string; hex: string }> = {
  cream: { name: 'Cream', hex: '#f6ecd9' },
  white: { name: 'Snow', hex: '#fbfbf8' },
  blush: { name: 'Blush', hex: '#f7c6cf' },
  pink: { name: 'Pink', hex: '#f29bb5' },
  rose: { name: 'Rose', hex: '#e56b8c' },
  red: { name: 'Cherry', hex: '#d9534f' },
  coral: { name: 'Coral', hex: '#f28b72' },
  orange: { name: 'Tangerine', hex: '#f5a04e' },
  peach: { name: 'Peach', hex: '#f9c79f' },
  mustard: { name: 'Mustard', hex: '#e0b04a' },
  yellow: { name: 'Sunny', hex: '#f7d95c' },
  lime: { name: 'Lime', hex: '#b8d86b' },
  mint: { name: 'Mint', hex: '#a8e0c5' },
  sage: { name: 'Sage', hex: '#9cb99a' },
  green: { name: 'Leaf', hex: '#5fa86d' },
  forest: { name: 'Forest', hex: '#3f7a52' },
  teal: { name: 'Teal', hex: '#4aa7a3' },
  sky: { name: 'Sky', hex: '#8cc8ec' },
  blue: { name: 'Blue', hex: '#5b8fd9' },
  navy: { name: 'Navy', hex: '#34466e' },
  lavender: { name: 'Lavender', hex: '#c3b3ec' },
  purple: { name: 'Grape', hex: '#8d6cc9' },
  plum: { name: 'Plum', hex: '#7a3f6e' },
  brown: { name: 'Cocoa', hex: '#8b5e3c' },
  tan: { name: 'Tan', hex: '#cfa77a' },
  gray: { name: 'Pebble', hex: '#a9adb5' },
  charcoal: { name: 'Charcoal', hex: '#4b4f58' },
  black: { name: 'Ink', hex: '#2b2b30' },
  gold: { name: 'Gold', hex: '#e6bf4c' },
  silver: { name: 'Silver', hex: '#c9ced6' },
};

export type PaletteKey = keyof typeof PALETTE;

export function hex(key: string): string {
  return PALETTE[key]?.hex ?? key;
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function toRgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

/** Mix a color toward black (amt > 0) or white (amt < 0). */
export function shade(h: string, amt: number): string {
  const [r, g, b] = toRgb(h);
  if (amt >= 0) return toHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
  const t = -amt;
  return toHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

export function luminance(h: string): number {
  const [r, g, b] = toRgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function readableOn(h: string): string {
  return luminance(h) > 0.6 ? '#3a3530' : '#ffffff';
}
