// tests/PointView.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PointModel } from "../src/lib/geometry/models/PointModel.js";
import { PointView } from "../src/lib/geometry/views/PointView.js";

describe("PointView", () => {
  let mockSvg;
  let mockCircle;

  beforeEach(() => {
    // Mock SVG circle element
    mockCircle = {
      cx: vi.fn().mockReturnThis(),
      cy: vi.fn().mockReturnThis(),
      fill: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      draggable: vi.fn().mockReturnThis(),
      front: vi.fn().mockReturnThis(),
    };

    // Mock SVG container
    mockSvg = {
      circle: vi.fn(() => mockCircle),
    };
  });

  it("createDraggable creates a PointView and draws it", () => {
    const p = new PointModel(0.2, 0.3);
    const view = PointView.createDraggable(p, mockSvg);

    // SVG circle should be created
    expect(mockSvg.circle).toHaveBeenCalledWith(8); // radius*2 default
    // Element should be stored
    expect(view.element).toBe(mockCircle);
    // Model should know about the view
    expect(p.view).toBe(view);
  });

  it("enableHover sets up mouseover and mouseout events", () => {
    const p = new PointModel(0.1, 0.2);
    const view = new PointView(p, mockSvg);
    view.element = mockCircle;

    view.enableHover("green", "blue");

    // Check that the events were attached
    expect(mockCircle.on).toHaveBeenCalledWith(
      "mouseover",
      expect.any(Function)
    );
    expect(mockCircle.on).toHaveBeenCalledWith(
      "mouseout",
      expect.any(Function)
    );
  });

  it("update moves the circle to the model's position", () => {
    const p = new PointModel(0.5, -0.5);
    const view = new PointView(p, mockSvg);
    view.element = mockCircle;

    view.update();

    expect(mockCircle.cx).toHaveBeenCalledWith(p.x);
    expect(mockCircle.cy).toHaveBeenCalledWith(p.y);
  });

  it("enableDrag clamps point within unit circle", () => {
    const p = new PointModel(0, 0);
    const view = new PointView(p, mockSvg);
    view.element = mockCircle;

    view.enableDrag();

    // Find the dragmove callback
    const dragCallback = mockCircle.on.mock.calls.find(
      ([event]) => event === "dragmove"
    )[1];

    const handlerMock = { move: vi.fn() };
    const event = {
      detail: { box: { cx: 2, cy: 0, w: 0, h: 0 }, handler: handlerMock },
    };

    dragCallback(event);

    // Because the drag tries to go outside radius=1, it should be clamped
    expect(p.x).toBeCloseTo(1);
    expect(p.y).toBeCloseTo(0);

    // Check that the draggable's move function was called
    expect(handlerMock.move).toHaveBeenCalled();
  });

  it("throws if model is not provided", () => {
    expect(() => new PointView(null, mockSvg)).toThrow();
  });

  it("createDraggable allows custom options", () => {
    const p = new PointModel(0.1, 0.1);
    const view = PointView.createDraggable(p, mockSvg, {
      radius: 10,
      color: "purple",
      highlightColor: "orange",
      normalColor: "pink",
      unitCircleCenterX: 0.5,
      unitCircleCenterY: 0.5,
      unitCircleRadius: 2,
    });

    expect(view.radius).toBe(10);
    expect(view.color).toBe("purple");
  });
});