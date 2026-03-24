import { PointModel } from '../PointModel.js';
import { SceneModel } from '../SceneModel.js';
import { HalfPlaneSemiCircleModel } from './HalfPlaneSemiCircleModel.js';
import { HalfPlaneVerticalLineModel } from './HalfPlaneVerticalLineModel.js';

export class HalfPlaneSceneModel extends SceneModel {

    constructor() {
        super();
    }

    addLine(pointModel1, pointModel2, color = "black") {

        if (!(pointModel1 instanceof PointModel && pointModel2 instanceof PointModel)) {
            throw new TypeError("Both arguments must be PointModel instances");
        }

        if (pointModel1.y <= 0 || pointModel2.y <= 0) {
            throw new Error("Points must lie in the upper half-plane (y > 0)");
        }

        let line;
        const EPS = 1e-10;

        const dx = pointModel2.x - pointModel1.x;

        // Vertical geodesic case
        if (Math.abs(dx) < EPS) {
            console.log("vertical")
            line = HalfPlaneVerticalLineModel.create(pointModel1, pointModel2, color);
        }
        // Circular geodesic case

        else {
            console.log("normal")
            line = HalfPlaneSemiCircleModel.create(pointModel1, pointModel2, color);
        }

        super.addLine(line);

        return line;
    }
}