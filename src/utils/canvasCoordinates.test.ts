import { describe, expect, it } from 'vitest';
import { toCanvasPoint } from './canvasCoordinates';

describe('toCanvasPoint', () => {
  it('maps responsive CSS coordinates to the internal canvas space', () => {
    expect(
      toCanvasPoint(250, 150, { left: 50, top: 50, width: 400, height: 400 }, 800, 800)
    ).toEqual({ x: 400, y: 200 });
  });

  it('handles an unavailable layout without invalid coordinates', () => {
    expect(
      toCanvasPoint(10, 10, { left: 0, top: 0, width: 0, height: 0 }, 800, 800)
    ).toEqual({ x: 0, y: 0 });
  });
});
