# Axel Fisch Voice Leading V1

Voice Leading V1 applies the measured chamber-strings DNA to the existing six-part generator without changing the UI or the harmonic blueprints.

## Musical behavior

- preserves every selected pitch class and foreign bass;
- searches legal octave placements across the physical range of each instrument;
- favors the corpus-derived central register of Crown, Tension, Upper/Lower Harmony, Counterline and Foundation;
- favors adjacent spacing around five semitones, with a preferred corridor of three to eight;
- targets the measured 32-semitone vertical span;
- minimizes movement independently for all six roles, not only the two harmony voices;
- applies role-specific leap budgets;
- adds a soft cost for adjacent parallel fifths and octaves rather than forbidding them.

The search is deterministic and evaluates the complete sextet before applying a result. This prevents local octave corrections from creating a new crossing elsewhere.

## Measured result

Fixed progression: `Cmaj9 → Amin11 → Dmin9 → G13 → Cmaj9`.

| Metric | Before | Voice Leading V1 | Delta |
| --- | ---: | ---: | ---: |
| Total | 63.7 | 78.9 | +15.2 |
| Average frame quality | 79.2 | 90.4 | +11.2 |
| Role-aware motion | 45.2 | 71.3 | +26.1 |
| Bass movement | 45.8 | 84.2 | +38.4 |
| Parallel-perfect control | 0 | 0 | 0 |

The grade changes from `promising` to `strong`. Parallel perfect motion remains the clearest unresolved weakness and is intentionally reported rather than hidden.

## Scope boundary

No visual, playback, export, sequencer, Assistant or Netlify configuration change is included.
