import { describe, expect, it } from 'vitest';
import { generatePdfFile } from './pdfExport';
import { createEmptyMeasures, SequenceChord, toggleMeasureSplit } from './sequencerModel';

const chord = (id: string, key: string, extension = 'maj7', bassInversion?: string): SequenceChord => ({
  id,
  key,
  extension,
  bassInversion,
  isForeignBass: Boolean(bassInversion)
});

function pdfText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

describe('PDF export', () => {
  it('creates a valid one-page landscape PDF with AiXEL metadata', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = chord('one', 'C');

    const pdf = pdfText(generatePdfFile(measures, 120, 'Ballad Jazz'));

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('/Count 1');
    expect(pdf).toContain('/MediaBox [0 0 842 595]');
    expect(pdf).toContain('/Title (AiXEL StringsOrchestrator)');
    expect(pdf).toContain('(Composer: Axel Fisch   |   Tempo: 120 BPM   |   Meter: 4/4)');
    expect(pdf).toContain('(Style: Ballad Jazz)');
    expect(pdf.endsWith('%%EOF\n')).toBe(true);
  });

  it('preserves all eight measure labels and six orchestra voices', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = chord('one', 'C');
    const pdf = pdfText(generatePdfFile(measures, 96));

    expect((pdf.match(/\(BAR [1-8]\)/g) ?? []).length).toBe(8);
    ['Violin 1', 'Violin 2', 'Viola 1', 'Viola 2', 'Cello', 'Contrabass'].forEach((voice) => {
      expect(pdf).toContain(`(${voice})`);
    });
  });

  it('shows split-measure chords, rests, notes, inversions, and foreign basses', () => {
    let measures = createEmptyMeasures();
    measures = toggleMeasureSplit(measures, 0);
    measures[0].slots = [chord('one', 'C'), chord('two', 'D', 'min9', 'F')];

    const pdf = pdfText(generatePdfFile(measures, 84));

    expect(pdf).toContain('(Cmaj7)');
    expect(pdf).toContain('(Dmin9/F)');
    expect(pdf).toContain('(REST)');
    expect(pdf).toMatch(/\([A-G](?:#|b)?\d \/ [A-G](?:#|b)?\d\)/);
    expect(pdf).toContain('(--)');
  });

  it('escapes PDF control characters in style and chord text', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = chord('one', 'C', 'maj7 (bright)');
    const pdf = pdfText(generatePdfFile(measures, 120, 'Jazz \\ Fusion'));

    expect(pdf).toContain('(Cmaj7 \\(bright\\))');
    expect(pdf).toContain('(Style: Jazz \\\\ Fusion)');
  });
});
