import { PointModel } from "$lib/geometry/PointModel.js";

export class DiskLineModel {
    constructor(p1, p2, unitCircleCenter, unitCircleRadius) {
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
        // Translate points relative to unit circle center
        const x1 = this.p1.x - this.unitCircleCenter.x;
        const y1 = this.p1.y - this.unitCircleCenter.y;
        const x2 = this.p2.x - this.unitCircleCenter.x;
        const y2 = this.p2.y - this.unitCircleCenter.y;

        const cross = x1 * y2 - y1 * x2;

        if (Math.abs(cross) < 1e-9) {
            this.isDiameter = 1;
            this.computeDiameter(x1, y1, x2, y2);
        } else {
            this.isDiameter = 0;
            this.computeCircle();
        }
    }

    computeDiameter(x1, y1, x2, y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const r = this.unitCircleRadius;
        const cx = this.unitCircleCenter.x;
        const cy = this.unitCircleCenter.y;

        const xStart = cx + r * Math.cos(angle + Math.PI);
        const yStart = cy + r * Math.sin(angle + Math.PI);
        const xEnd   = cx + r * Math.cos(angle);
        const yEnd   = cy + r * Math.sin(angle);

        // Update the existing PointModels
        this.p1.set(xStart, yStart);
        this.p2.set(xEnd, yEnd);

        this.center = null;
        this.radius = null;
        this.diameter = r * 2;
    }

    computeCircle() {
        const ucx = this.unitCircleCenter.x;
        const ucy = this.unitCircleCenter.y;
        const ur = this.unitCircleRadius;

        // shift points relative to center
        const x1 = this.p1.x - ucx;
        const y1 = this.p1.y - ucy;
        const x2 = this.p2.x - ucx;
        const y2 = this.p2.y - ucy;

        const d1 = x1*x1 + y1*y1;
        const d2 = x2*x2 + y2*y2;
        const denom = 2 * (x1*y2 - y1*x2);

        const cx0 = (y2*(d1 + ur*ur) - y1*(d2 + ur*ur)) / denom;
        const cy0 = (x1*(d2 + ur*ur) - x2*(d1 + ur*ur)) / denom;

        this.center.set(cx0 + ucx, cy0 + ucy);
        this.radius = Math.sqrt(cx0*cx0 + cy0*cy0 - ur*ur);
        this.diameter = this.radius * 2;
    }

    findIntersection(otherLine) {
        const EPS = 1e-9;
        const ucx = this.unitCircleCenter.x;
        const ucy = this.unitCircleCenter.y;
        const ur  = this.unitCircleRadius;

        if (this.isDiameter === 1 && otherLine.isDiameter === 1) {
            return new PointModel(ucx, ucy);
        }

    }

    calcAngle(otherLine, intersectionPoint) {
        let v1, v2;

        if (this.isDiameter === 1) {
            v1 = { x: this.p2.x - this.p1.x, y: this.p2.y - this.p1.y };
        } else {
            const rx = intersectionPoint.x - this.center.x;
            const ry = intersectionPoint.y - this.center.y;
            v1 = { x: -ry, y: rx };
        }

        if (otherLine.isDiameter === 1) {
            v2 = { x: otherLine.p2.x - otherLine.p1.x, y: otherLine.p2.y - otherLine.p1.y };
        } else {
            const rx = intersectionPoint.x - otherLine.center.x;
            const ry = intersectionPoint.y - otherLine.center.y;
            v2 = { x: -ry, y: rx };
        }

        const dot = v1.x*v2.x + v1.y*v2.y;
        const mag1 = Math.hypot(v1.x, v1.y);
        const mag2 = Math.hypot(v2.x, v2.y);
        const cosTheta = Math.max(-1, Math.min(1, dot / (mag1*mag2)));
        return Math.acos(cosTheta);
    }

    toJSON(pointIndexMap) {
        return {
            p1: pointIndexMap.get(this.p1),
            p2: pointIndexMap.get(this.p2),
            color: this.color
        };
    }

    static fromJSON(data, unitCircleCenter, unitCircleRadius) {
        const p1 = new PointModel(data.p1.x, data.p1.y);
        const p2 = new PointModel(data.p2.x, data.p2.y);

        const line = new DiskLineModel(
            p1,
            p2,
            unitCircleCenter,
            unitCircleRadius
        );

        if (data.color) {
            line.color = data.color;
        }

        return line;
    }
}