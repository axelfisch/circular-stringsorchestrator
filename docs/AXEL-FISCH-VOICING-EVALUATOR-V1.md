# Axel Fisch Voicing Evaluator V1

This evaluator establishes a reproducible **before/after benchmark** before any change is made to StringsEngine V2.

It measures similarity to the Axel Fisch chamber-strings language extracted from 11 MIDI files (24,411 notes; seven canonical six-part arrangements). It does **not** claim to measure absolute artistic quality.

## Scored dimensions

- six-role completeness;
- corpus-derived register for Crown, Tension, Upper/Lower Harmony, Counterline and Foundation;
- voice ordering and crossings;
- adjacent spacing (preferred 3–8 semitones, center 5);
- vertical span (corpus center: 32 semitones);
- placement of guide tones, extensions and bass functions;
- interval-class and bass-relative vertical language;
- role-specific melodic motion and leap budgets across a sequence;
- bass movement language;
- parallel perfect motion, penalized above the 2% corpus soft ceiling but never prohibited.

Every metric returns a 0–100 score, a documented weight and a plain-language observation. The aggregate is therefore inspectable rather than a black box.

## Reproduce the current baseline

```bash
npm run evaluate:voicings
```

The command evaluates a fixed five-chord progression through the current generator and prints JSON. After a future generator change, run the same command and use `compareEvaluations()` to obtain the total delta and every metric delta.

## Scope boundary

V1 is a pure evaluation layer. It does not alter generation rules, playback, exports, the React interface or Claude's visual design.
