import { PointModel } from '../PointModel.js'
import { LineModel } from '../LineModel.js'
import { SceneModel } from '../SceneModel.js'
import { DiscLineDiameterModel } from './DiscLineDiameterModel.js'
import { DiscLineCircleModel } from './DiscLineCircleModel.js'

export class DiscSceneModel extends SceneModel {
    constructor() {
        super();
    }

    addLine(pointModel1, pointModel2, color = "black") {
        if (!(pointModel1 instanceof PointModel && pointModel2 instanceof PointModel)) {
            throw new TypeError("Both arguments must be PointModel instances");
        }

        let line;
        let isDiameter = false;
        const EPS = 1e-2;

        const dx = pointModel2.x - pointModel1.x;
        const dy = pointModel2.y - pointModel1.y;

        if (Math.abs(dx) < EPS) {
            // Vertical line: check if it passes through origin
            if (Math.abs(pointModel1.x) < EPS) {
                isDiameter = true;
            }
        } else {
            // Non-vertical line: compute slope and y-intercept
            const m = dy / dx;
            const b = pointModel1.y - m * pointModel1.x;
            if (Math.abs(b) < EPS) {
                isDiameter = true;
            }
        }
        if (isDiameter === true) {
            // Create diameter line
            line = DiscLineDiameterModel.create(pointModel1, pointModel2, color, this);
        } else {
            // Otherwise, create a circle arc line
            line = DiscLineCircleModel.create(pointModel1, pointModel2, color, this);
        }

        // Use base class method to store it
        super.addLine(line);

        return line;
    }

    handleLineUpdate(lineModel) {
        const EPS = 1e-2;

        const dx = lineModel.pointModel2.x - lineModel.pointModel1.x;
        const dy = lineModel.pointModel2.y - lineModel.pointModel1.y;

        let isDiameter = false;

        if (Math.abs(dx) < EPS) {
            if (Math.abs(lineModel.pointModel1.x) < EPS) {
                isDiameter = true;
            }
        } else {
            const m = dy / dx;
            const b = lineModel.pointModel1.y - m * lineModel.pointModel1.x;
            if (Math.abs(b) < EPS) {
                isDiameter = true;
            }
        }

        if (this.isLineDragActive) {
            if (lineModel.type === "Circle" && isDiameter) {
                return;
            }

            if (lineModel.type === "Line" && !isDiameter) {
                const newModel = DiscLineCircleModel.create(
                    lineModel.pointModel1,
                    lineModel.pointModel2,
                    lineModel.color,
                    this
                );
                newModel.id = lineModel.id;
                this.replaceLine(lineModel, newModel);
                this.listeners.forEach(listener => listener.updateClip?.());
                return;
            }

            if (lineModel.type === "Line" || !isDiameter) {
                lineModel.computeGeodesic?.();
            }

            return;
        }

        if (isDiameter && lineModel.type !== "Line") {
            const newModel = DiscLineDiameterModel.create(
                lineModel.pointModel1,
                lineModel.pointModel2,
                lineModel.color,
                this
            );
            newModel.id = lineModel.id;
            this.replaceLine(lineModel, newModel);
            this.listeners.forEach(listener => listener.updateClip?.());
            return;
        }

        if (!isDiameter && lineModel.type !== "Circle") {
            const newModel = DiscLineCircleModel.create(
                lineModel.pointModel1,
                lineModel.pointModel2,
                lineModel.color,
                this
            );
            newModel.id = lineModel.id;
            this.replaceLine(lineModel, newModel);
            this.listeners.forEach(listener => listener.updateClip?.());
            return;
        }

        lineModel.computeGeodesic?.();
    }
}