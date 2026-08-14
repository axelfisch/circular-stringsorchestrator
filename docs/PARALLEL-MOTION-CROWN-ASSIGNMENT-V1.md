# Parallel Motion & Crown Assignment V1

This iteration lets each string role choose among the pitch classes already present in the chord blueprint. It does not add foreign notes or rewrite the harmony.

## Assignment model

- Contrabass preserves the requested root, inversion or foreign bass.
- Cello favors root/fifth, but may use a third or seventh to form an independent counterline and avoid automatic octave doubling.
- Both violas prioritize thirds and sevenths in the center.
- Violin 2 favors a complementary extension or upper guide tone.
- Violin 1 (Crown) prioritizes #11, 13, 11 and 9 before a seventh.

A deterministic beam search evaluates complete six-part candidates. Its cost combines role function, DNA register, melodic movement, spacing, span, duplicated pitch classes and adjacent parallel fifths/octaves. Parallel perfects remain a soft penalty, not an absolute prohibition.

## Measured result

Fixed progression: `Cmaj9 → Amin11 → Dmin9 → G13 → Cmaj9`.

| Metric | Voice Leading V1 | Crown Assignment V1 | Delta |
| --- | ---: | ---: | ---: |
| Total | 78.9 | 90.4 | +11.5 |
| Average frame quality | 90.4 | 91.0 | +0.6 |
| Role-aware motion | 71.3 | 86.8 | +15.5 |
| Parallel-perfect control | 0 | 100 | +100 |
| Bass movement | 84.2 | 84.2 | 0 |

Relative to the original pre-DNA generator, the total gain is `63.7 → 90.4` (`+26.7`). The evaluator reports no warnings on the fixed progression.

## Scope boundary

No UI, visual design, playback synthesis, sequencer, export, Assistant or Netlify configuration change is included.
