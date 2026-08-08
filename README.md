# StringsOrchestrator - AiXEL Music System

A professional web-based chord orchestration and composition tool featuring a circular chord selector, real-time string ensemble orchestration, and intelligent voicing engine.

## Features

### 🎵 Circular Chord Selector
- Interactive 4-ring system for selecting musical elements:
  - **Outer Ring**: Music styles (Bossa Nova, Jazz Fusion, Waltz Jazz, etc.)
  - **Second Ring**: 12 musical keys (C through B, including flats/sharps)
  - **Third Ring**: Chord extensions (maj7, min9, 13, etc.)
  - **Inner Ring**: Bass inversions and foreign bass notes
- Smooth rotation and navigation controls
- Visual feedback with color-coded selections

### 🎻 StringsEngine V2 - Professional Orchestra
- 6-voice string ensemble:
  - Violin 1 (Crown - melody & tensions)
  - Violin 2 (Tensions & harmonies)
  - Viola 1 (3rd & 7th center)
  - Viola 2 (3rd & 7th center)
  - Cello (Countermelody)
  - Contrabass (Bass foundation)
- AiXEL Voicing Blueprints with 50+ chord types
- Intelligent voice leading and spacing rules
- ECM-style reverb and realistic string synthesis

### 🎼 8-Bar Sequencer
- Create chord progressions up to 8 measures
- Support for 1 or 2 chords per bar
- Real-time playback with tempo control (40-260 BPM)
- Loop functionality
- Visual beat tracking

### 🤖 AiXEL GPT Integration
- Direct link to AiXEL Music Orchestrator GPT
- Context-aware chord suggestions
- Automatic orchestration context export

## Technologies

- **React 18** with TypeScript
- **Tone.js** for audio synthesis and scheduling
- **Tailwind CSS** for responsive design
- **Canvas API** for circular selector visualization
- **Vite** for fast development and building

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── CircularSelector.tsx      # 4-ring chord selector
│   ├── ChordDisplay.tsx           # Current chord info panel
│   ├── ChordSequencer.tsx         # 8-bar sequencer
│   └── orchestrationpanel_v2.tsx  # String orchestration display
├── utils/
│   ├── stringsengine_v2.ts        # Professional strings engine
│   ├── audioEngine.ts             # Playback & scheduling
│   ├── chordMapper.ts             # Chord to MIDI conversion
│   ├── bassInversion.ts           # Bass note handling
│   └── epSampler.ts               # Electric piano sampler
├── data/
│   ├── AiXEL_20Chords_in12Keys.json
│   ├── AIXEL_MASTER_MODEL_2025_FULL.json
│   └── AiXEL_StringsOrchestrationRules.json
└── App.tsx                        # Main application
```

## AiXEL Voicing System

The StringsEngine implements sophisticated voicing rules inspired by professional jazz orchestration:

- **Center of Voicing**: 3rd & 7th played by violas
- **Extensions Crown**: 9, #11, 13 in upper voices (violins)
- **Bass Foundation**: Root note 2 octaves down (contrabass)
- **Countermelody**: 5th or root in cello
- **Spacing Rules**: Minimum 3rd, maximum 10th between inner voices
- **Voice Leading**: Smooth transitions with minimal movement

### Supported Chord Types
- Major: maj, maj7, maj9, maj9(#11), maj13(#11), add9
- Minor: min, min7, min9, min11, min(maj7), min6
- Dominant: 7, 9, 11, 13, 7(b9), 13(b9), 7(#11,13)
- Half-diminished: min7(b5), min9(b5)
- Suspended: sus2, sus4, 7sus4, sus13
- Diminished: dim, dim7
- And many more variations

## Credits

**by AxelFisch©2025/2026**

Powered by AiXEL Music System - Professional ECM-style orchestration engine.

## License

All rights reserved.
