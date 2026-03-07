import { describe, it, expect } from "vitest";
import { HalfPlaneVerticalLineModel } from "../src/lib/geometry/models/halfplane/HalfPlaneVerticalLineModel.js";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";

describe("HalfPlaneVerticalLineModel", () => {

    it("creates a vertical line geodesic using create()", () => {
        const p1 = new PointModel(2, 1);
        const p2 = new PointModel(2, 3);

        const line = HalfPlaneVerticalLineModel.create(p1, p2, "blue");

        expect(line.pointModel1).toBe(p1);
        expect(line.pointModel2).toBe(p2);
        expect(line.color).toBe("blue");
    });

    it("computeGeodesic sets x-coordinate correctly", () => {
        const p1 = new PointModel(5, 1);
        const p2 = new PointModel(5, 10);

        const line = HalfPlaneVerticalLineModel.create(p1, p2, "green");

        expect(line.x).toBe(5);
    });

    it("throws error if points are not vertical", () => {
        const p1 = new PointModel(1, 1);
        const p2 = new PointModel(2, 2);

        const line = new HalfPlaneVerticalLineModel(p1, p2, "red");

        expect(() => line.computeGeodesic()).toThrow();
    });

    it("serializes correctly with toJSON()", () => {
        const p1 = new PointModel(2, 1);
        const p2 = new PointModel(2, 4);

        const line = HalfPlaneVerticalLineModel.create(p1, p2, "purple");

        const json = line.toJSON();
        const obj = JSON.parse(json);

        expect(obj.color).toBe("purple");
        expect(obj.pointModel1).toBeDefined();
        expect(obj.pointModel2).toBeDefined();
    });

    it("recreates object correctly from JSON", () => {
        const p1 = new PointModel(3, 1);
        const p2 = new PointModel(3, 5);

        const original = HalfPlaneVerticalLineModel.create(p1, p2, "cyan");

        const json = original.toJSON();

        const recreated = HalfPlaneVerticalLineModel.fromJSON(json);

        expect(recreated.color).toBe("cyan");

        expect(recreated.pointModel1.x).toBeCloseTo(p1.x);
        expect(recreated.pointModel1.y).toBeCloseTo(p1.y);

        expect(recreated.pointModel2.x).toBeCloseTo(p2.x);
        expect(recreated.pointModel2.y).toBeCloseTo(p2.y);

        expect(recreated.x).toBeCloseTo(3);
    });

});