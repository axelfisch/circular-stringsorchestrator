# Axel Fisch Multi-Profile Evaluator V1

This benchmark extends the original fixed progression with synthetic character studies and a complete real Axel Fisch composition profile.

## Profiles

- **Reference** — the original `Cmaj9 → Amin11 → Dmin9 → G13 → Cmaj9` regression contract.
- **Lyrical** — inversions, restrained inner voices and a connected, expressive bass line.
- **Kinetic** — faster harmonic rhythm, root motion, half-diminished and altered-dominant colors.
- **Modal** — suspended harmony, Lydian color and exposed upper extensions.
- **Axel Real — Doux Baiser** — 24 written measures and 48 events from a real Axel Fisch progression, including inversion bass, modal change and an open dominant ending.

Every profile starts with a fresh `StringsEngine`. Results are therefore deterministic and do not leak voice-leading state from one musical character into another.

## Acceptance contract

- Reference score must remain at or above **90.4**.
- Every profile must remain in the evaluator's **excellent** band: **85.0** or higher.
- The four-profile aggregate must remain at or above **88.0**.

These floors are regression guards, not claims of absolute artistic quality. A passing result does not replace listening tests.

## Current measured result

| Profile | Score | Grade | Parallel perfects | Bass motion |
| --- | ---: | --- | ---: | ---: |
| Reference | 90.4 | excellent | 100.0 | 84.2 |
| Lyrical | 91.0 | excellent | 100.0 | 100.0 |
| Kinetic | 90.2 | excellent | 100.0 | 92.9 |
| Modal | 89.3 | excellent | 100.0 | 72.5 |
| Axel Real — Doux Baiser | 87.0 | excellent | 100.0 | 58.6 |
| **Aggregate** | **89.6** | **pass** | — | — |

The current engine passes all three acceptance rules. Lyrical uses its explicit connected-bass character target; the other profiles retain the corpus-wide bass target. `Axel Real — Doux Baiser` is the lowest profile at 87.0 but remains in the excellent band without warnings. See `LYRICAL-BASS-MOTION-V1.md` and `AXEL-REAL-PROGRESSION-DOUX-BAISER-V1.md` for the source-specific rationale.

## Reproduce

```bash
npm run evaluate:profiles
```

The command emits a complete JSON report containing the progression, aggregate, thresholds, per-profile results, metric observations and warnings.
