import { PointModel } from "$lib/geometry/PointModel.js";

export class HalfPlaneLineModel {
    constructor(p1, p2, unitCircleCenter, unitCircleRadius) {
        // todo get rid of unit circle stuff
        // p1, p2, unitCircleCenter: PointModel instances
        this.p1 = p1;
        this.p2 = p2;
        this.unitCircleCenter = unitCircleCenter;
        this.unitCircleRadius = unitCircleRadius;
        this.center = new PointModel(0, 0);
        this.color = 'black';//TODO, make color a param

        this.computeGeodesic();

        // Listen to the points
        this.p1.addListener(() => {
            this.computeGeodesic();
            this.notifyListeners();
        });
        this.p2.addListener(() => {
            this.computeGeodesic();
            this.notifyListeners();
        });

        this.listeners = [];
    }

    addListener(fn) {
        this.listeners.push(fn);
    }

    notifyListeners() {
        this.listeners.forEach(fn => fn());
    }

    computeGeodesic() {
        const x1 = this.p1.x;
        const y1 = this.p1.y;
        const x2 = this.p2.x;
        const y2 = this.p2.y;

        const pageHeight = this.unitCircleCenter.y * 2;
        const y0 = (2/3) * pageHeight;

        // Check for vertical line
        if (Math.abs(x1 - x2) < 1e-5) {
            //todo vertical not working
            this.isVertical = true;
            this.center = null;
            this.radius = null;
            this.x = x1;   // vertical line x-coordinate
        } else {
            this.isVertical = false;

            // Compute center x-coordinate
            const cx = (x1**2 + (y1 - y0)**2 - x2**2 - (y2 - y0)**2) 
                    / (2 * (x1 - x2));

            // Store center as full point
            this.center = { x: cx, y: y0 };

            // Compute radius
            this.radius = Math.sqrt(
                (x1 - cx)**2 + (y1 - y0)**2
            );
        }
    }

    // findIntersection(otherLine) {
    //     //todo: check to make sure it works with this model
    //     const EPS = 1e-9;
    //     const ucx = this.unitCircleCenter.x;
    //     const ucy = this.unitCircleCenter.y;
    //     const ur  = this.unitCircleRadius;

    //     if (this.isDiameter === 1 && otherLine.isDiameter === 1) {
    //         return new PointModel(ucx, ucy);
    //     }

    // }

    // calcAngle(otherLine, intersectionPoint) {
    //     let v1, v2;

    //     if (this.isDiameter === 1) {
    //         v1 = { x: this.p2.x - this.p1.x, y: this.p2.y - this.p1.y };
    //     } else {
    //         const rx = intersectionPoint.x - this.center.x;
    //         const ry = intersectionPoint.y - this.center.y;
    //         v1 = { x: -ry, y: rx };
    //     }

    //     if (otherLine.isDiameter === 1) {
    //         v2 = { x: otherLine.p2.x - otherLine.p1.x, y: otherLine.p2.y - otherLine.p1.y };
    //     } else {
    //         const rx = intersectionPoint.x - otherLine.center.x;
    //         const ry = intersectionPoint.y - otherLine.center.y;
    //         v2 = { x: -ry, y: rx };
    //     }

    //     const dot = v1.x*v2.x + v1.y*v2.y;
    //     const mag1 = Math.hypot(v1.x, v1.y);
    //     const mag2 = Math.hypot(v2.x, v2.y);
    //     const cosTheta = Math.max(-1, Math.min(1, dot / (mag1*mag2)));
    //     return Math.acos(cosTheta);
    // }

    toJSON(pointIndexMap) {
        return {
            p1: { x: this.p1.x, y: this.p1.y },
            p2: { x: this.p2.x, y: this.p2.y },
            color: this.color
        };
    }

    static fromJSON(data, axisY = 0) {
        const p1 = new PointModel(data.p1.x, data.p1.y);
        const p2 = new PointModel(data.p2.x, data.p2.y);

        const line = new HalfPlaneLineModel(p1, p2, axisY);

        if (data.color) {
            line.color = data.color;
        }

        // Compute the geodesic now that points and axis are set
        line.computeGeodesic(axisY);

        return line;
    }
}