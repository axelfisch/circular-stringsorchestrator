import { chordToMidiNotes } from './chordMapper';
import { buildPlaybackEvents, SequenceChord, SequenceMeasure } from './sequencerModel';
import { OrchestratedVoice, StringsEngine } from './stringsengine_v2';

export const MIDI_TICKS_PER_BEAT = 480;

const VOICE_ORDER: OrchestratedVoice['voice'][] = [
  'Violin1',
  'Violin2',
  'Viola1',
  'Viola2',
  'Cello',
  'Contrabass'
];

const MIDI_PROGRAMS: Record<OrchestratedVoice['voice'], number> = {
  Violin1: 40,
  Violin2: 40,
  Viola1: 41,
  Viola2: 41,
  Cello: 42,
  Contrabass: 43
};

interface MidiEvent {
  tick: number;
  priority: number;
  data: number[];
}

export interface MidiExportNote {
  voice: OrchestratedVoice['voice'];
  midiNote: number;
  startTick: number;
  durationTicks: number;
  chordSymbol: string;
}

function chordSymbol(chord: SequenceChord): string {
  const base = `${chord.key}${chord.extension}`;
  return chord.bassInversion ? `${base}/${chord.bassInversion}` : base;
}

function uint32(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function uint16(value: number): number[] {
  return [(value >>> 8) & 0xff, value & 0xff];
}

function variableLength(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }

  return bytes;
}

function textMeta(type: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  return [0xff, type, ...variableLength(bytes.length), ...bytes];
}

function createTrack(events: MidiEvent[], endTick: number): number[] {
  const sortedEvents = [...events, { tick: endTick, priority: 99, data: [0xff, 0x2f, 0x00] }]
    .sort((a, b) => a.tick - b.tick || a.priority - b.priority);
  const trackData: number[] = [];
  let previousTick = 0;

  sortedEvents.forEach((event) => {
    trackData.push(...variableLength(event.tick - previousTick), ...event.data);
    previousTick = event.tick;
  });

  return [0x4d, 0x54, 0x72, 0x6b, ...uint32(trackData.length), ...trackData];
}

export function buildMidiExportNotes(
  measures: SequenceMeasure[],
  texture: 'pad-legato' | 'pizz-groove' | 'marcato-hits' | 'unison-octave' = 'pad-legato'
): MidiExportNote[] {
  const engine = new StringsEngine();
  const events = buildPlaybackEvents(measures);

  const sequenceInput = events.map((event) => ({
    midiNotes: chordToMidiNotes(
      event.chord.key,
      event.chord.extension,
      event.chord.bassInversion,
      event.chord.isForeignBass
    ),
    chordSymbol: chordSymbol(event.chord)
  }));

  // Role Director: bass approach N→N+1 across the full sequence
  const orchestrations = engine.orchestrateSequence(sequenceInput, { texture });

  return events.flatMap((event, index) => {
    const orchestration = orchestrations[index];
    const symbol = chordSymbol(event.chord);

    return orchestration.voices.map((voice) => {
      // Texture-aware written durations (pizz/marcato shorter than full slot)
      let durationTicks = event.durationBeats * MIDI_TICKS_PER_BEAT;
      if (texture === 'pizz-groove') {
        durationTicks = Math.max(
          Math.round(MIDI_TICKS_PER_BEAT * 0.25),
          Math.round(durationTicks * (voice.role === 'melody' ? 0.45 : 0.2))
        );
      } else if (texture === 'marcato-hits') {
        durationTicks = Math.max(
          Math.round(MIDI_TICKS_PER_BEAT * 0.2),
          Math.round(durationTicks * 0.25)
        );
      }

      return {
        voice: voice.voice,
        midiNote: voice.midiNote,
        startTick: event.startBeat * MIDI_TICKS_PER_BEAT,
        durationTicks,
        chordSymbol: symbol
      };
    });
  });
}

export function generateMidiFile(
  measures: SequenceMeasure[],
  tempo: number,
  texture: 'pad-legato' | 'pizz-groove' | 'marcato-hits' | 'unison-octave' = 'pad-legato'
): Uint8Array {
  const endTick = measures.length * 4 * MIDI_TICKS_PER_BEAT;
  const microsecondsPerBeat = Math.round(60_000_000 / tempo);
  const conductorEvents: MidiEvent[] = [
    { tick: 0, priority: 0, data: textMeta(0x03, 'AiXEL StringsOrchestrator') },
    { tick: 0, priority: 1, data: [0xff, 0x51, 0x03, ...uint32(microsecondsPerBeat).slice(1)] },
    { tick: 0, priority: 2, data: [0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08] }
  ];

  buildPlaybackEvents(measures).forEach((event) => {
    conductorEvents.push({
      tick: event.startBeat * MIDI_TICKS_PER_BEAT,
      priority: 3,
      data: textMeta(0x06, chordSymbol(event.chord))
    });
  });

  const notes = buildMidiExportNotes(measures, texture);
  const tracks = [createTrack(conductorEvents, endTick)];

  VOICE_ORDER.forEach((voice, voiceIndex) => {
    const channel = voiceIndex;
    const events: MidiEvent[] = [
      { tick: 0, priority: 0, data: textMeta(0x03, voice) },
      { tick: 0, priority: 1, data: [0xc0 | channel, MIDI_PROGRAMS[voice]] }
    ];

    notes.filter((note) => note.voice === voice).forEach((note) => {
      events.push(
        { tick: note.startTick, priority: 2, data: [0x90 | channel, note.midiNote, 88] },
        { tick: note.startTick + note.durationTicks, priority: 1, data: [0x80 | channel, note.midiNote, 0] }
      );
    });

    tracks.push(createTrack(events, endTick));
  });

  const header = [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x01,
    ...uint16(tracks.length),
    ...uint16(MIDI_TICKS_PER_BEAT)
  ];

  return new Uint8Array([...header, ...tracks.flat()]);
}

export function downloadMidiFile(
  measures: SequenceMeasure[],
  tempo: number,
  texture: 'pad-legato' | 'pizz-groove' | 'marcato-hits' | 'unison-octave' = 'pad-legato'
): void {
  const bytes = generateMidiFile(measures, tempo, texture);
  const blob = new Blob([bytes], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'AiXEL-StringsOrchestrator.mid';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
