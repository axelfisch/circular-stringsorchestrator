import { buildMidiExportNotes, MidiExportNote, MIDI_TICKS_PER_BEAT } from './midiExport';
import { buildPlaybackEvents, SequenceChord, SequenceMeasure } from './sequencerModel';
import { OrchestratedVoice } from './stringsengine_v2';

export const MUSICXML_DIVISIONS = 2;

const PARTS: Array<{ id: string; voice: OrchestratedVoice['voice']; name: string; clef: 'treble' | 'alto' | 'bass' }> = [
  { id: 'P1', voice: 'Violin1', name: 'Violin 1', clef: 'treble' },
  { id: 'P2', voice: 'Violin2', name: 'Violin 2', clef: 'treble' },
  { id: 'P3', voice: 'Viola1', name: 'Viola 1', clef: 'alto' },
  { id: 'P4', voice: 'Viola2', name: 'Viola 2', clef: 'alto' },
  { id: 'P5', voice: 'Cello', name: 'Cello', clef: 'bass' },
  { id: 'P6', voice: 'Contrabass', name: 'Contrabass', clef: 'bass' }
];

const PITCH_NAMES = [
  { step: 'C', alter: 0 }, { step: 'C', alter: 1 },
  { step: 'D', alter: 0 }, { step: 'E', alter: -1 },
  { step: 'E', alter: 0 }, { step: 'F', alter: 0 },
  { step: 'F', alter: 1 }, { step: 'G', alter: 0 },
  { step: 'A', alter: -1 }, { step: 'A', alter: 0 },
  { step: 'B', alter: -1 }, { step: 'B', alter: 0 }
] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pitchFromMidi(midiNote: number) {
  return {
    ...PITCH_NAMES[((midiNote % 12) + 12) % 12],
    octave: Math.floor(midiNote / 12) - 1
  };
}

function pitchXml(midiNote: number): string {
  const pitch = pitchFromMidi(midiNote);
  return `<pitch><step>${pitch.step}</step>${pitch.alter ? `<alter>${pitch.alter}</alter>` : ''}<octave>${pitch.octave}</octave></pitch>`;
}

function clefXml(clef: 'treble' | 'alto' | 'bass'): string {
  if (clef === 'alto') return '<clef><sign>C</sign><line>3</line></clef>';
  if (clef === 'bass') return '<clef><sign>F</sign><line>4</line></clef>';
  return '<clef><sign>G</sign><line>2</line></clef>';
}

function noteType(durationBeats: number): string {
  return durationBeats === 2 ? 'half' : 'whole';
}

function noteXml(midiNote: number, durationBeats: number): string {
  return `<note>${pitchXml(midiNote)}<duration>${durationBeats * MUSICXML_DIVISIONS}</duration><voice>1</voice><type>${noteType(durationBeats)}</type></note>`;
}

function restXml(durationBeats: number): string {
  return `<note><rest/><duration>${durationBeats * MUSICXML_DIVISIONS}</duration><voice>1</voice><type>${noteType(durationBeats)}</type></note>`;
}

function rootPitchClass(key: string): number {
  const match = key.match(/^([A-G])([b#]?)/);
  if (!match) return 0;
  const natural: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  return (natural[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0) + 12) % 12;
}

function pitchClassXml(prefix: 'root' | 'bass', pitchClass: number): string {
  const pitch = PITCH_NAMES[pitchClass];
  return `<${prefix}><${prefix}-step>${pitch.step}</${prefix}-step>${pitch.alter ? `<${prefix}-alter>${pitch.alter}</${prefix}-alter>` : ''}</${prefix}>`;
}

function harmonyXml(chord: SequenceChord, bassMidi?: number, offsetDivisions = 0): string {
  const bass = chord.bassInversion && bassMidi !== undefined
    ? pitchClassXml('bass', ((bassMidi % 12) + 12) % 12)
    : '';
  const offset = offsetDivisions ? `<offset>${offsetDivisions}</offset>` : '';
  return `<harmony print-frame="no">${pitchClassXml('root', rootPitchClass(chord.key))}<kind text="${escapeXml(chord.extension || 'maj')}">other</kind>${bass}${offset}</harmony>`;
}

function notesForMeasure(
  notes: MidiExportNote[],
  voice: OrchestratedVoice['voice'],
  barIndex: number,
  measure: SequenceMeasure
): string {
  const startTick = barIndex * 4 * MIDI_TICKS_PER_BEAT;
  const voiceNotes = notes
    .filter((note) => note.voice === voice && note.startTick >= startTick && note.startTick < startTick + 4 * MIDI_TICKS_PER_BEAT)
    .sort((a, b) => a.startTick - b.startTick);

  if (measure.chordCount === 1) {
    return voiceNotes[0] ? noteXml(voiceNotes[0].midiNote, 4) : restXml(4);
  }

  return [0, 1].map((slotIndex) => {
    const slotTick = startTick + slotIndex * 2 * MIDI_TICKS_PER_BEAT;
    const note = voiceNotes.find((candidate) => candidate.startTick === slotTick);
    return note ? noteXml(note.midiNote, 2) : restXml(2);
  }).join('');
}

export function generateMusicXml(measures: SequenceMeasure[], tempo: number): string {
  const notes = buildMidiExportNotes(measures);
  const playbackEvents = buildPlaybackEvents(measures);
  const partList = PARTS.map((part) => `<score-part id="${part.id}"><part-name>${part.name}</part-name></score-part>`).join('');
  const parts = PARTS.map((part, partIndex) => {
    const measureXml = measures.map((measure, barIndex) => {
      const attributes = barIndex === 0
        ? `<attributes><divisions>${MUSICXML_DIVISIONS}</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>${clefXml(part.clef)}</attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>`
        : '';
      const harmonies = partIndex === 0
        ? playbackEvents.filter((event) => event.barIndex === barIndex).map((event) => {
          const startTick = event.startBeat * MIDI_TICKS_PER_BEAT;
          const bassMidi = notes.find((note) => note.voice === 'Contrabass' && note.startTick === startTick)?.midiNote;
          return harmonyXml(event.chord, bassMidi, event.position === 2 ? 2 * MUSICXML_DIVISIONS : 0);
        }).join('')
        : '';
      return `<measure number="${barIndex + 1}">${attributes}${harmonies}${notesForMeasure(notes, part.voice, barIndex, measure)}</measure>`;
    }).join('');
    return `<part id="${part.id}">${measureXml}</part>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n<score-partwise version="4.0"><work><work-title>AiXEL StringsOrchestrator</work-title></work><identification><creator type="composer">Axel Fisch</creator><encoding><software>AiXEL StringsOrchestrator</software></encoding></identification><part-list>${partList}</part-list>${parts}</score-partwise>`;
}

export function downloadMusicXmlFile(measures: SequenceMeasure[], tempo: number): void {
  const xml = generateMusicXml(measures, tempo);
  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'AiXEL-StringsOrchestrator.musicxml';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
