import { describe, it, expect } from "vitest";
import { DiscLineCircleModel } from "../src/lib/geometry/models/disc/DiscLineCircleModel.js";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";

describe("DiscLineCircleModel", () => {

    it("stores points and color", () => {
        const p1 = new PointModel(0.2, 0.3);
        const p2 = new PointModel(-0.4, 0.1);

        const line = DiscLineCircleModel.create(p1, p2, "blue");

        expect(line.pointModel1).toBe(p1);
        expect(line.pointModel2).toBe(p2);
        expect(line.color).toBe("blue");
    });

    it("throws if arguments are not PointModel instances", () => {
        expect(() => {
            new DiscLineCircleModel({}, {}, "red");
        }).toThrow(TypeError);
    });

    it("computeGeodesic sets center and radius", () => {
        const p1 = new PointModel(0.2, 0.3);
        const p2 = new PointModel(-0.3, 0.2);

        const line = DiscLineCircleModel.create(p1, p2, "green");

        expect(line.center).toBeDefined();
        expect(line.radius).not.toBeNull();
        expect(typeof line.radius).toBe("number");
    });

    it("toJSON serializes correctly", () => {
        const p1 = new PointModel(0.1, 0.2);
        const p2 = new PointModel(-0.1, 0.4);

        const line = DiscLineCircleModel.create(p1, p2, "purple");

        const json = line.toJSON();
        const obj = JSON.parse(json);

        expect(obj.color).toBe("purple");
        expect(obj.pointModel1).toBeDefined();
        expect(obj.pointModel2).toBeDefined();
    });

    it("fromJSON recreates the object", () => {
        const p1 = new PointModel(0.3, 0.1);
        const p2 = new PointModel(-0.2, 0.4);

        const original = DiscLineCircleModel.create(p1, p2, "black");

        const json = original.toJSON();

        const recreated = DiscLineCircleModel.fromJSON(json);

        expect(recreated.color).toBe("black");
        expect(recreated.pointModel1.x).toBeCloseTo(p1.x);
        expect(recreated.pointModel1.y).toBeCloseTo(p1.y);
        expect(recreated.pointModel2.x).toBeCloseTo(p2.x);
        expect(recreated.pointModel2.y).toBeCloseTo(p2.y);
    });

});

describe("DiscLineCircleModel - distinct points", () => {

    it("throws an error if both points are identical", () => {
        const p1 = new PointModel(0.3, 0.4);
        const p2 = new PointModel(0.3, 0.4); // identical point

        expect(() => {
            DiscLineCircleModel.create(p1, p2, "red");
        }).toThrow("Points must be distinct");
    });

    it("does not throw if points are distinct", () => {
        const p1 = new PointModel(0.1, 0.2);
        const p2 = new PointModel(-0.2, 0.3);

        expect(() => {
            DiscLineCircleModel.create(p1, p2, "blue");
        }).not.toThrow();
    });

});