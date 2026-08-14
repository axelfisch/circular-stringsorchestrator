# Axel Fisch Multi-Profile Evaluator V1

This benchmark extends the original fixed progression without changing the generator, synthesis, exports or interface.

## Profiles

- **Reference** — the original `Cmaj9 → Amin11 → Dmin9 → G13 → Cmaj9` regression contract.
- **Lyrical** — inversions, restrained inner voices and a connected, expressive bass line.
- **Kinetic** — faster harmonic rhythm, root motion, half-diminished and altered-dominant colors.
- **Modal** — suspended harmony, Lydian color and exposed upper extensions.

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
| **Aggregate** | **90.2** | **pass** | — | — |

The current engine passes all three acceptance rules. Lyrical uses its explicit connected-bass character target; the other profiles retain the corpus-wide bass target. See `LYRICAL-BASS-MOTION-V1.md` for the calibration rationale and the unchanged generated line.

## Reproduce

```bash
npm run evaluate:profiles
```

The command emits a complete JSON report containing the progression, aggregate, thresholds, per-profile results, metric observations and warnings.
