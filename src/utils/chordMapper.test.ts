import { describe, expect, it } from 'vitest';
import { chordToMidiNotes } from './chordMapper';

describe('chordToMidiNotes', () => {
  it('maps an AiXEL extended chord to MIDI notes', () => {
    expect(chordToMidiNotes('C', 'add9')).toEqual([60, 64, 67, 62]);
  });

  it('places an interval inversion below the root', () => {
    const notes = chordToMidiNotes('C', 'maj7', '3', false);
    expect(notes[0]).toBe(52);
  });

  it('supports a foreign bass note below the root', () => {
    const notes = chordToMidiNotes('C', 'maj7', 'F#', true);
    expect(notes[0]).toBe(54);
  });
});
