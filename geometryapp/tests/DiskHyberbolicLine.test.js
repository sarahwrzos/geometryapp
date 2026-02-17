import { describe, test, expect } from 'vitest';
import { Point } from '../src/lib/geometry/PointView.js';
import { DiskHyperbolicLine } from '../src/lib/geometry/DiskLineModel.js';

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
    // if diameter, it has no center and radius
    expect(line.center).toBeNull();
    expect(line.radius).toBeNull();
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
    expect(line.center).toBeNull();
    expect(line.radius).toBeNull();
  });

  test('findIntersection handles diameter–diameter, diameter–circle, circle–circle, and null case', () => {
    const unitCircleCenter = new Point(0, 0);
    const unitCircleRadius = 1;

    const d1 = new DiskHyperbolicLine(
        new Point(0.5, 0),
        new Point(-0.5, 0),
        unitCircleCenter,
        unitCircleRadius
    );

    const d2 = new DiskHyperbolicLine(
        new Point(0, 0.5),
        new Point(0, -0.5),
        unitCircleCenter,
        unitCircleRadius
    );

    const centerIntersection = d1.findIntersection(d2);
    expect(centerIntersection.x).toBeCloseTo(0);
    expect(centerIntersection.y).toBeCloseTo(0);

    const circleLine = new DiskHyperbolicLine(
        new Point(0.3, 0.4),
        new Point(0.3, -0.4),
        unitCircleCenter,
        unitCircleRadius
    );


    const mixedIntersection = d1.findIntersection(circleLine);
    expect(mixedIntersection).not.toBeNull();
    expect(mixedIntersection.x * mixedIntersection.x +
            mixedIntersection.y * mixedIntersection.y).toBeLessThan(1);

    const c1 = new DiskHyperbolicLine(
        new Point(0.4, 0.2),
        new Point(-0.4, 0.2),
        unitCircleCenter,
        unitCircleRadius
    );

    const c2 = new DiskHyperbolicLine(
        new Point(0.2, 0.4),
        new Point(0.2, -0.4),
        unitCircleCenter,
        unitCircleRadius
    );


    const circleIntersection = c1.findIntersection(c2);
    expect(circleIntersection).not.toBeNull();
    expect(circleIntersection.x * circleIntersection.x +
            circleIntersection.y * circleIntersection.y).toBeLessThan(1);

    const parallel1 = new DiskHyperbolicLine(
        new Point(0.4, 0.6),
        new Point(-0.4, 0.6),
        unitCircleCenter,
        unitCircleRadius
    );

    const parallel2 = new DiskHyperbolicLine(
        new Point(0.4, -0.6),
        new Point(-0.4, -0.6),
        unitCircleCenter,
        unitCircleRadius
    );


    expect(parallel1.findIntersection(parallel2)).toBeNull();
  });

    test('calcAngle computes correct angle and is symmetric', () => {
        const unitCircleCenter = new Point(0, 0);
        const unitCircleRadius = 1;

        const horizontal = new DiskHyperbolicLine(
            new Point(0.5, 0),
            new Point(-0.5, 0),
            unitCircleCenter,
            unitCircleRadius
        );

        const vertical = new DiskHyperbolicLine(
            new Point(0, 0.5),
            new Point(0, -0.5),
            unitCircleCenter,
            unitCircleRadius
        );

        const p = horizontal.findIntersection(vertical);
        const rightAngle = horizontal.calcAngle(vertical, p);

        expect(rightAngle).toBeCloseTo(Math.PI / 2, 6);

        const circleLine = new DiskHyperbolicLine(
            new Point(0.3, 0.4),
            new Point(0.3, -0.4),
            unitCircleCenter,
            unitCircleRadius
        );

        const p2 = horizontal.findIntersection(circleLine);

        const a1 = horizontal.calcAngle(circleLine, p2);
        const a2 = circleLine.calcAngle(horizontal, p2);

        expect(a1).toBeCloseTo(a2, 6);
        expect(a1).toBeGreaterThan(0);
        expect(a1).toBeLessThan(Math.PI);
    });



});
