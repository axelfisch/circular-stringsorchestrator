# Axel Real Progression V1 — Ballad Jazz-Doux Baiser

## Source identity

- Composer: Axel Fisch
- Written form: 24 measures, 48 harmony events
- Tempo: 65 BPM
- Meter: 4/4 except measure 19, encoded as 2/4 in MusicXML and MIDI
- Tonal regions declared by the composer: D minor / D-centric (measures 1–16), then G major with modal mixture (measures 17–24)
- Content: chord progression without melody

The repository stores the complete normalized progression in `src/data/voicingEvaluationProfiles.ts`. Large media is intentionally excluded: the 89 MB WAV remains an external listening reference rather than Git history.

## Source cross-check

- iReal HTML and PDF agree on the written chord grid.
- MusicXML contains 24 measures and 48 harmony events.
- MIDI is format 1, 480 PPQ, exact tempo 65 BPM, with Piano, Bass, Drums and Click tracks but no melody track.
- MIDI duration: 528.001 seconds.
- WAV duration: 530.389 seconds; the 2.387-second difference is consistent with an audio tail.
- The MIDI playback contains six passes of the 24-measure form, while the evaluator stores one written cycle only.
- MIDI and MusicXML key-signature metadata say C; the composer's declared D-minor-to-G-major regions are therefore recorded explicitly in the profile.

## Harmonic fingerprint

- 20 of 48 harmony events use an alternate bass (41.7%).
- The opening bass contour is `D → C → B → A → Ab → A`.
- The reprise extends a chromatic descent: `D → C → B → Bb → A → G → F# → F → E`.
- Characteristic colors include add9, maj7#11, suspended dominants, modal major/minor exchange and chromatic side-slips.
- `E7sus4 → E7 → Aadd9` supplies a delayed secondary-dominant resolution.
- `C/D → D7/A` prepares the G-major region.
- The ending `Cm7 → D/A → D/A` leaves the dominant open rather than closing on G.

## Audio reference

- WAV: PCM 16-bit, 44.1 kHz, stereo.
- Peak: approximately -6.94 dBFS; RMS: approximately -24.75 dBFS; crest factor: approximately 17.81 dB.
- The reference is dynamic, unclipped and spectrally warm; its measured tempo candidates include the encoded 65 BPM.

## Engine implications

This real progression exposed two parser requirements now covered by tests:

1. slash-bass symbols must retain their chord quality (`Am/C`, `D/F#`, `Cmaj7(#11)/D`);
2. dominant flat-five color must be recognized explicitly (`E7(b5)`).

The profile is intended as a full-form stress test for inversion bass, chromatic harmony, modal transition and open dominant endings. It is not derived from a synthetic textbook progression.
