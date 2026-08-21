# Axel Role Director V1

## Intent

Keep the circular UI and the six-voice StringsEngine. Change **how** notes are chosen so the output matches Axel Fisch chamber-string writing instead of a homophonic tension block.

Corpus sources for this wave:

- MusicXML: Afri-Can Reunion, Flying Circus, On her way home, 3 anges pour une fretless, All She Give me, Stay with us my friend
- Audio references (2026): same six arrangements as sonic ground truth
- Prior MIDI DNA: 7 canonical sextets, 24 411 notes

## Role model

| Voice | Role | Behaviour |
| --- | --- | --- |
| Violin 1 | Melody crown | Chord tones 1/3/5 or characteristic 9/13; #11 only when the quality asks for it. When piano/voice has the melody → +12 doubling or top chord-tone/extension |
| Violin 2 + 2 Violas | Inner triad choir | 1-3-5 / 3-5-9 / 3-5-7 — pad, pizz, or marcato |
| Cello | Counter-line | 5th, 3rd, or sixth-below; may sit near Bass −12 |
| Contrabass | Foundation | Root as house; 3/5/7/9 to approach the **next** chord |

## Textures

| Id | Source feel | Engine behaviour |
| --- | --- | --- |
| `pad-legato` | Afri-Can | Sustained six-voice pad (previous default) |
| `pizz-groove` | Flying Circus | Short inner durations; melody slightly longer |
| `marcato-hits` | Cadences | Short aligned attacks, higher velocity |
| `unison-octave` | Climaxes | Vln1=Vln2; Cello ≈ Bass +12 |

## Bass approach planner

When `nextChordSymbol` is provided and the current bass is not a slash bass, the Contrabass may leave the pure root and take 3, 5, 7 or 9 of the **current** chord if that pitch walks toward the next root.

Exports (`buildMidiExportNotes`, MusicXML, PDF) call `orchestrateSequence()` so every written part sees N→N+1. Texture selected in the panel is passed through to all three exporters.

## UI addition (minimal)

A compact **Texture** row inside the existing String Orchestration panel:

- Legato / Pizz / Marcato / Unison
- State is lifted to App so MIDI / MusicXML / PDF exports honour the same choice
- Circular chord selector, sequencer layout, Assistant and Netlify functions are untouched

## What did **not** change

- Circular chord selector design
- Sequencer layout, Assistant, Netlify functions
- Six named export parts (MIDI / MusicXML / PDF)

## Scope boundary

UI addition is limited to a compact **Texture** row inside the existing String Orchestration panel. No second app, no redesign of the wheel.
