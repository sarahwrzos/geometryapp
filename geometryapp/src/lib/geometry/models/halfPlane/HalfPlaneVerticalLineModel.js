import { PointModel } from '../PointModel.js';
import { LineModel } from '../LineModel.js';

export class HalfPlaneVerticalLineModel extends LineModel {

    static create(pointModel1, pointModel2, color) {
        const line = new HalfPlaneVerticalLineModel(pointModel1, pointModel2, color);
        line.computeGeodesic();
        return line;
    }

    constructor(pointModel1, pointModel2, color) {
        super(pointModel1, pointModel2, color);
        this.type = "Line";
        this.x = null; // x-coordinate of vertical line

        this.listeners = [];
    }

    computeGeodesic() {
        if (!this.pointModel1 || !this.pointModel2) {
            throw new Error("Cannot compute geodesic without two points");
        }

        // if (this.pointModel1.x !== this.pointModel2.x) {
        //     throw new Error("Points do not define a vertical line");
        // }

        this.x = this.pointModel1.x;
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

        return HalfPlaneVerticalLineModel.create(p1, p2, obj.color);
    }

}