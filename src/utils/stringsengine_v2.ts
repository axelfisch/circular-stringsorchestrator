// StringsEngine V2 - Professional Strings Orchestra Engine for StringsOrchestrator
// Implements AiXEL orchestration rules with 6-voice string ensemble
// Enhanced with Voicing Blueprints for optimal tension distribution
// by AxelFisch©2025/2026

import * as Tone from 'tone';
import orchestrationRules from '../data/AiXEL_StringsOrchestrationRules.json';

// ============================================================================
// AIXEL VOICING BLUEPRINTS - From AIXEL_MASTER_MODEL_2025_FULL
// Centre des voicings = 3e & 7e ; Extensions (9/#11/13) en couronne (aigus)
// ============================================================================

// Interval semitones from root
const INTERVALS = {
  'R': 0, '1': 0,
  'b2': 1, '2': 2, '9': 14, 'b9': 13, '#9': 15,
  'b3': 3, '3': 4,
  '4': 5, '11': 17, '#11': 18,
  'b5': 6, '5': 7, '#5': 8, '5+': 8,
  'b6': 8, '6': 9, '13': 21, 'b13': 20,
  'b7': 10, '7': 11, 'maj7': 11, '7+': 11
};

// Voicing blueprints from AiXEL profile
// Order: from bass to soprano (how notes should be stacked)
const VOICING_BLUEPRINTS: Record<string, { intervals: number[], description: string }> = {
  // Major chords
  'maj': { 
    intervals: [0, 7, 4, 12], // R, 5, 3, R(8va)
    description: 'Basic major triad - open voicing'
  },
  'maj7': { 
    intervals: [0, 11, 4, 7], // R, 7, 3, 5
    description: 'Major 7th - 3&7 center'
  },
  'maj9': { 
    intervals: [0, 11, 4, 14], // R, 7, 3, 9
    description: 'Major 9 - 9 in soprano'
  },
  'maj9(11+)': { 
    intervals: [0, 11, 4, 14, 18], // R, 7, 3, 9, #11
    description: 'Lydian maj9 - #11 crown'
  },
  'maj7(11+)': { 
    intervals: [0, 11, 4, 18], // R, 7, 3, #11
    description: 'Lydian maj7 - #11 top'
  },
  'maj13(11+)': { 
    intervals: [0, 11, 4, 18, 21], // R, 7, 3, #11, 13
    description: 'Full Lydian - tensions crown'
  },
  'add9': { 
    intervals: [0, 4, 7, 14], // R, 3, 5, 9
    description: 'Add9 - 9 soprano'
  },
  'maj7(5+)': { 
    intervals: [0, 11, 4, 8], // R, 7, 3, #5
    description: 'Augmented maj7'
  },

  // Minor chords - Dorian flavor
  'min': { 
    intervals: [0, 7, 3, 12], // R, 5, b3, R(8va)
    description: 'Basic minor triad'
  },
  'min7': { 
    intervals: [0, 10, 3, 7], // R, b7, b3, 5
    description: 'Minor 7 - b3&b7 center'
  },
  'min9': { 
    intervals: [0, 10, 3, 14], // R, b7, b3, 9
    description: 'Dorian m9 - 9 soprano'
  },
  'min11': { 
    intervals: [0, 10, 3, 14, 17], // R, b7, b3, 9, 11
    description: 'Dorian m11 - 11 crown'
  },
  'min9(7+)': { 
    intervals: [0, 11, 3, 14], // R, maj7, b3, 9
    description: 'Minor-major 9 - melodic minor'
  },
  'min(7+)': { 
    intervals: [0, 11, 3, 7], // R, maj7, b3, 5
    description: 'Minor-major 7'
  },
  'min(add9)': { 
    intervals: [0, 3, 7, 14], // R, b3, 5, 9
    description: 'Minor add9'
  },
  'min6': { 
    intervals: [0, 9, 3, 7], // R, 6, b3, 5
    description: 'Minor 6 - Dorian color'
  },

  // Half-diminished - Locrian #2
  'min7(b5)': { 
    intervals: [0, 10, 3, 6], // R, b7, b3, b5
    description: 'Half-dim basic'
  },
  'min9(b5)': { 
    intervals: [0, 10, 3, 6, 14], // R, b7, b3, b5, 9
    description: 'Half-dim with 9 - Locrian #2'
  },

  // Dominant 7 chords - Lydian Dominant flavor
  '7': { 
    intervals: [0, 10, 4, 7], // R, b7, 3, 5
    description: 'Dom7 basic - 3&b7 center'
  },
  '9': { 
    intervals: [0, 10, 4, 14], // R, b7, 3, 9
    description: 'Dom9 - 9 soprano'
  },
  '11': { 
    intervals: [0, 10, 17, 14], // R, b7, 11, 9 (omit 3)
    description: 'Dom11 - sus quality'
  },
  '13': { 
    intervals: [0, 10, 4, 14, 21], // R, b7, 3, 9, 13
    description: 'Dom13 - 13 crown'
  },
  '7(9,13)': { 
    intervals: [0, 10, 4, 14, 21], // R, b7, 3, 9, 13
    description: 'Mixolydian 13'
  },
  '7(11+,13)': { 
    intervals: [0, 10, 4, 18, 21], // R, b7, 3, #11, 13
    description: 'Lydian Dominant - #11&13 crown'
  },
  '13(b5)': { 
    intervals: [0, 10, 4, 6, 21], // R, b7, 3, b5, 13
    description: 'Altered 13'
  },
  '7(b9)': { 
    intervals: [0, 10, 4, 13], // R, b7, 3, b9
    description: 'Dom7b9 - HM5 scale'
  },
  '13(b9)': { 
    intervals: [0, 10, 4, 13, 21], // R, b7, 3, b9, 13
    description: 'Dom13b9 - soft altered'
  },
  '7(9+5+)': { 
    intervals: [0, 10, 4, 8, 15], // R, b7, 3, #5, #9
    description: 'Altered dominant'
  },

  // Suspended chords
  'sus4': { 
    intervals: [0, 7, 5, 12], // R, 5, 4, R(8va)
    description: 'Sus4 basic'
  },
  'sus2': { 
    intervals: [0, 7, 2, 12], // R, 5, 2, R(8va)
    description: 'Sus2 basic'
  },
  '7sus4': { 
    intervals: [0, 10, 5, 7], // R, b7, 4, 5
    description: 'Dom7sus4'
  },
  '7sus4(b9)': { 
    intervals: [0, 10, 5, 13], // R, b7, 4, b9
    description: 'Phrygian sus - b9 soprano'
  },
  'sus13': { 
    intervals: [0, 10, 5, 14, 21], // R, b7, 4, 9, 13
    description: 'Sus13 - full extensions'
  },
  'sus4(9,13)': { 
    intervals: [0, 10, 5, 14, 21], // R, b7, 4, 9, 13
    description: 'Rich sus voicing'
  },

  // Diminished
  'dim': { 
    intervals: [0, 6, 3, 9], // R, b5, b3, 6(bb7)
    description: 'Dim7 passing chord'
  },
  'dim7': { 
    intervals: [0, 6, 3, 9], // R, b5, b3, bb7
    description: 'Full diminished'
  }
};

// Voice ranges in MIDI notes - refined for AiXEL style
const VOICE_RANGES = {
  Violin1:    { min: 55, max: 96, optimal: 79, role: 'melody/tensions' },     // G3 to C7
  Violin2:    { min: 55, max: 91, optimal: 74, role: 'harmony/tensions' },    // G3 to G6
  Viola1:     { min: 48, max: 84, optimal: 67, role: '3rd&7th center' },      // C3 to C6
  Viola2:     { min: 48, max: 81, optimal: 62, role: '3rd&7th center' },      // C3 to A5
  Cello:      { min: 36, max: 72, optimal: 55, role: 'countermelody' },       // C2 to C5
  Contrabass: { min: 28, max: 55, optimal: 43, role: 'bass foundation' }      // E1 to G3
};

// String synth configuration for realistic sound
const STRING_SYNTH_CONFIG = {
  Violin1: {
    oscillator: { type: 'fatsawtooth' as const, count: 3, spread: 20 },
    envelope: { attack: 0.12, decay: 0.25, sustain: 0.82, release: 1.1 },
    filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.55, release: 0.9, baseFrequency: 2200, octaves: 2.2 },
    volume: -7
  },
  Violin2: {
    oscillator: { type: 'fatsawtooth' as const, count: 3, spread: 25 },
    envelope: { attack: 0.15, decay: 0.28, sustain: 0.78, release: 1.2 },
    filterEnvelope: { attack: 0.08, decay: 0.22, sustain: 0.5, release: 1.0, baseFrequency: 1900, octaves: 2 },
    volume: -9
  },
  Viola1: {
    oscillator: { type: 'fatsawtooth' as const, count: 3, spread: 28 },
    envelope: { attack: 0.18, decay: 0.32, sustain: 0.72, release: 1.3 },
    filterEnvelope: { attack: 0.1, decay: 0.25, sustain: 0.45, release: 1.1, baseFrequency: 1600, octaves: 2 },
    volume: -10
  },
  Viola2: {
    oscillator: { type: 'fatsawtooth' as const, count: 3, spread: 30 },
    envelope: { attack: 0.2, decay: 0.35, sustain: 0.7, release: 1.35 },
    filterEnvelope: { attack: 0.12, decay: 0.26, sustain: 0.42, release: 1.1, baseFrequency: 1450, octaves: 2 },
    volume: -11
  },
  Cello: {
    oscillator: { type: 'fatsawtooth' as const, count: 3, spread: 32 },
    envelope: { attack: 0.22, decay: 0.38, sustain: 0.68, release: 1.5 },
    filterEnvelope: { attack: 0.14, decay: 0.3, sustain: 0.38, release: 1.2, baseFrequency: 1100, octaves: 2.3 },
    volume: -8
  },
  Contrabass: {
    oscillator: { type: 'fatsawtooth' as const, count: 2, spread: 15 },
    envelope: { attack: 0.28, decay: 0.45, sustain: 0.62, release: 1.8 },
    filterEnvelope: { attack: 0.18, decay: 0.35, sustain: 0.32, release: 1.4, baseFrequency: 650, octaves: 2 },
    volume: -6
  }
};

type VoiceName = keyof typeof VOICE_RANGES;

export interface OrchestratedVoice {
  voice: VoiceName;
  midiNote: number;
  noteName: string;
  role: 'melody' | 'countermelody' | 'harmony' | 'bass' | 'tension';
  intervalName?: string;
}

export interface OrchestrationResult {
  voices: OrchestratedVoice[];
  chordSymbol: string;
  voicingType: string;
  blueprint: string;
}

export interface ChordAnalysis {
  root: number;
  rootName: string;
  quality: string;
  blueprint: number[];
  description: string;
}

export class StringsEngine {
  private synths: Map<VoiceName, Tone.PolySynth> = new Map();
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;
  private limiter: Tone.Limiter | null = null;
  private initialized = false;
  private isPlaying = false;
  private scheduledEvents: number[] = [];
  private lastVoicing: OrchestratedVoice[] = [];

  constructor() {
    // Initialization happens in initialize()
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    // Master effects chain - ECM style reverb
    this.limiter = new Tone.Limiter(-2).toDestination();
    this.compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 2.5,
      attack: 0.08,
      release: 0.25
    }).connect(this.limiter);

    this.reverb = new Tone.Reverb({
      decay: 4.0,
      wet: 0.38,
      preDelay: 0.025
    }).connect(this.compressor);

    await this.reverb.generate();

    // Create synths for each voice
    const voiceNames: VoiceName[] = ['Violin1', 'Violin2', 'Viola1', 'Viola2', 'Cello', 'Contrabass'];
    
    for (const voiceName of voiceNames) {
      const config = STRING_SYNTH_CONFIG[voiceName];
      
      const synth = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: config.oscillator,
        envelope: config.envelope,
        filterEnvelope: config.filterEnvelope
      });

      synth.volume.value = config.volume;
      synth.connect(this.reverb!);
      
      this.synths.set(voiceName, synth);
    }

    this.initialized = true;
    console.log('🎻 StringsEngine V2 initialized with AiXEL Voicing Blueprints');
  }

  private midiToNote(midi: number): string {
    return Tone.Frequency(midi, 'midi').toNote();
  }

  // ============================================================================
  // CHORD ANALYSIS - Detect chord type and select appropriate blueprint
  // ============================================================================
  
  analyzeChordSymbol(symbol: string): ChordAnalysis {
    const noteToMidi: Record<string, number> = {
      'C': 60, 'Db': 61, 'D': 62, 'Eb': 63, 'E': 64, 'F': 65,
      'F#': 66, 'Gb': 66, 'G': 67, 'Ab': 68, 'A': 69, 'Bb': 70, 'B': 71
    };

    // Extract root note
    const rootMatch = symbol.match(/^([A-G][b#]?)/);
    const rootName = rootMatch ? rootMatch[1] : 'C';
    const root = noteToMidi[rootName] || 60;

    // Extract quality/extension
    const extension = symbol.replace(/^[A-G][b#]?/, '').toLowerCase();
    
    // Find matching blueprint
    const blueprintKey = this.findBlueprintKey(extension);
    const blueprint = VOICING_BLUEPRINTS[blueprintKey];

    return {
      root,
      rootName,
      quality: blueprintKey,
      blueprint: blueprint.intervals,
      description: blueprint.description
    };
  }

  private findBlueprintKey(extension: string): string {
    const ext = extension.toLowerCase().trim();
    
    // Exact matches first
    if (VOICING_BLUEPRINTS[ext]) return ext;

    // Major variants
    if (ext === '' || ext === 'maj' || ext === 'major') return 'maj';
    if (ext.includes('maj9(11+)') || ext.includes('maj9(#11)')) return 'maj9(11+)';
    if (ext.includes('maj13(11+)') || ext.includes('maj13(#11)')) return 'maj13(11+)';
    if (ext.includes('maj7(11+)') || ext.includes('maj7(#11)')) return 'maj7(11+)';
    if (ext.includes('maj7(5+)') || ext.includes('maj7#5')) return 'maj7(5+)';
    if (ext.includes('maj9')) return 'maj9';
    if (ext.includes('maj7') || ext.includes('ma7') || ext.includes('Δ')) return 'maj7';
    if (ext.includes('add9')) return 'add9';

    // Minor variants
    if (ext.includes('min9(7+)') || ext.includes('m9(maj7)')) return 'min9(7+)';
    if (ext.includes('min(7+)') || ext.includes('m(maj7)') || ext.includes('mmaj7')) return 'min(7+)';
    if (ext.includes('min9(b5)') || ext.includes('m9(b5)') || ext.includes('ø9')) return 'min9(b5)';
    if (ext.includes('min7(b5)') || ext.includes('m7b5') || ext.includes('ø')) return 'min7(b5)';
    if (ext.includes('min11') || ext.includes('m11')) return 'min11';
    if (ext.includes('min9') || ext.includes('m9')) return 'min9';
    if (ext.includes('min7') || ext.includes('m7') || ext.includes('-7')) return 'min7';
    if (ext.includes('min6') || ext.includes('m6')) return 'min6';
    if (ext.includes('min(add9)') || ext.includes('m(add9)')) return 'min(add9)';
    if (ext.includes('min') || ext.includes('m') || ext === '-') return 'min';

    // Dominant variants
    if (ext.includes('13(b9)')) return '13(b9)';
    if (ext.includes('13(b5)')) return '13(b5)';
    if (ext.includes('7(9+5+)') || ext.includes('7alt') || ext.includes('7#9#5')) return '7(9+5+)';
    if (ext.includes('7(11+,13)') || ext.includes('7(#11,13)')) return '7(11+,13)';
    if (ext.includes('7(b9)') || ext.includes('7b9')) return '7(b9)';
    if (ext.includes('13')) return '13';
    if (ext.includes('11') && !ext.includes('#11')) return '11';
    if (ext.includes('9') && !ext.includes('b9') && !ext.includes('#9')) return '9';
    if (ext.includes('7') && !ext.includes('maj7') && !ext.includes('7+')) return '7';

    // Suspended
    if (ext.includes('sus13')) return 'sus13';
    if (ext.includes('7sus4(b9)')) return '7sus4(b9)';
    if (ext.includes('7sus4') || ext.includes('7sus')) return '7sus4';
    if (ext.includes('sus4(9,13)')) return 'sus4(9,13)';
    if (ext.includes('sus4')) return 'sus4';
    if (ext.includes('sus2')) return 'sus2';

    // Diminished
    if (ext.includes('dim7') || ext.includes('o7') || ext.includes('°7')) return 'dim7';
    if (ext.includes('dim') || ext.includes('o') || ext.includes('°')) return 'dim';

    // Default to major 7 for jazz context
    return 'maj7';
  }

  // ============================================================================
  // ORCHESTRATION - Apply AiXEL voicing blueprints to 6-voice ensemble
  // ============================================================================

  orchestrateChord(midiNotes: number[], chordSymbol: string): OrchestrationResult {
    const analysis = this.analyzeChordSymbol(chordSymbol);
    const voices: OrchestratedVoice[] = [];

    // Build voicing from blueprint
    const voicingNotes = analysis.blueprint.map(interval => analysis.root + interval);
    
    // Ensure we have enough notes for 6 voices
    const expandedNotes = this.expandVoicing(voicingNotes, analysis.root);

    // Distribute according to AiXEL rules:
    // - Contrabass: Root (1-2 octaves down)
    // - Cello: Root or 5th (countermelody voice)
    // - Viola2: 3rd or 7th (center of voicing)
    // - Viola1: 3rd or 7th (center of voicing)
    // - Violin2: Extension (9, 11) 
    // - Violin1: Highest tension (#11, 13) or melody

    // 1. CONTRABASS - Deep foundation
    const bassNote = this.fitToRange(analysis.root - 24, 'Contrabass');
    voices.push({
      voice: 'Contrabass',
      midiNote: bassNote,
      noteName: this.midiToNote(bassNote),
      role: 'bass',
      intervalName: 'R'
    });

    // 2. CELLO - Countermelody (root or 5th, can move)
    const celloInterval = expandedNotes.find(n => (n - analysis.root) % 12 === 7) || analysis.root;
    const celloNote = this.fitToRange(celloInterval - 12, 'Cello');
    voices.push({
      voice: 'Cello',
      midiNote: celloNote,
      noteName: this.midiToNote(celloNote),
      role: 'countermelody',
      intervalName: this.getIntervalName(celloNote - analysis.root)
    });

    // 3 & 4. VIOLAS - Center of voicing (3rd & 7th)
    const third = expandedNotes.find(n => [3, 4].includes((n - analysis.root) % 12));
    const seventh = expandedNotes.find(n => [10, 11].includes((n - analysis.root) % 12));

    const viola2Note = this.fitToRange(third || analysis.root + 4, 'Viola2');
    voices.push({
      voice: 'Viola2',
      midiNote: viola2Note,
      noteName: this.midiToNote(viola2Note),
      role: 'harmony',
      intervalName: this.getIntervalName(viola2Note - analysis.root)
    });

    const viola1Note = this.fitToRange(seventh || analysis.root + 11, 'Viola1');
    voices.push({
      voice: 'Viola1',
      midiNote: viola1Note,
      noteName: this.midiToNote(viola1Note),
      role: 'harmony',
      intervalName: this.getIntervalName(viola1Note - analysis.root)
    });

    // 5. VIOLIN2 - First extension (9, 11)
    const firstExtension = expandedNotes.find(n => {
      const interval = (n - analysis.root) % 12;
      return [2, 5, 9].includes(interval); // 9, 11, or 13
    });
    const violin2Note = this.fitToRange(
      firstExtension || analysis.root + 14, // Default to 9
      'Violin2'
    );
    voices.push({
      voice: 'Violin2',
      midiNote: violin2Note,
      noteName: this.midiToNote(violin2Note),
      role: 'tension',
      intervalName: this.getIntervalName(violin2Note - analysis.root)
    });

    // 6. VIOLIN1 - Highest tension (#11, 13) - Crown of voicing
    const highestTension = expandedNotes.reduce((highest, note) => {
      return note > highest ? note : highest;
    }, expandedNotes[0]);
    
    const violin1Note = this.fitToRange(highestTension + 12, 'Violin1');
    voices.push({
      voice: 'Violin1',
      midiNote: violin1Note,
      noteName: this.midiToNote(violin1Note),
      role: 'melody',
      intervalName: this.getIntervalName(violin1Note - analysis.root)
    });

    // Apply voice leading rules
    this.applyVoiceLeading(voices);

    // Store for voice leading continuity
    this.lastVoicing = [...voices];

    return {
      voices,
      chordSymbol,
      voicingType: analysis.quality,
      blueprint: analysis.description
    };
  }

  private expandVoicing(notes: number[], root: number): number[] {
    const expanded = [...notes];
    
    // Ensure we have at least 6 distinct pitch classes
    while (expanded.length < 6) {
      // Add octave doublings strategically
      const toDouble = expanded[expanded.length % notes.length];
      expanded.push(toDouble + 12);
    }

    return expanded.sort((a, b) => a - b);
  }

  private getIntervalName(semitones: number): string {
    const normalized = ((semitones % 12) + 12) % 12;
    const names: Record<number, string> = {
      0: 'R', 1: 'b9', 2: '9', 3: 'b3', 4: '3', 5: '11',
      6: '#11', 7: '5', 8: '#5', 9: '13', 10: 'b7', 11: '7'
    };
    
    // Handle compound intervals
    if (semitones >= 12) {
      const compound = names[normalized];
      if (['9', 'b9', '#9'].includes(compound)) return compound;
      if (compound === '11' || compound === '#11') return compound;
      if (compound === '13') return compound;
    }
    
    return names[normalized] || '?';
  }

  private fitToRange(midi: number, voice: VoiceName): number {
    const range = VOICE_RANGES[voice];
    let note = midi;

    while (note < range.min) note += 12;
    while (note > range.max) note -= 12;

    if (note < range.min) note = range.min;
    if (note > range.max) note = range.max;

    return note;
  }

  // ============================================================================
  // VOICE LEADING - Smooth transitions between chords
  // ============================================================================

  private applyVoiceLeading(voices: OrchestratedVoice[]): void {
    // Sort by expected register
    const voiceOrder: VoiceName[] = ['Contrabass', 'Cello', 'Viola2', 'Viola1', 'Violin2', 'Violin1'];
    
    // Ensure minimum spacing (minor 3rd = 3 semitones) in harmony voices
    for (let i = 2; i < voices.length - 1; i++) {
      const lower = voices.find(v => v.voice === voiceOrder[i]);
      const upper = voices.find(v => v.voice === voiceOrder[i + 1]);
      
      if (lower && upper) {
        const interval = upper.midiNote - lower.midiNote;
        
        // Min spacing: 3 semitones (minor 3rd)
        if (interval < 3 && interval > 0) {
          upper.midiNote = lower.midiNote + 3;
          upper.noteName = this.midiToNote(upper.midiNote);
        }
        
        // Max spacing: 16 semitones (major 10th) for inner voices
        if (interval > 16) {
          upper.midiNote = lower.midiNote + 12;
          upper.noteName = this.midiToNote(upper.midiNote);
        }
      }
    }

    // If we have previous voicing, minimize movement
    if (this.lastVoicing.length > 0) {
      for (const voice of voices) {
        const lastNote = this.lastVoicing.find(v => v.voice === voice.voice);
        if (lastNote && voice.role === 'harmony') {
          // Try to minimize leap (prefer stepwise motion)
          const currentInterval = Math.abs(voice.midiNote - lastNote.midiNote);
          if (currentInterval > 6) {
            // Try octave shift to get closer
            const altUp = voice.midiNote + 12;
            const altDown = voice.midiNote - 12;
            const range = VOICE_RANGES[voice.voice];
            
            if (altDown >= range.min && Math.abs(altDown - lastNote.midiNote) < currentInterval) {
              voice.midiNote = altDown;
              voice.noteName = this.midiToNote(altDown);
            } else if (altUp <= range.max && Math.abs(altUp - lastNote.midiNote) < currentInterval) {
              voice.midiNote = altUp;
              voice.noteName = this.midiToNote(altUp);
            }
          }
        }
      }
    }
  }

  // ============================================================================
  // PLAYBACK
  // ============================================================================

  async playChord(midiNotes: number[], chordSymbol: string, duration: number = 2): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const orchestration = this.orchestrateChord(midiNotes, chordSymbol);
    const now = Tone.now();

    // Humanization with role-based timing
    orchestration.voices.forEach((voice) => {
      const synth = this.synths.get(voice.voice);
      if (synth) {
        // Bass enters first, tensions last (arpeggiate feel)
        let humanize = 0;
        switch (voice.role) {
          case 'bass': humanize = 0; break;
          case 'countermelody': humanize = 0.01 + Math.random() * 0.015; break;
          case 'harmony': humanize = 0.02 + Math.random() * 0.02; break;
          case 'tension': humanize = 0.03 + Math.random() * 0.02; break;
          case 'melody': humanize = 0.035 + Math.random() * 0.02; break;
        }
        
        // Velocity based on role
        let velocity = 0.7;
        switch (voice.role) {
          case 'bass': velocity = 0.75; break;
          case 'countermelody': velocity = 0.72; break;
          case 'harmony': velocity = 0.65; break;
          case 'tension': velocity = 0.68; break;
          case 'melody': velocity = 0.78; break;
        }
        velocity += Math.random() * 0.1;

        synth.triggerAttackRelease(
          voice.noteName,
          duration,
          now + humanize,
          velocity
        );
      }
    });

    console.log(`🎻 Playing: ${chordSymbol} [${orchestration.voicingType}]`);
    console.log(`   Blueprint: ${orchestration.blueprint}`);
    orchestration.voices.forEach(v => 
      console.log(`   ${v.voice}: ${v.noteName} (${v.intervalName}) - ${v.role}`)
    );
  }

  triggerAttack(midiNotes: number[], chordSymbol: string): OrchestrationResult {
    const orchestration = this.orchestrateChord(midiNotes, chordSymbol);
    const now = Tone.now();

    orchestration.voices.forEach((voice) => {
      const synth = this.synths.get(voice.voice);
      if (synth) {
        let humanize = 0;
        switch (voice.role) {
          case 'bass': humanize = 0; break;
          case 'countermelody': humanize = 0.008; break;
          case 'harmony': humanize = 0.015 + Math.random() * 0.01; break;
          case 'tension': humanize = 0.02 + Math.random() * 0.015; break;
          case 'melody': humanize = 0.025 + Math.random() * 0.015; break;
        }

        let velocity = 0.7 + Math.random() * 0.1;
        if (voice.role === 'melody') velocity += 0.05;
        if (voice.role === 'bass') velocity += 0.03;

        synth.triggerAttack(voice.noteName, now + humanize, velocity);
      }
    });

    return orchestration;
  }

  releaseAll(): void {
    this.synths.forEach(synth => {
      synth.releaseAll();
    });
  }

  stop(): void {
    this.isPlaying = false;
    this.releaseAll();
    
    this.scheduledEvents.forEach(id => {
      Tone.Transport.clear(id);
    });
    this.scheduledEvents = [];
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  getOrchestrationRules(): typeof orchestrationRules {
    return orchestrationRules;
  }

  getVoiceRanges(): typeof VOICE_RANGES {
    return VOICE_RANGES;
  }

  getVoicingBlueprints(): typeof VOICING_BLUEPRINTS {
    return VOICING_BLUEPRINTS;
  }

  dispose(): void {
    this.stop();
    
    this.synths.forEach(synth => synth.dispose());
    this.synths.clear();

    if (this.reverb) this.reverb.dispose();
    if (this.compressor) this.compressor.dispose();
    if (this.limiter) this.limiter.dispose();

    this.initialized = false;
    this.lastVoicing = [];
    console.log('🎻 StringsEngine V2 disposed');
  }

  isReady(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let stringsEngineInstance: StringsEngine | null = null;

export function getStringsEngine(): StringsEngine {
  if (!stringsEngineInstance) {
    stringsEngineInstance = new StringsEngine();
  }
  return stringsEngineInstance;
}

export async function initStringsEngine(): Promise<StringsEngine> {
  const engine = getStringsEngine();
  await engine.initialize();
  return engine;
}

export default StringsEngine;
