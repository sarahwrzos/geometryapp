import { describe, it, expect } from "vitest";
import { DiscLineDiameterModel } from "../src/lib/geometry/models/disc/DiscLineDiameterModel.js";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";

describe("DiscLineDiameterModel", () => {

    it("creates a diameter geodesic with create()", () => {
        const p1 = new PointModel(0.2, 0.3);
        const p2 = new PointModel(-0.4, 0.1);

        const line = DiscLineDiameterModel.create(p1, p2, "blue");

        expect(line.pointModel1).toBe(p1);
        expect(line.pointModel2).toBe(p2);
        expect(line.color).toBe("blue");
    });

    it("computeGeodesic computes normalized direction", () => {
        const p1 = new PointModel(0.2, 0.3);
        const p2 = new PointModel(-0.4, 0.1);

        const line = DiscLineDiameterModel.create(p1, p2, "green");

        expect(line.direction).toBeDefined();

        const length = Math.sqrt(
            line.direction.x * line.direction.x +
            line.direction.y * line.direction.y
        );

        expect(length).toBeCloseTo(1);
    });

    it("throws error if points are identical", () => {
        const p = new PointModel(0.2, 0.3);

        const line = new DiscLineDiameterModel(p, p, "red");

        expect(() => line.computeGeodesic()).toThrow();
    });

    it("serializes correctly with toJSON()", () => {
        const p1 = new PointModel(0.1, 0.2);
        const p2 = new PointModel(-0.3, 0.4);

        const line = DiscLineDiameterModel.create(p1, p2, "purple");

        const json = line.toJSON();
        const obj = JSON.parse(json);

        expect(obj.color).toBe("purple");
        expect(obj.pointModel1).toBeDefined();
        expect(obj.pointModel2).toBeDefined();
    });

    it("recreates object from JSON", () => {
        const p1 = new PointModel(0.1, 0.2);
        const p2 = new PointModel(-0.3, 0.4);

        const original = DiscLineDiameterModel.create(p1, p2, "black");

        const json = original.toJSON();

        const recreated = DiscLineDiameterModel.fromJSON(json);

        expect(recreated.color).toBe("black");

        expect(recreated.pointModel1.x).toBeCloseTo(p1.x);
        expect(recreated.pointModel1.y).toBeCloseTo(p1.y);

        expect(recreated.pointModel2.x).toBeCloseTo(p2.x);
        expect(recreated.pointModel2.y).toBeCloseTo(p2.y);
    });

});

describe("DiscLineDiameterModel - distinct points", () => {

    it("throws an error if both points are identical", () => {
        const p1 = new PointModel(0.5, 0.0);
        const p2 = new PointModel(0.5, 0.0); // identical point

        expect(() => {
            DiscLineDiameterModel.create(p1, p2, "red");
        }).toThrow("Points must be distinct");
    });

    it("does not throw if points are distinct", () => {
        const p1 = new PointModel(0.0, 0.5);
        const p2 = new PointModel(0.0, -0.5);

        expect(() => {
            DiscLineDiameterModel.create(p1, p2, "blue");
        }).not.toThrow();
    });

    it("computes the correct normalized direction", () => {
        const p1 = new PointModel(0.0, -1.0);
        const p2 = new PointModel(0.0, 1.0);

        const line = DiscLineDiameterModel.create(p1, p2, "green");

        expect(line.direction).toBeDefined();
        // Should point roughly along the line from p1 -> p2
        expect(line.direction.x).toBeCloseTo(0);
        expect(line.direction.y).toBeCloseTo(1);
    });

});