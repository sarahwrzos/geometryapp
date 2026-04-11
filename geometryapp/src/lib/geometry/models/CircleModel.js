import { PointModel } from './PointModel.js';

export class CircleModel {

    static create(center, pointModel, color, sceneModel){
        if (center === pointModel) {
            throw new Error("Points must be distinct")
        }
        const circle = new DiscCircleModel(center, pointModel, color, sceneModel);
        circle.computeGeodesic();
        return circle;
    }
    constructor(center, pointModel, color, sceneModel){
        if (!(center instanceof PointModel)) {
            throw new TypeError("center must be an instance of PointModel");
        }
        
        if (!(pointModel instanceof PointModel)) {
            throw new TypeError("pointModel must be an instance of PointModel");
        }

        this.center = new PointModel(0, 0);
        this.radius = null;

        this.pointModel = pointModel;
        this.color = color;
        this.sceneModel = sceneModel;
        
        this.listeners = [];

        this.center.addListener(() => {
            this.sceneModel.handleCircleUpdate(this);//TODO
            this.notify();
        });

        this.pointModel.addListener(() => {
            this.sceneModel.handleCircleUpdate(this);
            this.notify();
        });
    }

    computeGeodesic() {
        
    } 

}