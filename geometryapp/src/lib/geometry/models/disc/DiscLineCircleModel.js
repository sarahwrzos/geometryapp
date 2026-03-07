import { PointModel } from '../PointModel.js';
import { LineModel } from '../LineModel.js'

export class DiscLineCircleModel extends LineModel {
    static create(pointModel1, pointModel2, color) {
        const line = new DiscLineCircleModel(pointModel1, pointModel2, color);
        line.computeGeodesic();
        return line;
    }

    constructor(pointModel1, pointModel2, color) {
        super(pointModel1, pointModel2, color);

        this.center = new PointModel(0, 0);
        this.radius = null;
    }

    computeGeodesic() {
        if (!this.pointModel1 || !this.pointModel2) {
            throw new Error("Cannot compute geodesic without two points");
        }

        const x1 = this.pointModel1.x;
        const y1 = this.pointModel1.y;
        const x2 = this.pointModel2.x;
        const y2 = this.pointModel2.y;

        const d1 = x1*x1 + y1*y1;
        const d2 = x2*x2 + y2*y2;

        const denom = 2 * (x1*y2 - y1*x2);

        if (denom === 0) {
            throw new Error("Points are collinear; cannot compute circle in unit disc");
        }

        const cx = (y2*(d1 + 1) - y1*(d2 + 1)) / denom;
        const cy = (x1*(d2 + 1) - x2*(d1 + 1)) / denom;

        const r = Math.sqrt(cx*cx + cy*cy - 1);

        // Update the circle
        this.center.setXY(cx, cy);
        this.radius = Math.abs(r);   // ensure positive radius
        this.diameter = 2 * this.radius;
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

        return DiscLineCircleModel.create(p1, p2, obj.color);
    }

}