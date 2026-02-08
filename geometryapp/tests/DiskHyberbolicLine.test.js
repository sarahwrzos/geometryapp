import { describe, test, expect } from 'vitest';
import { Point } from '../src/lib/geometry/Point.js';
import { DiskHyperbolicLine } from '../src/lib/geometry/DiskHyperbolicLine.js';

describe('DiskHyperbolicLine', () => {

  const unitCircleCenter = new Point(0, 0);
  const unitCircleRadius = 1;

  test('stores points correctly', () => {
    const p1 = new Point(0.2, 0.3);
    const p2 = new Point(-0.4, 0.1);

    const line = new DiskHyperbolicLine(p1, p2, unitCircleCenter, unitCircleRadius);

    expect(line.p1).toEqual(p1);
    expect(line.p2).toEqual(p2);
  });

  test('detects diameter correctly', () => {
    const p1 = new Point(0.5, 0);
    const p2 = new Point(-0.5, 0);

    const line = new DiskHyperbolicLine(p1, p2, unitCircleCenter, unitCircleRadius);

    expect(line.isDiameter).toBe(1);
    expect(line.center).toBeUndefined();
    expect(line.radius).toBeUndefined();
  });

  test('computes circle for non-diameter correctly', () => {
    const p1 = new Point(0.2, 0.3);
    const p2 = new Point(-0.4, 0.1);

    const line = new DiskHyperbolicLine(p1, p2, unitCircleCenter, unitCircleRadius);

    expect(line.isDiameter).toBe(0);
    expect(line.center).toBeDefined();
    expect(line.radius).toBeDefined();
    expect(line.diameter).toBeCloseTo(line.radius * 2);

    // Geometric invariant: |center - unitCenter|^2 = radius^2 + ur^2
    const dx = line.center.x - unitCircleCenter.x;
    const dy = line.center.y - unitCircleCenter.y;
    const left = dx*dx + dy*dy;
    const right = line.radius*line.radius + unitCircleRadius*unitCircleRadius;

    expect(left).toBeCloseTo(right, 6);
  });

  test('diameter case does not compute center or radius', () => {
    const p1 = new Point(0.1, 0);
    const p2 = new Point(-0.1, 0);

    const line = new DiskHyperbolicLine(p1, p2, unitCircleCenter, unitCircleRadius);

    expect(line.isDiameter).toBe(1);
    expect(line.center).toBeUndefined();
    expect(line.radius).toBeUndefined();
  });

});
