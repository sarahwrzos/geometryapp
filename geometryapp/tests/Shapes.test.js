import { describe, test, expect, vi } from 'vitest';
import { Point } from '../src/lib/geometry/PointView.js';
import { DiskHyperbolicLine } from '../src/lib/geometry/DiskLineModel.js';
import { Shapes } from '../src/lib/geometry/SceneModel.js';

describe('Shapes', () => {

  const unitCircleX = 0;
  const unitCircleY = 0;
  const unitCircleRadius = 1;

  test('creates Shapes instance with empty arrays', () => {
    const shapes = new Shapes(unitCircleX, unitCircleY, unitCircleRadius);

    expect(shapes.unitCircleCenter).toEqual(new Point(unitCircleX, unitCircleY));
    expect(shapes.unitCircleRadius).toBe(unitCircleRadius);
    expect(shapes.lines).toEqual([]);
    expect(shapes.points).toEqual([]);
  });

  test('addPoint adds a point to points array', () => {
    const shapes = new Shapes(unitCircleX, unitCircleY, unitCircleRadius);
    const p = shapes.addPoint(0.2, 0.3);

    expect(p).toBeInstanceOf(Point);
    expect(p.x).toBe(0.2);
    expect(p.y).toBe(0.3);
    expect(shapes.points.length).toBe(1);
    expect(shapes.points[0]).toBe(p);
  });

  test('addLine adds a DiskHyperbolicLine to lines array', () => {
    const shapes = new Shapes(unitCircleX, unitCircleY, unitCircleRadius);
    const p1 = new Point(0.1, 0.2);
    const p2 = new Point(-0.2, 0.3);

    const line = shapes.addLine(p1, p2);

    expect(line).toBeInstanceOf(DiskHyperbolicLine);
    expect(shapes.lines.length).toBe(1);
    expect(shapes.lines[0]).toBe(line);
    expect(line.p1).toBe(p1);
    expect(line.p2).toBe(p2);
  });

  test('drawAll calls draw on all lines and points', () => {
    const shapes = new Shapes(unitCircleX, unitCircleY, unitCircleRadius);
    const p1 = shapes.addPoint(0.1, 0.2);
    const p2 = shapes.addPoint(0.3, 0.4);
    const line = shapes.addLine(p1, p2);

    // Mock the draw functions
    line.draw = vi.fn();
    p1.draw = vi.fn();
    p2.draw = vi.fn();

    const mockDraw = {}; // dummy SVG container
    shapes.drawAll(mockDraw);

    expect(line.draw).toHaveBeenCalledWith(mockDraw);
    expect(p1.draw).toHaveBeenCalledWith(mockDraw);
    expect(p2.draw).toHaveBeenCalledWith(mockDraw);
  });

  test('clearAll removes all lines and points', () => {
    const shapes = new Shapes(unitCircleX, unitCircleY, unitCircleRadius);
    const p1 = shapes.addPoint(0.1, 0.2);
    const p2 = shapes.addPoint(0.3, 0.4);
    const line = shapes.addLine(p1, p2);

    // Mock svgElement for removal
    line.svgElement = { remove: vi.fn() };
    p1.svgElement = { remove: vi.fn() };
    p2.svgElement = { remove: vi.fn() };

    shapes.clearAll();

    expect(line.svgElement).toBeNull();
    expect(p1.svgElement).toBeNull();
    expect(p2.svgElement).toBeNull();
    expect(shapes.lines.length).toBe(0);
    expect(shapes.points.length).toBe(0);

    expect(line.svgElement?.remove).toBeUndefined(); // ensure remove called before null
    expect(p1.svgElement?.remove).toBeUndefined();
    expect(p2.svgElement?.remove).toBeUndefined();
  });

});
