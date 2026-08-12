import { describe, expect, it } from 'vitest';
import {
  addChordToFirstAvailable,
  buildPlaybackEvents,
  countSequenceChords,
  createEmptyMeasures,
  removeSequenceChord,
  SequenceChord,
  toggleMeasureSplit
} from './sequencerModel';

const chord = (id: string, key = 'C'): SequenceChord => ({
  id,
  key,
  extension: 'maj7'
});

describe('sequencer model', () => {
  it('fills the first slot of each single-chord measure in order', () => {
    let measures = createEmptyMeasures(2);
    measures = addChordToFirstAvailable(measures, chord('one'));
    measures = addChordToFirstAvailable(measures, chord('two', 'D'));

    expect(measures[0].slots[0]?.id).toBe('one');
    expect(measures[1].slots[0]?.id).toBe('two');
    expect(countSequenceChords(measures)).toBe(2);
  });

  it('uses the second slot when a measure is split', () => {
    let measures = createEmptyMeasures(2);
    measures = addChordToFirstAvailable(measures, chord('one'));
    measures = toggleMeasureSplit(measures, 0);
    measures = addChordToFirstAvailable(measures, chord('two', 'D'));

    expect(measures[0].chordCount).toBe(2);
    expect(measures[0].slots.map((item) => item?.id)).toEqual(['one', 'two']);
    expect(measures[1].slots[0]).toBeNull();
  });

  it('keeps the first available chord when collapsing a split measure', () => {
    let measures = createEmptyMeasures(1);
    measures = toggleMeasureSplit(measures, 0);
    measures = addChordToFirstAvailable(measures, chord('one'));
    measures = addChordToFirstAvailable(measures, chord('two'));
    measures = removeSequenceChord(measures, 'one');
    measures = toggleMeasureSplit(measures, 0);

    expect(measures[0].chordCount).toBe(1);
    expect(measures[0].slots.map((item) => item?.id ?? null)).toEqual(['two', null]);
  });

  it('builds whole-bar and half-bar playback events', () => {
    let measures = createEmptyMeasures(2);
    measures = addChordToFirstAvailable(measures, chord('one'));
    measures = toggleMeasureSplit(measures, 1);
    measures = addChordToFirstAvailable(measures, chord('two', 'D'));
    measures = addChordToFirstAvailable(measures, chord('three', 'E'));

    expect(buildPlaybackEvents(measures)).toMatchObject([
      { chord: { id: 'one' }, barIndex: 0, position: 1, startBeat: 0, durationBeats: 4 },
      { chord: { id: 'two' }, barIndex: 1, position: 1, startBeat: 4, durationBeats: 2 },
      { chord: { id: 'three' }, barIndex: 1, position: 2, startBeat: 6, durationBeats: 2 }
    ]);
  });
});
