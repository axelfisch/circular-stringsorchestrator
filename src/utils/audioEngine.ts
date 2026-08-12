// Audio Engine for StringsOrchestrator
// Electric Piano Sampler with ECM-style sound

import * as Tone from 'tone';
import { chordToMidiNotes } from './chordMapper';
import { getEPSampler, initAudio } from './epSampler';
import { buildPlaybackEvents, SequenceMeasure } from './sequencerModel';

interface ScheduledNote {
  notes: string[];
  startTime: number;
  duration: number;
  barIndex: number;
  position?: 1 | 2;
}

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private scheduledNotes: ScheduledNote[] = [];
  private activeNoteIds: number[] = [];
  private initialized = false;
  private animationFrameId: number | null = null;
  private startTimestamp: number = 0;
  private isPlaying: boolean = false;
  private pausedAt = 0;
  private totalDuration = 0;
  private loopEnabled = false;
  private onBeat?: (barIndex: number) => void;
  private lastReportedBar = -1;

  constructor() {
    this.initializeSampler();
  }

  private async initializeSampler() {
    try {
      this.synth = await getEPSampler({
        reverb: 2.5,
        chorus: true,
        attack: 0.01,
        release: 1.2
      });
    } catch (error) {
      console.error('Failed to load EP synth:', error);
    }
  }

  async initialize() {
    if (!this.initialized) {
      await initAudio();
      if (!this.synth) {
        await this.initializeSampler();
      }
      this.initialized = true;
    }
  }

  private midiToFrequency(midiNote: number): string {
    return Tone.Frequency(midiNote, 'midi').toNote();
  }

  private stopAllNotes() {
    if (this.synth) {
      this.synth.releaseAll();
    }
    this.activeNoteIds = [];
  }

  scheduleSequence(
    measures: SequenceMeasure[],
    tempo: number,
    loop: boolean,
    onBeat?: (barIndex: number) => void
  ) {
    this.scheduledNotes = [];
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / tempo;
    this.loopEnabled = loop;
    this.onBeat = onBeat;
    this.totalDuration = measures.length * beatsPerBar * secondsPerBeat;
    this.pausedAt = 0;
    this.lastReportedBar = -1;

    buildPlaybackEvents(measures, beatsPerBar).forEach((event) => {
      const midiNotes = chordToMidiNotes(
        event.chord.key,
        event.chord.extension,
        event.chord.bassInversion,
        event.chord.isForeignBass
      );
      this.scheduledNotes.push({
        notes: midiNotes.map((midi) => this.midiToFrequency(midi)),
        startTime: event.startBeat * secondsPerBeat,
        duration: event.durationBeats * secondsPerBeat,
        barIndex: event.barIndex,
        position: event.position
      });
    });
  }

  private playbackLoop = (timestamp: number) => {
    if (!this.isPlaying) return;

    let currentTime = (timestamp - this.startTimestamp) / 1000;

    if (currentTime >= this.totalDuration) {
      if (!this.loopEnabled) {
        this.stop();
        this.onBeat?.(-1);
        return;
      }
      this.stopAllNotes();
      this.activeNoteIds = [];
      this.startTimestamp = timestamp;
      currentTime = 0;
      this.lastReportedBar = -1;
    }

    const barDuration = this.totalDuration / 8;
    const currentBar = Math.min(7, Math.floor(currentTime / barDuration));
    if (currentBar !== this.lastReportedBar) {
      this.lastReportedBar = currentBar;
      this.onBeat?.(currentBar);
    }

    this.scheduledNotes.forEach((note, index) => {
      const noteEndTime = note.startTime + note.duration;

      if (currentTime >= note.startTime && currentTime < noteEndTime) {
        if (!this.activeNoteIds.includes(index)) {
          if (this.synth) {
            this.synth.triggerAttack(note.notes, Tone.now());
          }
          this.activeNoteIds.push(index);
        }
      }

      if (currentTime >= noteEndTime && this.activeNoteIds.includes(index)) {
        if (this.synth) {
          this.synth.triggerRelease(note.notes, Tone.now());
        }
        this.activeNoteIds = this.activeNoteIds.filter(id => id !== index);
      }
    });

    this.animationFrameId = requestAnimationFrame(this.playbackLoop);
  };

  async play() {
    await this.initialize();
    this.isPlaying = true;
    this.startTimestamp = performance.now() - this.pausedAt * 1000;
    this.stopAllNotes();
    this.activeNoteIds = [];
    this.animationFrameId = requestAnimationFrame(this.playbackLoop);
  }

  pause() {
    this.pausedAt = (performance.now() - this.startTimestamp) / 1000;
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stopAllNotes();
  }

  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stopAllNotes();
    this.pausedAt = 0;
    this.lastReportedBar = -1;
  }

  rewind() {
    this.stop();
    this.onBeat?.(-1);
  }

  setTempo(_bpm: number) {
    void _bpm;
    // Re-schedule with new tempo if needed
  }

  getPlaybackState(): 'started' | 'paused' | 'stopped' {
    if (this.isPlaying) return 'started';
    return this.pausedAt > 0 ? 'paused' : 'stopped';
  }

  dispose() {
    this.stop();
    if (this.synth) {
      this.synth.dispose();
    }
  }
}
