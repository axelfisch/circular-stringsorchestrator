// Chord to MIDI note mapper for StringsOrchestrator
// Maps AiXEL chord symbols to playable MIDI note arrays
// Integrated with AIXEL_MASTER_MODEL_2025_FULL

import { aixelEngine } from './aixelEngine';

const noteToMidi: Record<string, number> = {
  'C': 60, 'Db': 61, 'D': 62, 'Eb': 63, 'E': 64, 'F': 65,
  'F#': 66, 'G': 67, 'Ab': 68, 'A': 69, 'Bb': 70, 'B': 71
};

// Try to use AiXEL voicings first, fall back to algorithmic
function tryAiXELVoicing(key: string, extension: string): number[] | null {
  try {
    const voicingNotes = aixelEngine.getECMVoicing(key, extension);
    if (voicingNotes && voicingNotes.length > 0) {
      // Convert note names to MIDI numbers
      return voicingNotes.map(noteName => {
        // Parse note name (e.g., "C", "Db", "F#")
        const match = noteName.match(/^([A-G][b#]?)/);
        if (match) {
          const baseMidi = noteToMidi[match[1]];
          if (baseMidi !== undefined) {
            return baseMidi;
          }
        }
        return 60; // fallback
      });
    }
  } catch (e) {
    // Fall back to algorithmic voicing
  }
  return null;
}

interface ChordVoicing {
  notes: number[];
}

const intervals: Record<string, number> = {
  'P1': 0, 'm2': 1, 'M2': 2, 'm3': 3, 'M3': 4, 'P4': 5,
  'A4': 6, 'P5': 7, 'm6': 8, 'M6': 9, 'm7': 10, 'M7': 11
};

const bassInversionMap: Record<string, string> = {
  'b2': 'm2', '2': 'M2', 'b3': 'm3',
  '3': 'M3', '4': 'P4', '#4': 'A4', '5': 'P5',
  'b6': 'm6', '6': 'M6', 'b7': 'm7', '7': 'M7'
};

export function chordToMidiNotes(key: string, extension: string, bassInversion?: string, isForeignBass?: boolean): number[] {
  const rootMidi = noteToMidi[key];
  if (rootMidi === undefined) return [60, 64, 67]; // Default C major

  // Try AiXEL voicing first
  const aixelVoicing = tryAiXELVoicing(key, extension);
  if (aixelVoicing && aixelVoicing.length > 0) {
    // Apply bass inversion or foreign bass if needed
    if (bassInversion) {
      let bassMidi: number;

      if (isForeignBass) {
        bassMidi = noteToMidi[bassInversion];
        if (bassMidi === undefined) bassMidi = rootMidi;
        while (bassMidi >= rootMidi) {
          bassMidi -= 12;
        }
      } else if (bassInversionMap[bassInversion]) {
        const intervalType = bassInversionMap[bassInversion];
        const semitones = intervals[intervalType];
        bassMidi = rootMidi + semitones;
        while (bassMidi >= rootMidi) {
          bassMidi -= 12;
        }
      } else {
        return aixelVoicing;
      }

      return [bassMidi, ...aixelVoicing.filter(n => n !== bassMidi)];
    }
    return aixelVoicing;
  }

  // Fallback to algorithmic voicing
  let bassMidi = rootMidi;

  // Parse extension and build voicing
  const ext = extension.toLowerCase();
  const notes: number[] = [rootMidi];

  // Determine if major or minor based on extension
  const isMinor = ext.includes('min');
  const isDim = ext.includes('dim');
  const isAug = ext.includes('aug') || ext.includes('5+');
  const isSus = ext.includes('sus');

  // Add third (or sus note)
  if (isSus) {
    if (ext.includes('sus2')) {
      notes.push(rootMidi + 2); // major 2nd
    } else if (ext.includes('sus4')) {
      notes.push(rootMidi + 5); // perfect 4th
    } else {
      notes.push(rootMidi + 5); // default sus4
    }
  } else if (isDim) {
    notes.push(rootMidi + 3); // minor 3rd
  } else if (isMinor) {
    notes.push(rootMidi + 3); // minor 3rd
  } else {
    notes.push(rootMidi + 4); // major 3rd
  }

  // Add fifth
  if (isDim) {
    notes.push(rootMidi + 6); // diminished 5th
  } else if (isAug || ext.includes('5+')) {
    notes.push(rootMidi + 8); // augmented 5th
  } else if (ext.includes('b5')) {
    notes.push(rootMidi + 6); // flat 5th
  } else if (!isSus || !ext.includes('sus2')) {
    notes.push(rootMidi + 7); // perfect 5th
  }

  // Add seventh
  if (ext.includes('maj7')) {
    notes.push(rootMidi + 11); // major 7th
  } else if (ext.includes('7')) {
    notes.push(rootMidi + 10); // dominant/minor 7th
  }

  // Add extensions
  if (ext.includes('add9') || ext.includes('9')) {
    notes.push(rootMidi + 14); // 9th (octave up)
  }

  if (ext.includes('11')) {
    notes.push(rootMidi + 17); // 11th
  }

  if (ext.includes('13')) {
    notes.push(rootMidi + 21); // 13th
  }

  // Handle altered notes
  if (ext.includes('b9')) {
    const idx = notes.findIndex(n => n === rootMidi + 14);
    if (idx !== -1) notes[idx] = rootMidi + 13; // flat 9
    else notes.push(rootMidi + 13);
  }

  if (ext.includes('9+') || ext.includes('#9')) {
    const idx = notes.findIndex(n => n === rootMidi + 14);
    if (idx !== -1) notes[idx] = rootMidi + 15; // sharp 9
    else notes.push(rootMidi + 15);
  }

  if (ext.includes('11+') || ext.includes('#11')) {
    const idx = notes.findIndex(n => n === rootMidi + 17);
    if (idx !== -1) notes[idx] = rootMidi + 18; // sharp 11
    else notes.push(rootMidi + 18);
  }

  // Calculate bass inversion or foreign bass if provided
  if (bassInversion) {
    if (isForeignBass) {
      bassMidi = noteToMidi[bassInversion];
      if (bassMidi === undefined) bassMidi = rootMidi;
      while (bassMidi >= rootMidi) {
        bassMidi -= 12;
      }
    } else if (bassInversionMap[bassInversion]) {
      const intervalType = bassInversionMap[bassInversion];
      const semitones = intervals[intervalType];
      bassMidi = rootMidi + semitones;

      // Place bass note in lower octave
      while (bassMidi >= rootMidi) {
        bassMidi -= 12;
      }
    }
  }

  // Ensure we have at least 3 notes and max 6 for a nice Rhodes voicing
  const uniqueNotes = [...new Set(notes)].sort((a, b) => a - b);

  // If we have too many notes, keep root, 3rd/sus, 5th, 7th, and highest extensions
  let finalNotes = uniqueNotes.length > 6 ? uniqueNotes.slice(0, 6) : uniqueNotes;

  // If bass inversion or foreign bass, replace lowest note with bass note
  if (bassInversion && bassMidi !== rootMidi) {
    finalNotes = [bassMidi, ...finalNotes.filter(n => n !== bassMidi)];
  }

  return finalNotes;
}

export function getChordSymbol(key: string, extension: string): string {
  return extension ? `${key}${extension}` : key;
}
