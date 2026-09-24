let ctx: AudioContext | null = null;

export function audioCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

type ChimeKind = 'complete' | 'coin' | 'adventure' | 'pat' | 'bell' | 'undo' | 'hatch';

const CHIMES: Record<ChimeKind, { f: number; t: number; d: number; type?: OscillatorType; v?: number }[]> = {
  complete: [
    { f: 784, t: 0, d: 0.18 },
    { f: 1175, t: 0.08, d: 0.3 },
  ],
  coin: [
    { f: 1319, t: 0, d: 0.1, type: 'square', v: 0.05 },
    { f: 1760, t: 0.07, d: 0.2, type: 'square', v: 0.05 },
  ],
  adventure: [
    { f: 523, t: 0, d: 0.2 },
    { f: 659, t: 0.12, d: 0.2 },
    { f: 784, t: 0.24, d: 0.2 },
    { f: 1047, t: 0.36, d: 0.5 },
  ],
  pat: [{ f: 1400, t: 0, d: 0.06, type: 'sine', v: 0.06 }],
  bell: [
    { f: 528, t: 0, d: 2.5, v: 0.18 },
    { f: 1056, t: 0, d: 1.6, v: 0.06 },
  ],
  undo: [
    { f: 600, t: 0, d: 0.12 },
    { f: 440, t: 0.08, d: 0.18 },
  ],
  hatch: [
    { f: 659, t: 0, d: 0.15 },
    { f: 880, t: 0.1, d: 0.15 },
    { f: 1175, t: 0.2, d: 0.15 },
    { f: 1568, t: 0.3, d: 0.5 },
  ],
};

let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function chime(kind: ChimeKind, force = false) {
  if (!enabled && !force) return;
  try {
    const ac = audioCtx();
    const now = ac.currentTime;
    for (const n of CHIMES[kind]) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = n.type ?? 'sine';
      osc.frequency.value = n.f;
      g.gain.setValueAtTime(0, now + n.t);
      g.gain.linearRampToValueAtTime(n.v ?? 0.12, now + n.t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
      osc.connect(g).connect(ac.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    }
  } catch {
    // Audio can fail before a user gesture; ignore.
  }
}
