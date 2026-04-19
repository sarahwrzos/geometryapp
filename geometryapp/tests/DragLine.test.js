import { describe, expect, it, vi } from 'vitest';
import { PointModel } from '../src/lib/geometry/models/PointModel.js';
import { DiscSceneModel } from '../src/lib/geometry/models/disc/DiscSceneModel.js';
import { DiscLineCircleModel } from '../src/lib/geometry/models/disc/DiscLineCircleModel.js';
import { DiscLineDiameterModel } from '../src/lib/geometry/models/disc/DiscLineDiameterModel.js';
import { HalfPlaneSceneModel } from '../src/lib/geometry/models/halfPlane/HalfPlaneSceneModel.js';
import { HalfPlaneSemiCircleModel } from '../src/lib/geometry/models/halfPlane/HalfPlaneSemiCircleModel.js';
import { HalfPlaneVerticalLineModel } from '../src/lib/geometry/models/halfPlane/HalfPlaneVerticalLineModel.js';

describe('Drag Line transitions', () => {
	it('disc view listener updates clip when line switches type during drag', () => {
		const scene = new DiscSceneModel();
		const viewListener = {
			update: vi.fn(),
			updateClip: vi.fn()
		};

		scene.addListener(viewListener);

		const p1 = new PointModel(0.2, 0.4);
		const p2 = new PointModel(0.6, 0.5);
		scene.addLine(p1, p2, 'black');

		viewListener.update.mockClear();
		viewListener.updateClip.mockClear();

		p1.setXY(0, 0.2);
		p2.setXY(0, 0.7);
		p2.setXY(0.3, 0.7);

		expect(viewListener.update).toHaveBeenCalled();
		expect(viewListener.updateClip).toHaveBeenCalledTimes(2);
	});

	it('half-plane view listener updates clip when line switches type during drag', () => {
		const scene = new HalfPlaneSceneModel();
		const viewListener = {
			update: vi.fn(),
			updateClip: vi.fn()
		};

		scene.addListener(viewListener);

		const p1 = new PointModel(1, 2);
		const p2 = new PointModel(3, 4);
		scene.addLine(p1, p2, 'black');

		viewListener.update.mockClear();
		viewListener.updateClip.mockClear();

		p2.setXY(1, 5);
		p2.setXY(2, 5);

		expect(viewListener.update).toHaveBeenCalled();
		expect(viewListener.updateClip).toHaveBeenCalledTimes(2);
	});

	it('disc: circle -> diameter -> circle when points are dragged', () => {
		const scene = new DiscSceneModel();
		const p1 = new PointModel(0.2, 0.4);
		const p2 = new PointModel(0.6, 0.5);

		scene.addLine(p1, p2, 'black');

		expect(scene.lineModels).toHaveLength(1);
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);

		p1.setXY(0, 0.2);
		p2.setXY(0, 0.7);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);
        expect(scene.lineModels).toHaveLength(1);

		p2.setXY(0.3, 0.7);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);
        expect(scene.lineModels).toHaveLength(1);
	});

	it('disc: diameter -> circle -> diameter when points are dragged', () => {
		const scene = new DiscSceneModel();
		const p1 = new PointModel(-0.5, 0);
		const p2 = new PointModel(0.5, 0);

		scene.addLine(p1, p2, 'black');

		expect(scene.lineModels).toHaveLength(1);
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);

		p1.setXY(0.1, 0.3);
		p2.setXY(0.6, 0.5);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);
        expect(scene.lineModels).toHaveLength(1);

		p1.setXY(0, 0.3);
		p2.setXY(0, 0.7);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);
        expect(scene.lineModels).toHaveLength(1);
	});

	it('half-plane: semi-circle -> vertical line -> semi-circle when points are dragged', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(1, 2);
		const p2 = new PointModel(3, 4);

		scene.addLine(p1, p2, 'black');

		expect(scene.lineModels).toHaveLength(1);
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);

		p2.setXY(1, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);
        expect(scene.lineModels).toHaveLength(1);

		p2.setXY(2, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);
        expect(scene.lineModels).toHaveLength(1);
	});

	it('half-plane: vertical line -> semi-circle -> vertical line when points are dragged', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(2, 2);
		const p2 = new PointModel(2, 5);

		scene.addLine(p1, p2, 'black');

		expect(scene.lineModels).toHaveLength(1);
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);

		p2.setXY(3, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);
        expect(scene.lineModels).toHaveLength(1);

		p2.setXY(2, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);
        expect(scene.lineModels).toHaveLength(1);
	});

	it('disc: near-diameter within 1e-6 is treated as diameter during drag', () => {
		const scene = new DiscSceneModel();
		const p1 = new PointModel(0.2, 0.4);
		const p2 = new PointModel(0.6, 0.5);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);

		// y = x + 5e-7 -> very close to origin (near diameter)
		p1.setXY(0.2, 0.2000005);
		p2.setXY(0.6, 0.6000005);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);
		expect(scene.lineModels).toHaveLength(1);
	});

	it('half-plane: near-vertical within 1e-6 switches to vertical, outside limit switches back', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(1, 2);
		const p2 = new PointModel(3, 4);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);

		// |dx| = 5e-7 < 1e-6 => should be vertical per HalfPlaneSceneModel.handleLineUpdate
		p2.setXY(1.0000005, 5);
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);

		// |dx| = 2e-6 > 1e-6 => should switch back to semicircle
		p2.setXY(1.000002, 5);
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);
		expect(scene.lineModels).toHaveLength(1);
	});

	it('half-plane: vertical model keeps exact x values from both points', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(1.0, 2);
		const p2 = new PointModel(2.0, 4);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);

		p2.setXY(1.0000005, 5);
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);

		const vertical = scene.lineModels[0];
		expect(vertical).toBeInstanceOf(HalfPlaneVerticalLineModel);
		expect(Math.abs(vertical.x1 - vertical.x2)).toBeGreaterThan(0);
		expect(vertical.x1).toBeCloseTo(1.0, 12);
		expect(vertical.x2).toBeCloseTo(1.0000005, 12);
		expect(vertical.x).toBeCloseTo((1.0 + 1.0000005) / 2, 12);
	});

	it('disc defers switching to a diameter until drag end', () => {
		const scene = new DiscSceneModel();
		const p1 = new PointModel(0.2, 0.4);
		const p2 = new PointModel(0.6, 0.5);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);

		scene.beginLineDrag();
		p1.setXY(0, 0.2);
		p2.setXY(0, 0.7);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);

		scene.endLineDrag();
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);
	});

	it('disc switches from diameter to circle during drag', () => {
		const scene = new DiscSceneModel();
		const p1 = new PointModel(-0.5, 0);
		const p2 = new PointModel(0.5, 0);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineDiameterModel);

		scene.beginLineDrag();
		p1.setXY(0.1, 0.3);
		p2.setXY(0.6, 0.5);

		expect(scene.lineModels[0]).toBeInstanceOf(DiscLineCircleModel);
	});

	it('half-plane defers switching to a vertical line until drag end', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(1, 2);
		const p2 = new PointModel(3, 4);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);

		scene.beginLineDrag();
		p2.setXY(1, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);

		scene.endLineDrag();
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);
	});

	it('half-plane switches from vertical line to semi-circle during drag', () => {
		const scene = new HalfPlaneSceneModel();
		const p1 = new PointModel(2, 2);
		const p2 = new PointModel(2, 5);

		scene.addLine(p1, p2, 'black');
		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneVerticalLineModel);

		scene.beginLineDrag();
		p2.setXY(3, 5);

		expect(scene.lineModels[0]).toBeInstanceOf(HalfPlaneSemiCircleModel);
	});
});
