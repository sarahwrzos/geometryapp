import { describe, it, expect } from "vitest";
import { HalfPlaneSemiCircleModel } from "../src/lib/geometry/models/halfPlane/HalfPlaneSemiCircleModel.js";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";

describe("HalfPlaneSemiCircleModel", () => {

    it("creates a semicircle geodesic using create()", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 2);

        const line = HalfPlaneSemiCircleModel.create(p1, p2, "blue");

        expect(line.pointModel1).toBe(p1);
        expect(line.pointModel2).toBe(p2);
        expect(line.color).toBe("blue");
    });

    it("computeGeodesic computes center and radius", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 2);

        const line = HalfPlaneSemiCircleModel.create(p1, p2, "green");

        expect(line.center).toBeDefined();
        expect(line.radius).not.toBeNull();
        expect(typeof line.radius).toBe("number");
    });

    it("center lies on the x-axis", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 2);

        const line = HalfPlaneSemiCircleModel.create(p1, p2, "purple");

        expect(line.center.y).toBeCloseTo(0);
    });

    it("radius is positive", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 2);

        const line = HalfPlaneSemiCircleModel.create(p1, p2, "black");

        expect(line.radius).toBeGreaterThan(0);
    });

    it("throws error if points define a vertical line", () => {
        const p1 = new PointModel(2, 1);
        const p2 = new PointModel(2, 3);

        const line = new HalfPlaneSemiCircleModel(p1, p2, "red");

        expect(() => line.computeGeodesic()).toThrow();
    });

    it("serializes correctly with toJSON()", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 4);

        const line = HalfPlaneSemiCircleModel.create(p1, p2, "orange");

        const json = line.toJSON();
        const obj = JSON.parse(json);

        expect(obj.color).toBe("orange");
        expect(obj.pointModel1).toBeDefined();
        expect(obj.pointModel2).toBeDefined();
    });

    it("recreates object correctly from JSON", () => {
        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(4, 3);

        const original = HalfPlaneSemiCircleModel.create(p1, p2, "cyan");

        const json = original.toJSON();

        const recreated = HalfPlaneSemiCircleModel.fromJSON(json);

        expect(recreated.color).toBe("cyan");

        expect(recreated.pointModel1.x).toBeCloseTo(p1.x);
        expect(recreated.pointModel1.y).toBeCloseTo(p1.y);

        expect(recreated.pointModel2.x).toBeCloseTo(p2.x);
        expect(recreated.pointModel2.y).toBeCloseTo(p2.y);
    });

});