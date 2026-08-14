export interface EvaluationChord {
  symbol: string;
  notes: number[];
  measure?: number;
  beat?: number;
  beats?: number;
}

export interface VoicingEvaluationProfile {
  id: 'reference' | 'lyrical' | 'kinetic' | 'modal' | 'doux-baiser';
  label: string;
  intent: string;
  bassLanguageTarget?: {
    motionWithinFiveSemitones: number;
    leapAtLeastSevenSemitones: number;
    label: string;
  };
  source?: {
    composer: string;
    title: string;
    tempoBpm: number;
    writtenMeasures: number;
    tonalRegions: string[];
    note: string;
  };
  progression: EvaluationChord[];
}

export const VOICING_EVALUATION_PROFILES: VoicingEvaluationProfile[] = [
  {
    id: 'reference',
    label: 'Reference',
    intent: 'The original Axel Fisch benchmark: tonal closure, rich extensions and a dominant return.',
    progression: [
      { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
      { notes: [45, 48, 52, 55, 59], symbol: 'Amin11' },
      { notes: [50, 53, 57, 60, 64], symbol: 'Dmin9' },
      { notes: [43, 47, 50, 53, 57, 64], symbol: 'G13' },
      { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
    ],
  },
  {
    id: 'lyrical',
    label: 'Lyrical',
    intent: 'Long-breathed harmony with inversions, connected bass and restrained inner-voice movement.',
    bassLanguageTarget: {
      motionWithinFiveSemitones: 1,
      leapAtLeastSevenSemitones: 0,
      label: 'Lyrical connected-bass target',
    },
    progression: [
      { notes: [52, 48, 55, 59, 62], symbol: 'Cmaj9' },
      { notes: [47, 52, 55, 59, 62, 64], symbol: 'Emin11' },
      { notes: [48, 45, 52, 55, 59], symbol: 'Amin9' },
      { notes: [45, 41, 48, 52, 55, 60], symbol: 'Fmaj9' },
      { notes: [41, 50, 53, 57, 60, 64], symbol: 'Dmin9' },
      { notes: [43, 47, 50, 53, 57, 64], symbol: 'G13' },
      { notes: [52, 48, 55, 59, 62], symbol: 'Cmaj9' },
    ],
  },
  {
    id: 'kinetic',
    label: 'Kinetic',
    intent: 'Faster harmonic rhythm, root movement and contrasting dominant colors without sacrificing clarity.',
    progression: [
      { notes: [50, 53, 57, 60, 64], symbol: 'Dmin9' },
      { notes: [43, 47, 50, 53, 57, 64], symbol: 'G13' },
      { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
      { notes: [42, 45, 48, 52, 56], symbol: 'F#min9(b5)' },
      { notes: [47, 51, 54, 57, 60], symbol: 'B7(b9)' },
      { notes: [40, 43, 47, 50, 54], symbol: 'Emin9' },
      { notes: [45, 49, 52, 55, 59, 66], symbol: 'A13' },
      { notes: [50, 53, 57, 60, 64], symbol: 'Dmin9' },
    ],
  },
  {
    id: 'modal',
    label: 'Modal',
    intent: 'Suspended and Lydian colors, non-functional shifts and exposed upper extensions.',
    progression: [
      { notes: [48, 52, 55, 59, 62, 66], symbol: 'Cmaj9(11+)' },
      { notes: [50, 53, 57, 60, 64, 67], symbol: 'Dmin11' },
      { notes: [40, 45, 47, 50, 54, 61], symbol: 'Esus13' },
      { notes: [43, 47, 50, 54, 57, 61], symbol: 'Gmaj9(11+)' },
      { notes: [45, 48, 52, 55, 59, 62], symbol: 'Amin11' },
      { notes: [46, 50, 53, 57, 60], symbol: 'Bbmaj9' },
      { notes: [48, 52, 55, 59, 62, 66], symbol: 'Cmaj9(11+)' },
    ],
  },
  {
    id: 'doux-baiser',
    label: 'Axel Real — Doux Baiser',
    intent: 'A complete real Axel Fisch progression: descending inversion bass, modal mixture, chromatic side-slips and an open dominant ending.',
    source: {
      composer: 'Axel Fisch',
      title: 'Ballad Jazz-Doux Baiser',
      tempoBpm: 65,
      writtenMeasures: 24,
      tonalRegions: ['D minor / D-centric — measures 1–16', 'G major with modal mixture — measures 17–24'],
      note: 'One written cycle only. Measure 19 is 2/4 in MusicXML; every other measure is 4/4.',
    },
    progression: [
      { measure: 1, beat: 1, beats: 2, notes: [50], symbol: 'Dm' },
      { measure: 1, beat: 3, beats: 2, notes: [48], symbol: 'Am/C' },
      { measure: 2, beat: 1, beats: 4, notes: [47], symbol: 'G/B' },
      { measure: 3, beat: 1, beats: 2, notes: [47], symbol: 'Bm' },
      { measure: 3, beat: 3, beats: 2, notes: [45], symbol: 'F#m/A' },
      { measure: 4, beat: 1, beats: 2, notes: [44], symbol: 'Abm' },
      { measure: 4, beat: 3, beats: 2, notes: [45], symbol: 'Aadd9' },
      { measure: 5, beat: 1, beats: 2, notes: [43], symbol: 'G7sus4' },
      { measure: 5, beat: 3, beats: 2, notes: [44], symbol: 'Abmaj7(#11)' },
      { measure: 6, beat: 1, beats: 2, notes: [48], symbol: 'Ab/C' },
      { measure: 6, beat: 3, beats: 2, notes: [42], symbol: 'D/F#' },
      { measure: 7, beat: 1, beats: 4, notes: [42], symbol: 'D/F#' },
      { measure: 8, beat: 1, beats: 2, notes: [50], symbol: 'Dm' },
      { measure: 8, beat: 3, beats: 2, notes: [48], symbol: 'Am/C' },
      { measure: 9, beat: 1, beats: 2, notes: [47], symbol: 'G/B' },
      { measure: 9, beat: 3, beats: 2, notes: [46], symbol: 'Gm/Bb' },
      { measure: 10, beat: 1, beats: 2, notes: [45], symbol: 'Am' },
      { measure: 10, beat: 3, beats: 2, notes: [43], symbol: 'Em/G' },
      { measure: 11, beat: 1, beats: 2, notes: [42], symbol: 'D/F#' },
      { measure: 11, beat: 3, beats: 2, notes: [41], symbol: 'Dm/F' },
      { measure: 12, beat: 1, beats: 2, notes: [40], symbol: 'E7sus4' },
      { measure: 12, beat: 3, beats: 2, notes: [40], symbol: 'E7' },
      { measure: 13, beat: 1, beats: 2, notes: [45], symbol: 'Aadd9' },
      { measure: 13, beat: 3, beats: 2, notes: [44], symbol: 'E/G#' },
      { measure: 14, beat: 1, beats: 4, notes: [43], symbol: 'Gadd9' },
      { measure: 15, beat: 1, beats: 2, notes: [42], symbol: 'F#m7' },
      { measure: 15, beat: 3, beats: 2, notes: [48], symbol: 'Cmaj7(#11)' },
      { measure: 16, beat: 1, beats: 1, notes: [49], symbol: 'A/C#' },
      { measure: 16, beat: 2, beats: 1, notes: [50], symbol: 'C/D' },
      { measure: 16, beat: 3, beats: 2, notes: [45], symbol: 'D7/A' },
      { measure: 17, beat: 1, beats: 1, notes: [43], symbol: 'G' },
      { measure: 17, beat: 2, beats: 1, notes: [47], symbol: 'G/B' },
      { measure: 17, beat: 3, beats: 2, notes: [48], symbol: 'Cmaj7' },
      { measure: 18, beat: 1, beats: 1, notes: [40], symbol: 'Em' },
      { measure: 18, beat: 2, beats: 1, notes: [39], symbol: 'Eb' },
      { measure: 18, beat: 3, beats: 2, notes: [50], symbol: 'D7' },
      { measure: 19, beat: 1, beats: 2, notes: [43], symbol: 'Gmaj7' },
      { measure: 20, beat: 1, beats: 1, notes: [43], symbol: 'Em/G' },
      { measure: 20, beat: 2, beats: 1, notes: [42], symbol: 'F#m' },
      { measure: 20, beat: 3, beats: 2, notes: [42], symbol: 'F#sus4' },
      { measure: 21, beat: 1, beats: 1, notes: [41], symbol: 'Fm' },
      { measure: 21, beat: 2, beats: 1, notes: [40], symbol: 'Emaj7' },
      { measure: 21, beat: 3, beats: 2, notes: [40], symbol: 'E7(b5)' },
      { measure: 22, beat: 1, beats: 2, notes: [45], symbol: 'Am7' },
      { measure: 22, beat: 3, beats: 2, notes: [50], symbol: 'D7sus4' },
      { measure: 23, beat: 1, beats: 2, notes: [48], symbol: 'Cm7' },
      { measure: 23, beat: 3, beats: 2, notes: [45], symbol: 'D/A' },
      { measure: 24, beat: 1, beats: 4, notes: [45], symbol: 'D/A' },
    ],
  },
];
