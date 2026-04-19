import { PointModel } from './PointModel.js';
import { LineModel } from './LineModel.js';
import { HalfPlaneVerticalLineModel } from './halfPlane/HalfPlaneVerticalLineModel.js';
import { HalfPlaneSemiCircleModel } from './halfPlane/HalfPlaneSemiCircleModel.js';
import { DiscLineCircleModel } from './disc/DiscLineCircleModel.js';
import { DiscLineDiameterModel } from './disc/DiscLineDiameterModel.js';

export class SceneModel {
    constructor() {
        this.lineModels = [];
        this.pointModels = [];
        this.listeners = [];
        this.isLineDragActive = false;
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener.update());
    }

    beginLineDrag() {
        this.isLineDragActive = true;
    }

    endLineDrag() {
        this.isLineDragActive = false;
        this.reconcileLineTypes();
    }

    reconcileLineTypes() {
        for (const lineModel of [...this.lineModels]) {
            this.handleLineUpdate(lineModel);
        }
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
        console.log("drawing line model:", lineModel)
        if (!(lineModel instanceof LineModel)) {
            throw new TypeError("Only LineModel instances can be added");
        }

        if (!this.lineModels.includes(lineModel)) {
            this.lineModels.push(lineModel);
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
            this.notify();
        }
    }

    clearAll() {
        this.pointModels = [];
        this.lineModels = [];
        this.notify();
    }

}