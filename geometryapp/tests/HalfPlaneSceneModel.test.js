import { describe, it, expect } from "vitest";
import { HalfPlaneSceneModel } from "../src/lib/geometry/models/halfplane/HalfPlaneSceneModel.js";
import { HalfPlaneVerticalLineModel } from "../src/lib/geometry/models/halfplane/HalfPlaneVerticalLineModel.js";
import { HalfPlaneSemiCircleModel } from "../src/lib/geometry/models/halfplane/HalfPlaneSemiCircleModel.js";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";

describe("HalfPlaneSceneModel", () => {

    it("creates a vertical line when x-coordinates match", () => {
        const scene = new HalfPlaneSceneModel();

        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(1, 5);

        const line = scene.addLine(p1, p2, "blue");

        expect(line).toBeInstanceOf(HalfPlaneVerticalLineModel);
        expect(scene.lineModels).toContain(line);
        expect(line.color).toBe("blue");
    });

    it("creates a circle geodesic when x-coordinates differ", () => {
        const scene = new HalfPlaneSceneModel();

        const p1 = new PointModel(1, 2);
        const p2 = new PointModel(3, 4);

        const line = scene.addLine(p1, p2, "red");

        expect(line).toBeInstanceOf(HalfPlaneSemiCircleModel);
        expect(scene.lineModels).toContain(line);
        expect(line.color).toBe("red");
    });

    it("stores multiple lines correctly", () => {
        const scene = new HalfPlaneSceneModel();

        const l1 = scene.addLine(
            new PointModel(2, 1),
            new PointModel(2, 4)
        );

        const l2 = scene.addLine(
            new PointModel(0, 2),
            new PointModel(3, 3)
        );

        expect(scene.lineModels.length).toBe(2);
        expect(scene.lineModels).toContain(l1);
        expect(scene.lineModels).toContain(l2);
    });

    it("throws error if arguments are not PointModel instances", () => {
        const scene = new HalfPlaneSceneModel();

        expect(() => {
            scene.addLine({}, {});
        }).toThrow(TypeError);
    });

    it("throws an error if a point is not in the upper half-plane", () => {
        const scene = new HalfPlaneSceneModel();

        const p1 = new PointModel(1, -2);  // invalid: below x-axis
        const p2 = new PointModel(2, 3);

        expect(() => {
            scene.addLine(p1, p2);
        }).toThrow();
    });

});