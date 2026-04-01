import { PointModel } from '../PointModel.js';
import { SceneModel } from '../SceneModel.js';
import { HalfPlaneSemiCircleModel } from './HalfPlaneSemiCircleModel.js';
import { HalfPlaneVerticalLineModel } from './HalfPlaneVerticalLineModel.js';
import { LineModel } from '../LineModel.js';

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
        const EPS = 1e-8;

        const dx = pointModel2.x - pointModel1.x;

        // Vertical geodesic case
        if (Math.abs(dx) < EPS) {
            console.log("vertical")
            line = HalfPlaneVerticalLineModel.create(pointModel1, pointModel2, color, this);
        }
        // Circular geodesic case

        else {
            console.log("arc")
            line = HalfPlaneSemiCircleModel.create(pointModel1, pointModel2, color, this);
        }

        super.addLine(line);

        return line;
    }

        handleLineUpdate(lineModel) {
            const isVertical = Math.abs(lineModel.pointModel1.x - lineModel.pointModel2.x) < 1e-6;
    
            // If type should change → replace
            if (isVertical && lineModel.type !== "Line") {
                const newModel = new HalfPlaneVerticalLineModel(
                    lineModel.pointModel1,
                    lineModel.pointModel2,
                    lineModel.color,
                    this
                );
    
                this.replaceLine(lineModel, newModel);
                this.listeners.forEach(listener => listener.updateClip?.());
                return;
            }
    
            if (!isVertical && lineModel.type !== "Circle") {
                const newModel = new HalfPlaneSemiCircleModel( 
                    lineModel.pointModel1,
                    lineModel.pointModel2,
                    lineModel.color,
                    this
                );
    
                this.replaceLine(lineModel, newModel);
                this.listeners.forEach(listener => listener.updateClip?.());
                return;
            }
    
            // Otherwise just recompute geometry
            lineModel.computeGeodesic?.();
        }
}