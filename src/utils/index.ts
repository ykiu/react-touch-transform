export type XY = [number, number];

export function subXY(xy1: XY, xy2: XY): XY {
  return [xy1[0] - xy2[0], xy1[1] - xy2[1]];
}

export function addXY(xy1: XY, xy2: XY): XY {
  return [xy1[0] + xy2[0], xy1[1] + xy2[1]];
}

export function mulXY(xy: XY, mul: number): XY {
  return [xy[0] * mul, xy[1] * mul];
}

export function divXY(xy: XY, divider: number): XY {
  return [xy[0] / divider, xy[1] / divider];
}

export function getDistance(xy1: XY, xy2: XY): number {
  return Math.sqrt((xy1[0] - xy2[0]) ** 2 + (xy1[1] - xy2[1]) ** 2);
}

export function noop(): void {
  // does nothing
}
