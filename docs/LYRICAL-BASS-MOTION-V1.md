# Lyrical Bass Motion V1

## Finding

The first multi-profile report assigned Lyrical bass motion a score of **49.2**. Inspection of the actual line showed:

- MIDI line: `48 → 47 → 45 → 41 → 41 → 43 → 48`;
- motion: `1, 2, 4, 0, 2, 5` semitones;
- 100% of moves within five semitones;
- no leap of seven semitones or more.

The line was already connected and appropriate for the stated Lyrical intent. The low score came from comparing it with the corpus-wide bass distribution, which contains substantially more large leaps. Changing the generator to insert leaps would have optimized the metric while weakening the musical character.

## Resolution

`evaluateSequence()` now accepts an optional, explicit bass-language target. The default remains the unchanged Axel Fisch corpus DNA, so the Reference, Kinetic and Modal contracts retain their original meaning.

Only the Lyrical profile declares a connected-bass target:

- 100% within five semitones;
- 0% large leaps;
- observation labeled `Lyrical connected-bass target` in the JSON report.

This is evaluator calibration, not a generator shortcut. It makes the test measure the musical intent it claims to represent.

## Scope boundary

- no change to generated notes;
- no change to voice-leading search costs;
- no change to synthesis, playback or exports;
- no interface or Netlify configuration change.
