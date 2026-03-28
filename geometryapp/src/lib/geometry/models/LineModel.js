import { PointModel } from './PointModel.js';

export class LineModel {

    // p1 and p2 are point model instances
    constructor(pointModel1, pointModel2, color, sceneModel) {
        if (new.target === LineModel) {
            throw new Error("Cannot instantiate an abstract class directly");
        }

        // make sure they are pointModels
        if (!(pointModel1 instanceof PointModel)) {
            throw new TypeError("pointModel1 must be an instance of PointModel");
        }

        if (!(pointModel2 instanceof PointModel)) {
            throw new TypeError("pointModel2 must be an instance of PointModel");
        }

        this.pointModel1 = pointModel1;
        this.pointModel2 = pointModel2;
        this.color = color;
        this.sceneModel = sceneModel;
        this.id = crypto.randomUUID();
        
        this.listeners = [];

        this.pointModel1.addListener(() => {
            this.sceneModel.handleLineUpdate(this);
            this.notify();
        });

        this.pointModel2.addListener(() => {
            this.sceneModel.handleLineUpdate(this);
            this.notify();
        });
    }

    computeGeodesic() {
        throw new Error("computeGeodesic() must be implemented in subclass");
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(l => l());
    }

}