// Electric Piano Sampler using Tone.js
// Provides authentic Rhodes/Wurlitzer sound for StringsOrchestrator

import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let isInitialized = false;

export interface EPSamplerOptions {
  reverb?: number;
  chorus?: boolean;
  attack?: number;
  release?: number;
}

// Create and configure the EP synth with authentic electric piano sound
export async function getEPSampler(options: EPSamplerOptions = {}): Promise<Tone.PolySynth> {
  if (synth && isInitialized) {
    return synth;
  }

  // Create polyphonic FM synth with enhanced Rhodes/Wurlitzer-style voicing
  synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 14,
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: options.attack || 0.005,
      decay: 0.3,
      sustain: 0.4,
      release: options.release || 1.5
    },
    modulation: {
      type: 'square'
    },
    modulationEnvelope: {
      attack: 0.008,
      decay: 0.3,
      sustain: 0.1,
      release: 0.2
    }
  });

  synth.volume.value = -6;

  // Add reverb for ECM-style space
  if (options.reverb !== 0) {
    const reverb = new Tone.Reverb({
      decay: options.reverb || 2.5,
      wet: 0.35
    }).toDestination();

    await reverb.generate();
    synth.connect(reverb);
  } else {
    synth.toDestination();
  }

  // Add subtle chorus for warmth
  if (options.chorus) {
    const chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.3,
      wet: 0.25
    }).toDestination();

    synth.connect(chorus);
  }

  isInitialized = true;
  return synth;
}

// Initialize audio context (must be called on user interaction)
export async function initAudio(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
}

// Cleanup
export function disposeSampler(): void {
  if (synth) {
    synth.dispose();
    synth = null;
    isInitialized = false;
  }
}

// Play a single chord
export async function playChord(
  notes: string[],
  duration: number = 2,
  velocity: number = 0.8
): Promise<void> {
  const ep = await getEPSampler();
  const now = Tone.now();

  notes.forEach(note => {
    ep.triggerAttackRelease(note, duration, now, velocity);
  });
}

// Stop all notes
export function stopAll(): void {
  if (synth) {
    synth.releaseAll();
  }
}

export default {
  getEPSampler,
  initAudio,
  disposeSampler,
  playChord,
  stopAll
};
