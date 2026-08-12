export interface SequenceChord {
  id: string;
  key: string;
  extension: string;
  bassInversion?: string;
  isForeignBass?: boolean;
}

export interface SequenceMeasure {
  barNumber: number;
  chordCount: 1 | 2;
  slots: [SequenceChord | null, SequenceChord | null];
}

export interface PlaybackEvent {
  chord: SequenceChord;
  barIndex: number;
  position: 1 | 2;
  startBeat: number;
  durationBeats: number;
}

export function createEmptyMeasures(count = 8): SequenceMeasure[] {
  return Array.from({ length: count }, (_, index) => ({
    barNumber: index + 1,
    chordCount: 1,
    slots: [null, null]
  }));
}

export function countSequenceChords(measures: SequenceMeasure[]): number {
  return measures.reduce(
    (total, measure) => total + measure.slots.filter(Boolean).length,
    0
  );
}

export function addChordToFirstAvailable(
  measures: SequenceMeasure[],
  chord: SequenceChord
): SequenceMeasure[] {
  const measureIndex = measures.findIndex((measure) => {
    const availableSlots = measure.chordCount === 2 ? measure.slots : measure.slots.slice(0, 1);
    return availableSlots.some((slot) => slot === null);
  });

  if (measureIndex === -1) return measures;

  return measures.map((measure, index) => {
    if (index !== measureIndex) return measure;

    const slotIndex = measure.slots[0] === null ? 0 : 1;
    const slots: SequenceMeasure['slots'] = [...measure.slots];
    slots[slotIndex] = chord;
    return { ...measure, slots };
  });
}

export function removeSequenceChord(
  measures: SequenceMeasure[],
  chordId: string
): SequenceMeasure[] {
  return measures.map((measure) => ({
    ...measure,
    slots: measure.slots.map((slot) => slot?.id === chordId ? null : slot) as SequenceMeasure['slots']
  }));
}

export function toggleMeasureSplit(
  measures: SequenceMeasure[],
  measureIndex: number
): SequenceMeasure[] {
  return measures.map((measure, index) => {
    if (index !== measureIndex) return measure;

    if (measure.chordCount === 1) {
      return { ...measure, chordCount: 2 };
    }

    return {
      ...measure,
      chordCount: 1,
      slots: [measure.slots[0] ?? measure.slots[1], null]
    };
  });
}

export function buildPlaybackEvents(
  measures: SequenceMeasure[],
  beatsPerBar = 4
): PlaybackEvent[] {
  return measures.flatMap((measure, barIndex) => {
    if (measure.chordCount === 1) {
      const chord = measure.slots[0];
      return chord ? [{ chord, barIndex, position: 1 as const, startBeat: barIndex * beatsPerBar, durationBeats: beatsPerBar }] : [];
    }

    const halfBar = beatsPerBar / 2;
    return measure.slots.flatMap((chord, slotIndex) => chord ? [{
      chord,
      barIndex,
      position: (slotIndex + 1) as 1 | 2,
      startBeat: barIndex * beatsPerBar + slotIndex * halfBar,
      durationBeats: halfBar
    }] : []);
  });
}
