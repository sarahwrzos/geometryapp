import { PointModel } from "$lib/geometry/PointModel.js";
import { DiskLineModel } from "$lib/geometry/DiskLineModel.js";
import { HalfPlaneLineModel } from "./HalfPlaneLineModel";

export class SceneModel {
    constructor(uccx, uccy, uccr, sceneType = "disk") {
        this.unitCircleCenter = new PointModel(uccx, uccy);
        this.unitCircleCenterX = uccx;
        this.unitCircleCenterY = uccy;
        this.unitCircleRadius = uccr;
        this.sceneType = sceneType;
        this.lines = [];
        this.points = [];
        
    }

    addPoint(x, y) {
        const point = new PointModel(x, y, this.unitCircleCenterX, this.unitCircleCenterY, this.unitCircleRadius);
        this.points.push(point);
        return point;
    }

    addLine(p1, p2) {
        if (this.sceneType === "disk") {
            const line = new DiskLineModel(
                p1,
                p2,
                this.unitCircleCenter,
                this.unitCircleRadius
            );
            this.lines.push(line);
            return line;
        }
        else {
            //create other line
            const line = new HalfPlaneLineModel(
                p1,
                p2,
                this.unitCircleCenter,
                this.unitCircleRadius
            )
            this.lines.push(line);
            return line;
        }
        
    }

    removeLine(line) {
        this.lines = this.lines.filter(l => l !== line);

        const { p1, p2 } = line;

        this.points = this.points.filter(
            p => p !== p1 && p !== p2
        );
    }

    

    clear() {
        this.lines = [];
        this.points = [];
    }

    toJSON() {
        const pointIndexMap = new Map();

        this.points.forEach((p, i) => {
            pointIndexMap.set(p, i);
        });

        return {
            unitCircleCenter: this.unitCircleCenter.toJSON(),
            unitCircleRadius: this.unitCircleRadius,
            points: this.points.map(p => p.toJSON()),
            lines: this.lines.map(l => ({
                p1Index: pointIndexMap.get(l.p1),
                p2Index: pointIndexMap.get(l.p2),
                color: l.color
            }))
        };
    }

    loadFromJSON(data) {
        this.clear();

        // Restore points first
        const pointMap = [];

        data.points.forEach(pData => {
            const p = this.addPoint(pData.x, pData.y);
            pointMap.push(p);
        });

        // Restore lines
        data.lines.forEach(lData => {
            const p1 = pointMap[lData.p1Index];
            const p2 = pointMap[lData.p2Index];

            this.addLine(p1, p2);
            line.color = lData.color || 'black';
        });
    }
}