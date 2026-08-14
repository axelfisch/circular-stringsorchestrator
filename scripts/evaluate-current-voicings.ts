import { StringsEngine } from '../src/utils/stringsengine_v2';
import { evaluateSequence } from '../src/utils/voicingEvaluator';

const progression = [
  { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
  { notes: [45, 48, 52, 55, 59], symbol: 'Amin11' },
  { notes: [50, 53, 57, 60, 64], symbol: 'Dmin9' },
  { notes: [43, 47, 50, 53, 57, 64], symbol: 'G13' },
  { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
];

const engine = new StringsEngine();
const frames = progression.map(({ notes, symbol }) => {
  const result = engine.orchestrateChord(notes, symbol);
  return { label: symbol, voices: result.voices };
});

console.log(JSON.stringify({
  evaluator: 'Axel Fisch Voicing Evaluator V1',
  profile: 'Axel Fisch Chamber Strings DNA V1',
  progression: progression.map((item) => item.symbol),
  frames: frames.map((frame) => ({
    label: frame.label,
    voices: frame.voices.map((voice) => ({ voice: voice.voice, midiNote: voice.midiNote, interval: voice.intervalName })),
  })),
  result: evaluateSequence(frames),
}, null, 2));
