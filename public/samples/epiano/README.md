# Electric Piano Samples

This directory should contain EP (Electric Piano) samples for the StringsOrchestrator.

## Required Sample Files

The application expects the following sample files in `.mp3` format:

- `EP_C3.mp3` - C note in octave 3
- `EP_F3.mp3` - F note in octave 3
- `EP_A#3.mp3` - A# note in octave 3
- `EP_D4.mp3` - D note in octave 4
- `EP_F4.mp3` - F note in octave 4
- `EP_A#4.mp3` - A# note in octave 4

## Sample Sources

You can obtain high-quality EP samples from:

1. **Free Sources:**
   - Freesound.org (search for "Rhodes" or "Wurlitzer")
   - Musical Artifacts
   - Philharmonia Orchestra free samples

2. **Commercial Sources:**
   - Spitfire Audio
   - Native Instruments
   - Arturia V Collection

3. **Create Your Own:**
   - Use Logic Pro's Electric Piano instruments
   - Use Ableton Live's Electric Piano presets
   - Sample from hardware Rhodes/Wurlitzer if available

## Sample Specifications

For best results:
- **Format:** MP3 (44.1kHz or 48kHz)
- **Duration:** 2-4 seconds (with natural decay)
- **Velocity:** Medium (around 80-100 MIDI velocity)
- **Style:** Clean Rhodes or Wurlitzer tone
- **Processing:** Light chorus and minimal reverb

## Fallback Behavior

If samples are not available, the application will fall back to using Tone.js synthesized sounds. However, for the authentic ECM/AiXEL sound, real EP samples are highly recommended.

## Testing

After adding samples, test playback by:
1. Adding chords to the sequence
2. Clicking Play
3. Listening for authentic electric piano sound with proper reverb/chorus

## License

Ensure you have appropriate licenses for any commercial samples used in your project.
