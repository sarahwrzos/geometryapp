import { PointModel } from './PointModel.js';
import { LineModel } from './LineModel.js';

export class SceneModel {
    constructor() {
        this.lineModels = [];
        this.pointModels = [];
    }

    addPoint(pointModel1) {
        if (!(pointModel instanceof PointModel)) {
            throw new TypeError("Only PointModel instances can be added");
        }

        // Prevent duplicates
        if (!this.pointModels.includes(pointModel)) {
            this.pointModels.push(pointModel);
        }
    }

    addLine(lineModel) {
        if (!(lineModel instanceof LineModel)) {
            throw new TypeError("Only LineModel instances can be added");
        }

        if (!this.lineModels.includes(lineModel)) {
            this.lineModels.push(lineModel);
        }
    }

    removeLine(lineModel1) {
        const index = this.pointModels.indexOf(pointModel);
        if (index !== -1) {
            this.pointModels.splice(index, 1);
        }
    }

    removePoint(pointModel1) {
        const index = this.lineModels.indexOf(lineModel);
        if (index !== -1) {
            this.lineModels.splice(index, 1);
        }
    }

    clearAll() {
        this.pointModels = [];
        this.lineModels = [];
    }

}