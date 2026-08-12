import { describe, expect, it } from 'vitest';
import { aixelEngine } from './aixelEngine';

describe('AiXEL master model integration', () => {
  it('reads C voicings from the consolidated harmony dictionary', () => {
    expect(aixelEngine.getECMVoicing('C', 'add9')).toEqual(['C', 'E', 'G', 'D']);
  });

  it('transposes the chord lookup template to the selected key', () => {
    expect(aixelEngine.getECMVoicing('D', 'add9')).toEqual(['D', 'F#', 'A', 'E']);
  });

  it('exposes progression recipes from the consolidated profile', () => {
    const progression = aixelEngine.suggestProgression('C', 4);
    expect(progression.length).toBeGreaterThan(0);
    expect(progression.length).toBeLessThanOrEqual(4);
  });
});
