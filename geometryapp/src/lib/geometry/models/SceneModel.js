import { PointModel } from './PointModel.js';
import { LineModel } from './LineModel.js';
import { HalfPlaneVerticalLineModel } from './halfPlane/HalfPlaneVerticalLineModel.js';
import { HalfPlaneSemiCircleModel } from './halfPlane/HalfPlaneSemiCircleModel.js';
import { DiscLineCircleModel } from './disc/DiscLineCircleModel.js';
import { DiscLineDiameterModel } from './disc/DiscLineDiameterModel.js';

export class SceneModel {
    constructor() {
        this.lineModels = [];
        this.circleModels = [];
        this.pointModels = [];
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener.update());
    }

    replaceLine(oldModel, newModel) {
        const index = this.lineModels.indexOf(oldModel);

        if (index !== -1) {
            newModel.id = oldModel.id;
            this.lineModels[index] = newModel;
            this.notify();
        }
    }

    addPoint(pointModel) {
        if (!(pointModel instanceof PointModel)) {
            throw new TypeError("Only PointModel instances can be added");
        }

        // Prevent duplicates
        if (!this.pointModels.includes(pointModel)) {
            this.pointModels.push(pointModel);

            pointModel.addListener(() => {
                this.notify();
            });

            this.notify();
        }
    }

    addLine(lineModel) {
        if (!(lineModel instanceof LineModel)) {
            throw new TypeError("Only LineModel instances can be added");
        }

        if (!this.lineModels.includes(lineModel)) {
            this.lineModels.push(lineModel);
            this.notify();
        }
    }

    addCircle(centerPointModel, pointModel, color = "black") {
        const circle = CircleModel.create(centerPointModel, pointModel, color);

        if (!this.circleModels.includes(circle)) {
            this.circleModels.push(circle);
            this.notify();
        }

        return circle;
    }

    removeCircle(circleModel) {
        const index = this.circleModels.indexOf(circleModel);
        if (index !== -1) {
            this.circleModels.splice(index, 1);
            this.notify();
        }
    }

    removeLine(lineModel) {
        const index = this.lineModels.indexOf(lineModel);
        if (index !== -1) {
            this.lineModels.splice(index, 1);
        }

        // remove the points that belong to the line
        this.removePoint(lineModel.pointModel1);
        this.removePoint(lineModel.pointModel2);

        this.notify();
    }

    removePoint(pointModel) {
        const index = this.pointModels.indexOf(pointModel);
        if (index !== -1) {
            this.pointModels.splice(index, 1);

            this.circleModels = this.circleModels.filter(circle =>
                circle.center !== pointModel && circle.pointModel !== pointModel
            );

            this.notify();
        }
    }

    clearAll() {
        this.pointModels = [];
        this.lineModels = [];
        this.circleModels = [];
        this.notify();
    }

}