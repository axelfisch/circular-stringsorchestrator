const intervals: Record<string, number> = {
  'P1': 0,
  'm2': 1,
  'M2': 2,
  'm3': 3,
  'M3': 4,
  'P4': 5,
  'A4': 6,
  'P5': 7,
  'm6': 8,
  'M6': 9,
  'm7': 10,
  'M7': 11
};

const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function calculateBassNote(key: string, inversionLabel: string, inversionInterval: string): string {
  const keyIndex = notes.indexOf(key);
  if (keyIndex === -1) return key;

  const semitones = intervals[inversionInterval];
  if (semitones === undefined) return key;

  const bassIndex = (keyIndex + semitones) % 12;
  return notes[bassIndex];
}

export function buildFullChord(key: string, extension: string, bassInversion?: string, bassInterval?: string): string {
  let chord = key + extension;

  if (bassInversion && bassInterval) {
    const bassNote = calculateBassNote(key, bassInversion, bassInterval);
    chord += `/${bassNote}`;
  }

  return chord;
}
