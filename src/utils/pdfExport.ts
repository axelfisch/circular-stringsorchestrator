import { buildMidiExportNotes, MidiExportNote, MIDI_TICKS_PER_BEAT } from './midiExport';
import { SequenceChord, SequenceMeasure } from './sequencerModel';
import { OrchestratedVoice } from './stringsengine_v2';

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

const VOICES: Array<{ id: OrchestratedVoice['voice']; label: string }> = [
  { id: 'Violin1', label: 'Violin 1' },
  { id: 'Violin2', label: 'Violin 2' },
  { id: 'Viola1', label: 'Viola 1' },
  { id: 'Viola2', label: 'Viola 2' },
  { id: 'Cello', label: 'Cello' },
  { id: 'Contrabass', label: 'Contrabass' }
];

const PITCH_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function pdfText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function chordSymbol(chord: SequenceChord | null): string {
  if (!chord) return 'REST';
  const base = `${chord.key}${chord.extension}`;
  return chord.bassInversion ? `${base}/${chord.bassInversion}` : base;
}

function midiNoteName(midiNote: number): string {
  return `${PITCH_NAMES[((midiNote % 12) + 12) % 12]}${Math.floor(midiNote / 12) - 1}`;
}

function voiceTextForMeasure(
  notes: MidiExportNote[],
  voice: OrchestratedVoice['voice'],
  measure: SequenceMeasure,
  barIndex: number
): string {
  const startTick = barIndex * 4 * MIDI_TICKS_PER_BEAT;
  const notesByTick = notes
    .filter((note) => note.voice === voice && note.startTick >= startTick && note.startTick < startTick + 4 * MIDI_TICKS_PER_BEAT)
    .sort((a, b) => a.startTick - b.startTick);

  if (measure.chordCount === 1) {
    return notesByTick[0] ? midiNoteName(notesByTick[0].midiNote) : '--';
  }

  return [0, 1].map((slotIndex) => {
    const slotTick = startTick + slotIndex * 2 * MIDI_TICKS_PER_BEAT;
    const note = notesByTick.find((candidate) => candidate.startTick === slotTick);
    return note ? midiNoteName(note.midiNote) : '--';
  }).join(' / ');
}

function drawText(text: string, x: number, y: number, size: number, font = 'F1', color = '0.92 0.95 0.98'): string {
  return `${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfText(text)}) Tj ET`;
}

function fillRect(x: number, y: number, width: number, height: number, color: string): string {
  return `${color} rg ${x} ${y} ${width} ${height} re f`;
}

function strokeRect(x: number, y: number, width: number, height: number, color: string, lineWidth = 1): string {
  return `${color} RG ${lineWidth} w ${x} ${y} ${width} ${height} re S`;
}

function line(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth = 1): string {
  return `${color} RG ${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function buildPageContent(measures: SequenceMeasure[], tempo: number, selectedStyle: string): string {
  const commands: string[] = [fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, '0.025 0.045 0.085')];
  const left = 36;
  const contentWidth = PAGE_WIDTH - left * 2;
  const labelWidth = 92;
  const measureWidth = (contentWidth - labelWidth) / 8;
  const gridX = left + labelWidth;

  commands.push(
    drawText('AiXEL StringsOrchestrator', left, 548, 22, 'F2'),
    drawText('Progression & String Orchestration', left, 528, 10, 'F1', '0.96 0.62 0.04'),
    drawText(`Composer: Axel Fisch   |   Tempo: ${tempo} BPM   |   Meter: 4/4`, left, 504, 9),
    drawText(`Style: ${selectedStyle || 'Custom'}`, 616, 504, 9, 'F1', '0.45 0.83 0.62'),
    line(left, 492, PAGE_WIDTH - left, 492, '0.12 0.72 0.38', 1.5)
  );

  commands.push(drawText('PROGRESSION', left, 466, 9, 'F2', '0.96 0.62 0.04'));
  measures.forEach((measure, index) => {
    const x = gridX + index * measureWidth;
    commands.push(
      fillRect(x + 2, 412, measureWidth - 4, 48, index % 2 === 0 ? '0.075 0.12 0.20' : '0.06 0.10 0.17'),
      strokeRect(x + 2, 412, measureWidth - 4, 48, '0.15 0.30 0.43'),
      drawText(`BAR ${index + 1}`, x + 8, 447, 6.5, 'F2', '0.45 0.83 0.62')
    );

    if (measure.chordCount === 2) {
      commands.push(
        line(x + measureWidth / 2, 416, x + measureWidth / 2, 442, '0.15 0.30 0.43'),
        drawText(chordSymbol(measure.slots[0]), x + 7, 426, 7.5, 'F2'),
        drawText(chordSymbol(measure.slots[1]), x + measureWidth / 2 + 5, 426, 7.5, 'F2')
      );
    } else {
      commands.push(drawText(chordSymbol(measure.slots[0]), x + 8, 426, 9, 'F2'));
    }
  });

  commands.push(
    drawText('ORCHESTRATION MATRIX', left, 382, 9, 'F2', '0.96 0.62 0.04'),
    fillRect(left, 346, labelWidth, 24, '0.07 0.12 0.20'),
    drawText('INSTRUMENT', left + 8, 354, 7, 'F2', '0.55 0.66 0.78')
  );

  measures.forEach((_, index) => {
    const x = gridX + index * measureWidth;
    commands.push(
      fillRect(x, 346, measureWidth, 24, '0.07 0.12 0.20'),
      strokeRect(x, 346, measureWidth, 24, '0.12 0.20 0.30'),
      drawText(`${index + 1}`, x + measureWidth / 2 - 2, 354, 8, 'F2', '0.55 0.66 0.78')
    );
  });

  const notes = buildMidiExportNotes(measures);
  VOICES.forEach((voice, rowIndex) => {
    const y = 346 - (rowIndex + 1) * 42;
    const rowColor = rowIndex % 2 === 0 ? '0.055 0.09 0.15' : '0.045 0.075 0.13';
    commands.push(
      fillRect(left, y, contentWidth, 42, rowColor),
      strokeRect(left, y, labelWidth, 42, '0.12 0.20 0.30'),
      drawText(voice.label, left + 8, y + 16, 8.5, 'F2')
    );

    measures.forEach((measure, barIndex) => {
      const x = gridX + barIndex * measureWidth;
      const cellText = voiceTextForMeasure(notes, voice.id, measure, barIndex);
      commands.push(
        strokeRect(x, y, measureWidth, 42, '0.12 0.20 0.30'),
        drawText(cellText, x + 8, y + 16, cellText.length > 8 ? 7 : 8.5, 'F1', voice.id === 'Contrabass' ? '0.96 0.62 0.04' : '0.83 0.88 0.95')
      );
    });
  });

  commands.push(
    line(left, 64, PAGE_WIDTH - left, 64, '0.15 0.30 0.43'),
    drawText('Eight measures - six independent string voices - generated from the current AiXEL sequence', left, 45, 8, 'F1', '0.55 0.66 0.78'),
    drawText('AiXEL Studio', 732, 45, 8, 'F2', '0.96 0.62 0.04')
  );

  return commands.join('\n');
}

function buildPdf(objects: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const header = '%PDF-1.4\n%AiXEL\n';
  const chunks = [header];
  const offsets = [0];
  let byteLength = encoder.encode(header).length;

  objects.forEach((object, index) => {
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    offsets.push(byteLength);
    chunks.push(chunk);
    byteLength += encoder.encode(chunk).length;
  });

  const xrefOffset = byteLength;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>`,
    `startxref\n${xrefOffset}`,
    '%%EOF\n'
  ].join('\n');

  return encoder.encode(chunks.join('') + xref);
}

export function generatePdfFile(measures: SequenceMeasure[], tempo: number, selectedStyle = ''): Uint8Array {
  const content = buildPageContent(measures, tempo, selectedStyle);
  const contentLength = new TextEncoder().encode(content).length;
  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Title (AiXEL StringsOrchestrator) /Author (Axel Fisch) /Creator (AiXEL Studio) >>'
  ]);
}

export function downloadPdfFile(measures: SequenceMeasure[], tempo: number, selectedStyle = ''): void {
  const bytes = generatePdfFile(measures, tempo, selectedStyle);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'AiXEL-StringsOrchestrator.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
