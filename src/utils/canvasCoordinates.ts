export interface CanvasRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export function toCanvasPoint(
  clientX: number,
  clientY: number,
  rect: CanvasRect,
  canvasWidth: number,
  canvasHeight: number
): CanvasPoint {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (clientX - rect.left) * (canvasWidth / rect.width),
    y: (clientY - rect.top) * (canvasHeight / rect.height)
  };
}
