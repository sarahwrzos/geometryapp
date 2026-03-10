import { PointModel } from '../PointModel.js';
import { LineModel } from '../LineModel.js';

export class HalfPlaneSemiCircleModel extends LineModel {

    static create(pointModel1, pointModel2, color) {
        const line = new HalfPlaneSemiCircleModel(pointModel1, pointModel2, color);
        line.computeGeodesic();
        return line;
    }

    constructor(pointModel1, pointModel2, color) {
        super(pointModel1, pointModel2, color);

        this.center = new PointModel(0, 0);
        this.radius = null;
        this.listeners = [];
    }

    computeGeodesic() {
        if (!this.pointModel1 || !this.pointModel2) {
            throw new Error("Cannot compute geodesic without two points");
        }

        const x1 = this.pointModel1.x;
        const y1 = this.pointModel1.y;
        const x2 = this.pointModel2.x;
        const y2 = this.pointModel2.y;

        // Vertical lines are handled by a different model
        if (x1 === x2) {
            throw new Error("Points define a vertical geodesic, not a semicircle");
        }

        // Solve for center on x-axis (cy = 0)
        const cx = (x1*x1 + y1*y1 - x2*x2 - y2*y2) / (2 * (x1 - x2));
        const cy = 0;

        const r = Math.sqrt((x1 - cx)**2 + y1**2);

        this.center.setXY(cx, cy);
        this.radius = Math.abs(r);
        this.diameter = 2 * this.radius;
    }

    addListener(fn) {
        this.listeners.push(fn);
    }

    toJSON() {
        return JSON.stringify({
            color: this.color,
            pointModel1: this.pointModel1.toJSON(),
            pointModel2: this.pointModel2.toJSON()
        });
    }

    static fromJSON(jsonString) {
        const obj = JSON.parse(jsonString);

        const p1 = PointModel.fromJSON(obj.pointModel1);
        const p2 = PointModel.fromJSON(obj.pointModel2);

        return HalfPlaneSemiCircleModel.create(p1, p2, obj.color);
    }

}