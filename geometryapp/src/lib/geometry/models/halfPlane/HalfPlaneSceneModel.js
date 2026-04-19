import { PointModel } from '../PointModel.js';
import { SceneModel } from '../SceneModel.js';
import { HalfPlaneSemiCircleModel } from './HalfPlaneSemiCircleModel.js';
import { HalfPlaneVerticalLineModel } from './HalfPlaneVerticalLineModel.js';
import { LineModel } from '../LineModel.js';

export class HalfPlaneSceneModel extends SceneModel {

    static EPS = 1e-6;

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
        const EPS = HalfPlaneSceneModel.EPS;

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
            const isVertical = Math.abs(lineModel.pointModel1.x - lineModel.pointModel2.x) < HalfPlaneSceneModel.EPS;

            if (this.isLineDragActive) {
                console.log(
                    `[HalfPlaneSceneModel:update] dragging=true, lines=${this.lineModels.length}, lineId=${lineModel.id}, currentType=${lineModel.type}, vertical=${isVertical}`
                );

                if (lineModel.type === "Line" && !isVertical) {
                    const newModel = HalfPlaneSemiCircleModel.create(
                        lineModel.pointModel1,
                        lineModel.pointModel2,
                        lineModel.color,
                        this
                    );

                    this.replaceLine(lineModel, newModel);
                    this.listeners.forEach(listener => listener.updateClip?.());
                    return;
                }

                if (lineModel.type === "Line") {
                    lineModel.x1 = lineModel.pointModel1.x;
                    lineModel.x2 = lineModel.pointModel2.x;
                    lineModel.x = (lineModel.x1 + lineModel.x2) / 2;
                    return;
                }

                if (!isVertical) {
                    lineModel.computeGeodesic?.();
                }

                return;
            }

            console.log(
                `[HalfPlaneSceneModel:update] lines=${this.lineModels.length}, lineId=${lineModel.id}, currentType=${lineModel.type}, vertical=${isVertical}`
            );
    
            // If type should change → replace
            if (isVertical && lineModel.type !== "Line") {
                console.log(
                    `[HalfPlaneSceneModel:update] switching lineId=${lineModel.id} to Line` 
                );
                const newModel = HalfPlaneVerticalLineModel.create(
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
                console.log(
                    `[HalfPlaneSceneModel:update] switching lineId=${lineModel.id} to Circle`
                );
                const newModel = HalfPlaneSemiCircleModel.create(
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