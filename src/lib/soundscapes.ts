import { audioCtx } from './audio';

export interface SoundDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const SOUNDS: SoundDef[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', color: '#8fb3d9' },
  { id: 'storm', name: 'Thunderstorm', emoji: '⛈️', color: '#6f7fa8' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', color: '#6fc2d0' },
  { id: 'stream', name: 'Babbling Brook', emoji: '🏞️', color: '#86c7b0' },
  { id: 'forest', name: 'Forest Birds', emoji: '🌲', color: '#8fcf8f' },
  { id: 'wind', name: 'Wind', emoji: '🍃', color: '#b9d3c2' },
  { id: 'fire', name: 'Campfire', emoji: '🔥', color: '#f2a65a' },
  { id: 'night', name: 'Summer Night', emoji: '🦗', color: '#6d78b0' },
  { id: 'brown', name: 'Brown Noise', emoji: '🟫', color: '#b08b6a' },
  { id: 'pink', name: 'Pink Noise', emoji: '🩷', color: '#f2a7bf' },
  { id: 'white', name: 'White Noise', emoji: '⚪', color: '#c9ced6' },
  { id: 'fan', name: 'Cozy Fan', emoji: '🌀', color: '#a7c4c9' },
];

type NoiseColor = 'white' | 'pink' | 'brown';
const buffers: Partial<Record<NoiseColor, AudioBuffer>> = {};

function noiseBuffer(ac: AudioContext, color: NoiseColor): AudioBuffer {
  const cached = buffers[color];
  if (cached && cached.sampleRate === ac.sampleRate) return cached;
  const len = ac.sampleRate * 6;
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (color === 'white') d[i] = w * 0.5;
      else if (color === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    // Crossfade the loop seam.
    const fade = Math.floor(ac.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[i] = d[i] * t + d[len - fade + i] * (1 - t);
    }
  }
  buffers[color] = buf;
  return buf;
}

function noiseSource(ac: AudioContext, color: NoiseColor): AudioBufferSourceNode {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, color);
  src.loop = true;
  src.loopEnd = src.buffer.duration - 0.05;
  return src;
}

function filter(ac: AudioContext, type: BiquadFilterType, freq: number, q = 0.7): BiquadFilterNode {
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function lfo(ac: AudioContext, rate: number, depth: number, target: AudioParam, offset?: number): OscillatorNode {
  const o = ac.createOscillator();
  o.frequency.value = rate;
  const g = ac.createGain();
  g.gain.value = depth;
  o.connect(g).connect(target);
  if (offset !== undefined) target.value = offset;
  o.start();
  return o;
}

export interface Layer {
  stop: () => void;
  gain: GainNode;
}

/** Builds one soundscape layer into `out`. Returns a stopper. */
function build(id: string, ac: AudioContext, out: GainNode): () => void {
  const nodes: AudioScheduledSourceNode[] = [];
  const timers: number[] = [];
  const add = <T extends AudioScheduledSourceNode>(n: T) => {
    nodes.push(n);
    return n;
  };
  const every = (minMs: number, maxMs: number, fn: () => void) => {
    const loop = () => {
      fn();
      timers.push(window.setTimeout(loop, minMs + Math.random() * (maxMs - minMs)));
    };
    timers.push(window.setTimeout(loop, minMs + Math.random() * (maxMs - minMs)));
  };
  const burst = (color: NoiseColor, f: number, type: BiquadFilterType, dur: number, vol: number, q = 1) => {
    const src = noiseSource(ac, color);
    const fl = filter(ac, type, f, q);
    const g = ac.createGain();
    const t = ac.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl).connect(g).connect(out);
    src.start(t, Math.random() * 5);
    src.stop(t + dur + 0.05);
  };

  switch (id) {
    case 'white':
    case 'pink':
    case 'brown': {
      const src = add(noiseSource(ac, id));
      const g = ac.createGain();
      g.gain.value = id === 'white' ? 0.35 : id === 'pink' ? 0.6 : 0.8;
      src.connect(g).connect(out);
      src.start();
      break;
    }
    case 'fan': {
      const src = add(noiseSource(ac, 'brown'));
      const lp = filter(ac, 'lowpass', 700);
      const g = ac.createGain();
      g.gain.value = 0.9;
      src.connect(lp).connect(g).connect(out);
      src.start();
      const hum = add(ac.createOscillator());
      hum.frequency.value = 110;
      const hg = ac.createGain();
      hg.gain.value = 0.012;
      hum.connect(hg).connect(out);
      hum.start();
      nodes.push(lfo(ac, 7, 0.05, g.gain));
      break;
    }
    case 'rain':
    case 'storm': {
      const src = add(noiseSource(ac, 'pink'));
      const hp = filter(ac, 'highpass', 500);
      const lp = filter(ac, 'lowpass', 7000);
      const g = ac.createGain();
      g.gain.value = 0.55;
      src.connect(hp).connect(lp).connect(g).connect(out);
      src.start();
      every(20, 90, () => burst('white', 2500 + Math.random() * 4000, 'bandpass', 0.03 + Math.random() * 0.04, 0.05 + Math.random() * 0.08, 3));
      if (id === 'storm') {
        const low = add(noiseSource(ac, 'brown'));
        const lg = ac.createGain();
        lg.gain.value = 0.35;
        low.connect(filter(ac, 'lowpass', 300)).connect(lg).connect(out);
        low.start();
        every(9000, 22000, () => {
          const s = noiseSource(ac, 'brown');
          const fl = filter(ac, 'lowpass', 180);
          const gg = ac.createGain();
          const t = ac.currentTime;
          gg.gain.setValueAtTime(0, t);
          gg.gain.linearRampToValueAtTime(1.6, t + 0.3 + Math.random() * 0.5);
          gg.gain.exponentialRampToValueAtTime(0.0001, t + 4 + Math.random() * 3);
          s.connect(fl).connect(gg).connect(out);
          s.start(t, Math.random() * 5);
          s.stop(t + 8);
        });
      }
      break;
    }
    case 'ocean': {
      const src = add(noiseSource(ac, 'brown'));
      const lp = filter(ac, 'lowpass', 900);
      const g = ac.createGain();
      src.connect(lp).connect(g).connect(out);
      src.start();
      nodes.push(lfo(ac, 0.09, 0.45, g.gain, 0.55));
      const hiss = add(noiseSource(ac, 'pink'));
      const hg = ac.createGain();
      hiss.connect(filter(ac, 'highpass', 1500)).connect(hg).connect(out);
      hiss.start();
      nodes.push(lfo(ac, 0.09, 0.08, hg.gain, 0.09));
      nodes.push(lfo(ac, 0.05, 500, lp.frequency, 900));
      break;
    }
    case 'stream': {
      const src = add(noiseSource(ac, 'pink'));
      const bp = filter(ac, 'bandpass', 1400, 0.6);
      const g = ac.createGain();
      g.gain.value = 0.8;
      src.connect(bp).connect(g).connect(out);
      src.start();
      nodes.push(lfo(ac, 2.3, 500, bp.frequency, 1400));
      nodes.push(lfo(ac, 0.7, 0.15, g.gain, 0.75));
      every(80, 300, () => burst('white', 1500 + Math.random() * 2500, 'bandpass', 0.05, 0.04, 8));
      break;
    }
    case 'wind': {
      const src = add(noiseSource(ac, 'pink'));
      const bp = filter(ac, 'bandpass', 500, 0.9);
      const g = ac.createGain();
      src.connect(bp).connect(g).connect(out);
      src.start();
      nodes.push(lfo(ac, 0.07, 300, bp.frequency, 550));
      nodes.push(lfo(ac, 0.11, 0.35, g.gain, 0.55));
      break;
    }
    case 'fire': {
      const src = add(noiseSource(ac, 'brown'));
      const lp = filter(ac, 'lowpass', 500);
      const g = ac.createGain();
      g.gain.value = 0.7;
      src.connect(lp).connect(g).connect(out);
      src.start();
      every(40, 400, () => burst('white', 3000 + Math.random() * 3000, 'highpass', 0.01 + Math.random() * 0.03, 0.1 + Math.random() * 0.25));
      break;
    }
    case 'forest': {
      const src = add(noiseSource(ac, 'pink'));
      const bp = filter(ac, 'bandpass', 700, 0.8);
      const g = ac.createGain();
      g.gain.value = 0.18;
      src.connect(bp).connect(g).connect(out);
      src.start();
      nodes.push(lfo(ac, 0.08, 0.08, g.gain, 0.18));
      every(900, 3500, () => {
        const base = 2200 + Math.random() * 2000;
        const notes = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < notes; i++) {
          const o = ac.createOscillator();
          const og = ac.createGain();
          const t = ac.currentTime + i * (0.09 + Math.random() * 0.05);
          o.frequency.setValueAtTime(base, t);
          o.frequency.exponentialRampToValueAtTime(base * (0.7 + Math.random() * 0.8), t + 0.08);
          og.gain.setValueAtTime(0, t);
          og.gain.linearRampToValueAtTime(0.04, t + 0.01);
          og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          o.connect(og).connect(out);
          o.start(t);
          o.stop(t + 0.12);
        }
      });
      break;
    }
    case 'night': {
      const src = add(noiseSource(ac, 'brown'));
      const g = ac.createGain();
      g.gain.value = 0.2;
      src.connect(filter(ac, 'lowpass', 400)).connect(g).connect(out);
      src.start();
      every(400, 1600, () => {
        const f = 4200 + Math.random() * 800;
        const chirps = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < chirps; i++) {
          const o = ac.createOscillator();
          const og = ac.createGain();
          const t = ac.currentTime + i * 0.07;
          o.frequency.value = f;
          og.gain.setValueAtTime(0, t);
          og.gain.linearRampToValueAtTime(0.015, t + 0.005);
          og.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
          o.connect(og).connect(out);
          o.start(t);
          o.stop(t + 0.06);
        }
      });
      break;
    }
  }
  return () => {
    for (const t of timers) clearTimeout(t);
    for (const n of nodes) {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    }
  };
}

/** A mixer of soundscape layers with individual volumes and a master fade. */
export class SoundMixer {
  private master: GainNode;
  private layers = new Map<string, { stop: () => void; gain: GainNode }>();

  constructor(volume = 0.8) {
    const ac = audioCtx();
    this.master = ac.createGain();
    this.master.gain.value = volume;
    this.master.connect(ac.destination);
  }

  has(id: string) {
    return this.layers.has(id);
  }

  ids() {
    return [...this.layers.keys()];
  }

  add(id: string, volume = 0.7) {
    if (this.layers.has(id)) return;
    const ac = audioCtx();
    const g = ac.createGain();
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(volume, ac.currentTime + 1.5);
    g.connect(this.master);
    const stop = build(id, ac, g);
    this.layers.set(id, { stop, gain: g });
  }

  remove(id: string) {
    const layer = this.layers.get(id);
    if (!layer) return;
    const ac = audioCtx();
    layer.gain.gain.cancelScheduledValues(ac.currentTime);
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, ac.currentTime);
    layer.gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8);
    this.layers.delete(id);
    setTimeout(() => {
      layer.stop();
      layer.gain.disconnect();
    }, 900);
  }

  setVolume(id: string, v: number) {
    const layer = this.layers.get(id);
    if (layer) layer.gain.gain.setTargetAtTime(v, audioCtx().currentTime, 0.1);
  }

  setMaster(v: number) {
    this.master.gain.setTargetAtTime(v, audioCtx().currentTime, 0.1);
  }

  stopAll(fadeSec = 1) {
    const ac = audioCtx();
    this.master.gain.cancelScheduledValues(ac.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ac.currentTime);
    this.master.gain.linearRampToValueAtTime(0, ac.currentTime + fadeSec);
    const layers = [...this.layers.values()];
    this.layers.clear();
    setTimeout(() => {
      for (const l of layers) l.stop();
      this.master.disconnect();
    }, fadeSec * 1000 + 100);
  }
}
