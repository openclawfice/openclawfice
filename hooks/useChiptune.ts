'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Procedural chiptune background music engine.
 * Generates lo-fi 8-bit office music using Web Audio API.
 * No external files — pure synthesis.
 * 
 * Tracks:
 * 1. Melody (square wave) — chill, repeating 8-bar phrases
 * 2. Bass (triangle wave) — simple root note patterns
 * 3. Arps (square wave, quiet) — ambient sparkle
 * 4. Percussion (noise) — soft kick/hat pattern
 */

// Musical scales (MIDI note numbers)
const C_MAJOR = [60, 62, 64, 65, 67, 69, 71, 72]; // C D E F G A B C
const C_PENTA = [60, 62, 64, 67, 69, 72, 74, 76]; // C D E G A C D E (pentatonic, less tension)
const A_MINOR_PENTA = [57, 60, 62, 64, 67, 69, 72, 74]; // A C D E G A C D

// Chord progressions (as scale degree offsets from root)
const PROGRESSIONS = [
  [0, 3, 4, 4],   // I - IV - V - V (classic)
  [0, 3, 5, 4],   // I - IV - vi - V
  [0, 0, 3, 4],   // I - I - IV - V
  [0, 5, 3, 4],   // I - vi - IV - V (pop punk)
];

// Melody rhythm patterns (1 = note, 0 = rest, per 8th note)
const MELODY_RHYTHMS = [
  [1,0,1,0,1,0,0,1, 0,1,0,0,1,0,1,0],
  [1,0,0,1,0,1,1,0, 0,1,0,1,0,0,1,0],
  [1,1,0,0,1,0,1,0, 1,0,0,1,0,1,0,0],
  [0,1,0,1,1,0,0,1, 1,0,1,0,0,1,0,1],
];

// Bass patterns (scale degrees per beat)
const BASS_PATTERNS = [
  [0, -1, 0, 2],   // root, 7th below, root, 3rd
  [0, 0, 2, 0],    // root, root, 3rd, root
  [0, 4, 2, 0],    // root, 5th, 3rd, root  
  [0, 2, 4, 2],    // root, 3rd, 5th, 3rd
];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface MusicState {
  ctx: AudioContext;
  masterGain: GainNode;
  melodyGain: GainNode;
  bassGain: GainNode;
  arpGain: GainNode;
  percGain: GainNode;
  playing: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  step: number;
  bar: number;
  progression: number[];
  melodyRhythm: number[];
  bassPattern: number[];
  scale: number[];
  bpm: number;
}

function createMusicState(): MusicState | null {
  if (typeof window === 'undefined') return null;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.06; // Very quiet — background ambiance
    masterGain.connect(ctx.destination);

    // Channel gains
    const melodyGain = ctx.createGain();
    melodyGain.gain.value = 0.4;
    melodyGain.connect(masterGain);

    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.5;
    bassGain.connect(masterGain);

    const arpGain = ctx.createGain();
    arpGain.gain.value = 0.15;
    arpGain.connect(masterGain);

    const percGain = ctx.createGain();
    percGain.gain.value = 0.25;
    percGain.connect(masterGain);

    return {
      ctx,
      masterGain,
      melodyGain,
      bassGain,
      arpGain,
      percGain,
      playing: false,
      intervalId: null,
      step: 0,
      bar: 0,
      progression: PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)],
      melodyRhythm: MELODY_RHYTHMS[Math.floor(Math.random() * MELODY_RHYTHMS.length)],
      bassPattern: BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)],
      scale: C_PENTA,
      bpm: 85,
    };
  } catch {
    return null;
  }
}

function playNote(
  ctx: AudioContext,
  dest: GainNode,
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 1.0,
  delay: number = 0,
) {
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  
  // Soft attack, natural decay
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(volume, now + 0.01);
  env.gain.setValueAtTime(volume * 0.8, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc.connect(env);
  env.connect(dest);
  osc.start(now);
  osc.stop(now + duration);
}

function playNoiseDrum(
  ctx: AudioContext,
  dest: GainNode,
  duration: number,
  volume: number = 1.0,
  pitch: 'low' | 'high' = 'high',
) {
  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const env = ctx.createGain();
  env.gain.setValueAtTime(volume, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  // Filter for pitch
  const filter = ctx.createBiquadFilter();
  filter.type = pitch === 'low' ? 'lowpass' : 'highpass';
  filter.frequency.value = pitch === 'low' ? 150 : 8000;
  
  source.connect(filter);
  filter.connect(env);
  env.connect(dest);
  source.start(now);
}

function tick(state: MusicState) {
  const { ctx, scale, step, bar } = state;
  const stepsPerBar = 16; // 16 eighth notes per bar
  const localStep = step % stepsPerBar;
  const currentBar = Math.floor(step / stepsPerBar) % 4;
  
  // Current chord root (from progression)
  const chordDegree = state.progression[currentBar];
  const rootNote = scale[0] + (chordDegree >= 0 ? scale[chordDegree % scale.length] - scale[0] : -(scale[0] - scale[scale.length + chordDegree]));
  
  const eighthDur = 60 / state.bpm / 2; // Duration of one 8th note

  // === MELODY ===
  if (state.melodyRhythm[localStep]) {
    // Pick a note from the scale that's consonant with the chord
    const melodyDegree = (chordDegree + localStep * 3 + bar * 7) % scale.length;
    const melodyNote = scale[melodyDegree];
    playNote(ctx, state.melodyGain, midiToFreq(melodyNote), eighthDur * 1.5, 'square', 0.7);
  }

  // === BASS (every beat = every 2 eighth notes) ===
  if (localStep % 2 === 0) {
    const beatInBar = Math.floor(localStep / 2);
    const bassDegree = state.bassPattern[beatInBar % state.bassPattern.length];
    const bassNote = scale[0] - 12 + (bassDegree >= 0 ? bassDegree * 2 : bassDegree * 2); // One octave below
    playNote(ctx, state.bassGain, midiToFreq(scale[0] - 12 + bassDegree), eighthDur * 1.8, 'triangle', 0.8);
  }

  // === ARP (every other 8th note, offset) ===
  if (localStep % 3 === 1) {
    const arpDegree = (chordDegree + localStep * 2 + currentBar * 5) % scale.length;
    const arpNote = scale[arpDegree] + 12; // One octave above
    playNote(ctx, state.arpGain, midiToFreq(arpNote), eighthDur * 0.6, 'square', 0.3);
  }

  // === PERCUSSION ===
  // Kick on beats 1 and 3
  if (localStep === 0 || localStep === 8) {
    playNoiseDrum(ctx, state.percGain, 0.08, 0.6, 'low');
  }
  // Hi-hat on offbeats
  if (localStep % 4 === 2) {
    playNoiseDrum(ctx, state.percGain, 0.03, 0.2, 'high');
  }
  // Soft hat on every other 8th
  if (localStep % 2 === 1 && Math.random() > 0.4) {
    playNoiseDrum(ctx, state.percGain, 0.015, 0.08, 'high');
  }

  // Advance
  state.step = step + 1;
  
  // Every 4 bars, maybe change pattern
  if (state.step % (stepsPerBar * 4) === 0) {
    state.bar++;
    if (Math.random() > 0.5) {
      state.melodyRhythm = MELODY_RHYTHMS[Math.floor(Math.random() * MELODY_RHYTHMS.length)];
    }
    if (Math.random() > 0.7) {
      state.bassPattern = BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)];
    }
    // Rarely change progression
    if (Math.random() > 0.85) {
      state.progression = PROGRESSIONS[Math.floor(Math.random() * PROGRESSIONS.length)];
    }
  }
}

export function useChiptune() {
  const stateRef = useRef<MusicState | null>(null);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    if (stateRef.current?.playing) return;
    
    if (!stateRef.current) {
      stateRef.current = createMusicState();
    }
    const state = stateRef.current;
    if (!state) return;
    
    if (state.ctx.state === 'suspended') {
      state.ctx.resume();
    }
    
    // Fade in
    state.masterGain.gain.setValueAtTime(0, state.ctx.currentTime);
    state.masterGain.gain.linearRampToValueAtTime(0.06, state.ctx.currentTime + 1);
    
    const intervalMs = (60 / state.bpm / 2) * 1000; // 8th note interval
    state.intervalId = setInterval(() => tick(state), intervalMs);
    state.playing = true;
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    const state = stateRef.current;
    if (!state || !state.playing) return;
    
    // Fade out
    state.masterGain.gain.linearRampToValueAtTime(0, state.ctx.currentTime + 0.5);
    
    setTimeout(() => {
      if (state.intervalId) clearInterval(state.intervalId);
      state.playing = false;
      state.step = 0;
      setPlaying(false);
    }, 500);
  }, []);

  const toggle = useCallback(() => {
    if (stateRef.current?.playing) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const setVolume = useCallback((vol: number) => {
    if (stateRef.current) {
      stateRef.current.masterGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(0.15, vol)),
        stateRef.current.ctx.currentTime + 0.1
      );
    }
  }, []);

  return { playing, start, stop, toggle, setVolume };
}
