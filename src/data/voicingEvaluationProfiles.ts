export interface EvaluationChord {
  symbol: string;
  notes: number[];
}

export interface VoicingEvaluationProfile {
  id: 'reference' | 'lyrical' | 'kinetic' | 'modal';
  label: string;
  intent: string;
  bassLanguageTarget?: {
    motionWithinFiveSemitones: number;
    leapAtLeastSevenSemitones: number;
    label: string;
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
];
