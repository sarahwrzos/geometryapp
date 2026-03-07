import { describe, test, expect } from 'vitest';
import { PointModel } from "../src/lib/geometry/models/PointModel.js";
import { DiscSceneModel } from "../src/lib/geometry/models/disc/DiscSceneModel.js";
import { DiscLineCircleModel } from "../src/lib/geometry/models/disc/DiscLineCircleModel.js";
import { DiscLineDiameterModel } from "../src/lib/geometry/models/disc/DiscLineDiameterModel.js";

describe("DiscSceneModel", () => {

  test("adds a diameter line through the origin", () => {
    const scene = new DiscSceneModel();
    const p1 = new PointModel(-0.5, 0);
    const p2 = new PointModel(0.5, 0);

    const line = scene.addLine(p1, p2, "red");

    expect(line).toBeInstanceOf(DiscLineDiameterModel);
    expect(scene.lineModels).toContain(line);
    expect(line.color).toBe("red");
  });

  test("adds a circle arc line not through the origin", () => {
    const scene = new DiscSceneModel();
    const p1 = new PointModel(0.1, 0.1);
    const p2 = new PointModel(0.4, 0.2);

    const line = scene.addLine(p1, p2, "blue");

    expect(line).toBeInstanceOf(DiscLineCircleModel);
    expect(scene.lineModels).toContain(line);
    expect(line.color).toBe("blue");
  });

  test("throws error when adding invalid points", () => {
    const scene = new DiscSceneModel();
    const p1 = { x: 0, y: 0 }; // not a PointModel
    const p2 = new PointModel(0.5, 0);

    expect(() => scene.addLine(p1, p2)).toThrow(TypeError);
  });

  test("multiple lines are stored correctly", () => {
    const scene = new DiscSceneModel();
    const dLine = scene.addLine(new PointModel(-0.5, 0), new PointModel(0.5, 0));
    const cLine = scene.addLine(new PointModel(0.1, 0.1), new PointModel(0.4, 0.2));

    expect(scene.lineModels.length).toBe(2);
    expect(scene.lineModels).toContain(dLine);
    expect(scene.lineModels).toContain(cLine);
  });

});