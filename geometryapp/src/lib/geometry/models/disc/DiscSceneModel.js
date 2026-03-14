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
        const EPS = 1e-10;

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
        console.log(isDiameter)
        if (isDiameter === true) {
            // Create diameter line
            console.log("diameter")
            line = DiscLineDiameterModel.create(pointModel1, pointModel2, color);
        } else {
            // Otherwise, create a circle arc line
            console.log("else")
            line = DiscLineCircleModel.create(pointModel1, pointModel2, color);
        }

        // Use base class method to store it
        super.addLine(line);

        return line;
    }
}