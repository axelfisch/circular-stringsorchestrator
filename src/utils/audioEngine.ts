// Audio Engine for StringsOrchestrator
// Electric Piano Sampler with ECM-style sound

import * as Tone from 'tone';
import { ChordInSequence, BarConfig } from '../App';
import { chordToMidiNotes } from './chordMapper';
import { getEPSampler, initAudio } from './epSampler';

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
    sequence: ChordInSequence[],
    barConfigs: BarConfig[],
    tempo: number,
    loop: boolean,
    onBeat?: (barIndex: number) => void
  ) {
    this.scheduledNotes = [];
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / tempo;

    barConfigs.forEach((config, barIndex) => {
      const chordsInBar = sequence.filter(c => c.beat === barIndex + 1);

      if (config.chordCount === 1 && chordsInBar.length > 0) {
        const chord = chordsInBar[0];
        const midiNotes = chordToMidiNotes(chord.key, chord.extension, chord.bassInversion, chord.isForeignBass);
        const noteNames = midiNotes.map(midi => this.midiToFrequency(midi));

        this.scheduledNotes.push({
          notes: noteNames,
          startTime: barIndex * beatsPerBar * secondsPerBeat,
          duration: beatsPerBar * secondsPerBeat,
          barIndex
        });
      } else if (config.chordCount === 2) {
        const firstChord = chordsInBar.find(c => c.position === 1);
        const secondChord = chordsInBar.find(c => c.position === 2);

        if (firstChord) {
          const midiNotes = chordToMidiNotes(firstChord.key, firstChord.extension, firstChord.bassInversion, firstChord.isForeignBass);
          const noteNames = midiNotes.map(midi => this.midiToFrequency(midi));

          this.scheduledNotes.push({
            notes: noteNames,
            startTime: barIndex * beatsPerBar * secondsPerBeat,
            duration: (beatsPerBar / 2) * secondsPerBeat,
            barIndex,
            position: 1
          });
        }

        if (secondChord) {
          const midiNotes = chordToMidiNotes(secondChord.key, secondChord.extension, secondChord.bassInversion, secondChord.isForeignBass);
          const noteNames = midiNotes.map(midi => this.midiToFrequency(midi));

          this.scheduledNotes.push({
            notes: noteNames,
            startTime: (barIndex * beatsPerBar + beatsPerBar / 2) * secondsPerBeat,
            duration: (beatsPerBar / 2) * secondsPerBeat,
            barIndex,
            position: 2
          });
        }
      }
    });
  }

  private playbackLoop = (timestamp: number) => {
    if (!this.isPlaying) return;

    const currentTime = (timestamp - this.startTimestamp) / 1000;

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
    this.startTimestamp = performance.now();
    this.stopAllNotes();
    this.activeNoteIds = [];
    this.animationFrameId = requestAnimationFrame(this.playbackLoop);
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stopAllNotes();
  }

  setTempo(bpm: number) {
    // Re-schedule with new tempo if needed
  }

  getPlaybackState(): 'started' | 'paused' | 'stopped' {
    return this.isPlaying ? 'started' : 'stopped';
  }

  dispose() {
    this.stop();
    if (this.synth) {
      this.synth.dispose();
    }
  }
}
