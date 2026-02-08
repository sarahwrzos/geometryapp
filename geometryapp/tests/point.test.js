import { describe, test, expect } from 'vitest';

import { Point } from "../src/lib/geometry/Point.js";

describe("Point", () => {

  test("creates a point with x and y coordinates", () => {
    const p = new Point(3, 4);

    expect(p.x).toBe(3);
    expect(p.y).toBe(4);
  });

  test("handles negative coordinates", () => {
    const p = new Point(-2, -5);

    expect(p.x).toBe(-2);
    expect(p.y).toBe(-5);
  });

  test("handles floating point values", () => {
    const p = new Point(Math.PI, Math.E);

    expect(p.x).toBeCloseTo(Math.PI);
    expect(p.y).toBeCloseTo(Math.E);
  });

  test("two points with same coordinates are equal structurally", () => {
    const p1 = new Point(1, 2);
    const p2 = new Point(1, 2);

    expect(p1).toEqual(p2); // deep equality
  });

});
