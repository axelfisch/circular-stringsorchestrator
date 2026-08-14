import { describe, expect, it } from 'vitest';
import { createEmptyMeasures, SequenceChord, toggleMeasureSplit } from './sequencerModel';
import { generateMusicXml } from './musicXmlExport';

const chord = (id: string, key: string, extension = 'maj7', bassInversion?: string, isForeignBass?: boolean): SequenceChord => ({
  id,
  key,
  extension,
  bassInversion,
  isForeignBass
});

function occurrences(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

describe('MusicXML export', () => {
  it('creates a six-part, eight-measure partwise score', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = chord('one', 'C');

    const xml = generateMusicXml(measures, 120);

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<score-partwise version="4.0">');
    expect(occurrences(xml, /<score-part id=/g)).toBe(6);
    expect(occurrences(xml, /<part id=/g)).toBe(6);
    expect(occurrences(xml, /<measure number=/g)).toBe(48);
    expect(xml).toContain('<creator type="composer">Axel Fisch</creator>');
  });

  it('preserves 4/4, tempo, full bars, half bars, and rests', () => {
    let measures = createEmptyMeasures(2);
    measures = toggleMeasureSplit(measures, 0);
    measures[0].slots = [chord('one', 'C'), chord('two', 'D')];

    const xml = generateMusicXml(measures, 86);

    expect(xml).toContain('<time><beats>4</beats><beat-type>4</beat-type></time>');
    expect(xml).toContain('<per-minute>86</per-minute>');
    expect(xml).toContain('<offset>4</offset>');
    expect(occurrences(xml, /<type>half<\/type>/g)).toBe(12);
    expect(occurrences(xml, /<rest\/>/g)).toBe(6);
  });

  it('exports chord harmony and the selected alternate bass', () => {
    const measures = createEmptyMeasures(1);
    measures[0].slots[0] = chord('one', 'C', 'maj7', 'E', true);

    const xml = generateMusicXml(measures, 120);

    expect(xml).toContain('<root-step>C</root-step>');
    expect(xml).toContain('<kind text="maj7">other</kind>');
    expect(xml).toContain('<bass-step>E</bass-step>');
  });

  it('escapes extension text so the resulting XML remains well formed', () => {
    const measures = createEmptyMeasures(1);
    measures[0].slots[0] = chord('one', 'C', 'maj7 & color');

    expect(generateMusicXml(measures, 120)).toContain('text="maj7 &amp; color"');
  });
});
