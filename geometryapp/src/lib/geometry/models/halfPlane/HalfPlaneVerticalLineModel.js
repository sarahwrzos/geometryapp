import { PointModel } from '../PointModel.js';
import { LineModel } from '../LineModel.js';
import { HalfPlaneSemiCircleModel } from './HalfPlaneSemiCircleModel.js';
import { SceneModel } from '../SceneModel.js';

export class HalfPlaneVerticalLineModel extends LineModel {

    static create(pointModel1, pointModel2, color, sceneModel) {
        const line = new HalfPlaneVerticalLineModel(pointModel1, pointModel2, color, sceneModel);
        line.computeGeodesic();
        return line;
    }

    constructor(pointModel1, pointModel2, color, sceneModel) {
        super(pointModel1, pointModel2, color, sceneModel);
        this.type = "Line";
        this.shouldBeCircle = false;
        this.x = null; // x-coordinate of vertical line

        //this.listeners = [];
    }

    getType(){
        return this.type;
    }

    computeGeodesic() {
        if (!this.pointModel1 || !this.pointModel2) {
            throw new Error("Cannot compute geodesic without two points");
        }

        // detect if it is still vertical
        // const isVertical = Math.abs(this.pointModel1.x - this.pointModel2.x) < 1e-2;

        // if (!isVertical) {
        //     // 👉 no longer a vertical line → replace with circle model

        //     const newModel = new HalfPlaneSemiCircleModel(
        //         this.pointModel1,
        //         this.pointModel2,
        //         this.color,
        //         this.sceneModel
        //     );

        //     this.sceneModel.replaceLine(this, newModel);
        //     return;
        // }

        // still a vertical line → update normally
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