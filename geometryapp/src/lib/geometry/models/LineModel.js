import PointModel from './PointModel.js';

class LineModel {

    // p1 and p2 are point model instances
    constructor(pointModel1, pointModel2, color) {
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
    }

}