import { describe, expect, it } from 'vitest';
import { createEmptyMeasures, SequenceChord, toggleMeasureSplit } from './sequencerModel';
import { buildMidiExportNotes, generateMidiFile, MIDI_TICKS_PER_BEAT } from './midiExport';

const chord = (id: string, key: string, bassInversion?: string, isForeignBass?: boolean): SequenceChord => ({
  id,
  key,
  extension: 'maj7',
  bassInversion,
  isForeignBass
});

function readUint16(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

describe('MIDI export', () => {
  it('creates a type 1 MIDI file with conductor plus six voice tracks', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = chord('one', 'C');

    const midi = generateMidiFile(measures, 120);

    expect(ascii(midi, 0, 4)).toBe('MThd');
    expect(readUint16(midi, 8)).toBe(1);
    expect(readUint16(midi, 10)).toBe(7);
    expect(readUint16(midi, 12)).toBe(MIDI_TICKS_PER_BEAT);
    expect(ascii(midi, 14, 4)).toBe('MTrk');
  });

  it('exports six notes per chord and preserves half-bar timing', () => {
    let measures = createEmptyMeasures(2);
    measures = toggleMeasureSplit(measures, 0);
    measures[0].slots = [chord('one', 'C'), chord('two', 'D')];
    measures[1].slots[0] = chord('three', 'E');

    const notes = buildMidiExportNotes(measures);

    expect(notes).toHaveLength(18);
    expect(new Set(notes.map((note) => note.voice)).size).toBe(6);
    expect(notes.filter((note) => note.chordSymbol === 'Cmaj7')[0]).toMatchObject({
      startTick: 0,
      durationTicks: 2 * MIDI_TICKS_PER_BEAT
    });
    expect(notes.filter((note) => note.chordSymbol === 'Dmaj7')[0]).toMatchObject({
      startTick: 2 * MIDI_TICKS_PER_BEAT,
      durationTicks: 2 * MIDI_TICKS_PER_BEAT
    });
    expect(notes.filter((note) => note.chordSymbol === 'Emaj7')[0]).toMatchObject({
      startTick: 4 * MIDI_TICKS_PER_BEAT,
      durationTicks: 4 * MIDI_TICKS_PER_BEAT
    });
  });

  it('uses the selected alternate bass in the contrabass track', () => {
    const measures = createEmptyMeasures(1);
    measures[0].slots[0] = chord('one', 'C', 'E', true);

    const bass = buildMidiExportNotes(measures).find((note) => note.voice === 'Contrabass');

    expect(bass).toBeDefined();
    expect(bass!.midiNote % 12).toBe(4);
    expect(bass?.chordSymbol).toBe('Cmaj7/E');
  });

  it('writes the requested tempo as a MIDI tempo meta event', () => {
    const measures = createEmptyMeasures(1);
    measures[0].slots[0] = chord('one', 'C');
    const midi = generateMidiFile(measures, 120);
    const tempoPattern = [0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];

    expect(Array.from(midi).some((_, index, bytes) =>
      tempoPattern.every((value, patternIndex) => bytes[index + patternIndex] === value)
    )).toBe(true);
  });
});
