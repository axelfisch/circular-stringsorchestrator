// AiXEL Engine - Integration with AIXEL_MASTER_MODEL_2025_FULL
// Handles harmonic language, voicings, and ECM-style composition rules

import aixelMasterModel from '../data/AIXEL_MASTER_MODEL_2025_FULL.json';

export interface AiXELVoicing {
  notes: string[];
  midi_numbers?: number[];
  voicing_type: string;
  ecm_adaptation?: string;
}

export interface AiXELChordData {
  [chordType: string]: AiXELVoicing;
}

export interface HarmonicFunction {
  approach: string;
  tension: string;
  resolution: string;
}

export class AiXELEngine {
  private harmonicDictionary: any;
  private profile: any;

  constructor() {
    this.harmonicDictionary = aixelMasterModel.harmony_dictionary;
    this.profile = aixelMasterModel.profile;
  }

  // Get all available chord types for a given key
  getChordTypesForKey(key: string): string[] {
    const keyData = this.harmonicDictionary[key];
    if (!keyData) return [];
    return Object.keys(keyData);
  }

  // Get voicing for a specific chord
  getVoicing(key: string, chordType: string): string[] {
    const keyData = this.harmonicDictionary[key];
    if (!keyData || !keyData[chordType]) return [];
    return keyData[chordType];
  }

  // Get ECM-style voicing recommendations
  getECMVoicing(key: string, extension: string): string[] {
    // Map extension to chord type
    const chordType = this.mapExtensionToChordType(extension);
    return this.getVoicing(key, chordType);
  }

  // Map user-friendly extension to dictionary chord type
  private mapExtensionToChordType(extension: string): string {
    const ext = extension.toLowerCase().trim();

    // Major chords
    if (!ext || ext === 'maj') return 'Cmaj';
    if (ext.includes('maj7') || ext.includes('ma7')) {
      if (ext.includes('#11') || ext.includes('11+')) return 'Cmaj9(11+)';
      if (ext.includes('#5') || ext.includes('5+')) return 'Cmaj7(5+)';
      return 'Cmaj7';
    }
    if (ext.includes('add9')) return 'Cadd9';

    // Minor chords
    if (ext.includes('min') || ext.includes('m')) {
      if (ext.includes('7+') || ext.includes('maj7')) {
        if (ext.includes('9')) return 'Cmin9(7+)';
        return 'Cmin(7+)';
      }
      if (ext.includes('11')) return 'Cmin11';
      if (ext.includes('9')) {
        if (ext.includes('b5')) return 'Cmin9(b5)';
        return 'Cmin9';
      }
      if (ext.includes('7')) {
        if (ext.includes('b5')) return 'Cmin7(b5)';
        return 'Cmin7';
      }
      if (ext.includes('6')) return 'Cmin6';
      if (ext.includes('add9')) return 'Cmin(add9)';
      return 'Cmin';
    }

    // Dominant chords
    if (ext.includes('13')) {
      if (ext.includes('b9')) return 'C13(b9)';
      if (ext.includes('b5')) return 'C13(b5)';
    }
    if (ext.includes('11')) return 'C11';
    if (ext.includes('9')) {
      if (ext.includes('5+')) return 'C7(9+5+)';
      if (ext.includes('b9')) return 'C7(b9)';
      return 'C9';
    }

    // Suspended & other
    if (ext.includes('sus13')) return 'Csus13';
    if (ext.includes('sus4') && ext.includes('b9')) return 'C7sus4(b9)';
    if (ext.includes('dim')) return 'Cdim';

    // Default to major
    return 'Cmaj';
  }

  // Get harmonic progression suggestions based on AiXEL rules
  suggestProgression(key: string, bars: number = 8): string[] {
    const recipes = this.profile.harmonic_language.progression_recipes || [];
    if (recipes.length === 0) return [];

    // Pick a random recipe
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    return recipe;
  }

  // Get scale for improvisation based on chord
  getScale(key: string, extension: string): string {
    const scaleMapping = this.profile.scale_mapping || {};

    // Try to match extension pattern
    for (const [pattern, scale] of Object.entries(scaleMapping)) {
      if (extension.includes(pattern) || pattern.includes(extension)) {
        return scale as string;
      }
    }

    // Default to Ionian for major, Dorian for minor
    if (extension.includes('m')) return 'Dorian';
    return 'Ionian';
  }

  // Validate chord against AiXEL whitelist
  isValidChord(extension: string): boolean {
    const whitelist = this.profile.harmonic_language.chords_whitelist || [];
    const ext = extension.toLowerCase();

    return whitelist.some((allowed: string) => {
      const pattern = allowed.toLowerCase();
      return ext.includes(pattern) || pattern.includes(ext);
    });
  }

  // Get voicing principles for orchestration
  getVoicingPrinciples() {
    return this.profile.voicing_blueprints || {};
  }

  // Get bass movement suggestions
  getBassMovement(fromKey: string, toKey: string): string {
    const guidelines = this.profile.bass_cello_guidelines?.bass || '';
    return guidelines;
  }

  // Apply ECM characteristics to voicing
  applyECMCharacteristics(notes: string[]): string[] {
    // ECM style: open voicings, crystal clear
    // This is a placeholder - actual implementation would
    // apply spacing rules from the model
    return notes;
  }

  // Get complete AiXEL profile
  getProfile() {
    return this.profile;
  }

  // Get harmonic language rules
  getHarmonicLanguage() {
    return this.profile.harmonic_language || {};
  }

  // Generate AABA form suggestions
  generateAABAForm(key: string) {
    const form = {
      A1: this.suggestProgression(key, 8),
      A2: this.suggestProgression(key, 8),
      B: this.suggestProgression(key, 8),  // Bridge - different tonality
      A3: this.suggestProgression(key, 8)
    };
    return form;
  }
}

// Singleton instance
export const aixelEngine = new AiXELEngine();
