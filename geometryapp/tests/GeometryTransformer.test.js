// tests/GeometryTransformer.test.js
import { describe, it, expect } from "vitest";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";
import { GeometryTransformer } from "../src/lib/geometry/GeometryTransformer.js";

describe("GeometryTransformer", () => {

  it("transforms a disc point to half-plane", () => {
    const pDisc = new PointModel(0.5, -0.3);
    const pHalf = GeometryTransformer.DiscToHalfPlane(pDisc);

    expect(pHalf).toBeInstanceOf(PointModel);
    expect(typeof pHalf.x).toBe("number");
    expect(typeof pHalf.y).toBe("number");

    // Original point is unchanged
    expect(pDisc.x).toBe(0.5);
    expect(pDisc.y).toBe(-0.3);
  });

  it("transforms a half-plane point back to disc", () => {
    const pHalf = new PointModel(0.2, 0.7);
    const pDisc = GeometryTransformer.HalfPlaneToDisc(pHalf);

    expect(pDisc).toBeInstanceOf(PointModel);
    expect(typeof pDisc.x).toBe("number");
    expect(typeof pDisc.y).toBe("number");
  });

  it("inverse transform returns approximately the original point", () => {
    const pDisc = new PointModel(0.3, -0.5);
    const pHalf = GeometryTransformer.DiscToHalfPlane(pDisc);
    const pDiscBack = GeometryTransformer.HalfPlaneToDisc(pHalf);

    expect(pDiscBack.x).toBeCloseTo(pDisc.x, 10);
    expect(pDiscBack.y).toBeCloseTo(pDisc.y, 10);
  });

  it("handles negative coordinates correctly", () => {
    const pDisc = new PointModel(-0.7, -0.2);
    const pHalf = GeometryTransformer.DiscToHalfPlane(pDisc);
    const pDiscBack = GeometryTransformer.HalfPlaneToDisc(pHalf);

    expect(pDiscBack.x).toBeCloseTo(pDisc.x, 10);
    expect(pDiscBack.y).toBeCloseTo(pDisc.y, 10);
  });

});

describe("GeometryTransformer boundary tests", () => {

  it("transforms points near the boundary of the unit disc", () => {
    // Use points very close to the boundary
    const epsilon = 1e-8;
    const pointsDisc = [
      new PointModel(1 - epsilon, 0),   // near right boundary
      new PointModel(-1 + epsilon, 0),  // near left boundary
      new PointModel(0, 1 - epsilon),   // near top
      new PointModel(0, -1 + epsilon),  // near bottom
      new PointModel(Math.sqrt(0.5), Math.sqrt(0.5)), // near diagonal
    ];

    pointsDisc.forEach(pDisc => {
      const pHalf = GeometryTransformer.DiscToHalfPlane(pDisc);
      const pDiscBack = GeometryTransformer.HalfPlaneToDisc(pHalf);

      // Should approximately map back
      expect(pDiscBack.x).toBeCloseTo(pDisc.x, 8);
      expect(pDiscBack.y).toBeCloseTo(pDisc.y, 8);
    });
  });

});