import { PointModel } from '../PointModel.js';
import { LineModel } from '../LineModel.js';

export class DiscLineDiameterModel extends LineModel {

    static create(pointModel1, pointModel2, color) {
        const line = new DiscLineDiameterModel(pointModel1, pointModel2, color);
        line.computeGeodesic();
        return line;
    }

    constructor(pointModel1, pointModel2, color) {
        super(pointModel1, pointModel2, color);

        // A diameter always passes through the origin
        this.center = new PointModel(0, 0);
        this.direction = null; // normalized direction vector

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

        // Direction vector of the line
        let dx = x2 - x1;
        let dy = y2 - y1;

        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            throw new Error("Points must be distinct");
        }

        // Normalize direction
        dx /= length;
        dy /= length;

        this.direction = { x: dx, y: dy };
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

        return DiscLineDiameterModel.create(p1, p2, obj.color);
    }

}