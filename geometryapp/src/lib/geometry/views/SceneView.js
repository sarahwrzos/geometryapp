import { PointModel } from "../models/PointModel";

export class SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth) {
        this.sceneModel = sceneModel;
        this.svg = svg;
        this.pointViews = [];
        this.lineViews = [];
        this._containerHeight = containerHeight;
        this._containerWidth = containerWidth;
        this.scale = Math.min(this.containerHeight, this.containerWidth) / 4;

        this.sceneModel.addListener(this);

    }

    scaleLength(modelLength) {
        return modelLength * this.scale;
    }

    get containerWidth() {
        return this._containerWidth;
    }

    get containerHeight() {
        return this._containerHeight;
    }

    set containerWidth(value) {
        this._containerWidth = value;
        this.createScene();
        this.renderAll();
    }

    set containerHeight(value) {
        this._containerHeight = value;
        this.createScene();
        this.renderAll();
    }

    createScene() {
        throw new Error("createScene must be implemented by subclasses");
    }

    renderAll() {
        this.pointViews.forEach(p => p.draw());
        this.lineViews.forEach(l => l.draw());
    }

    clearAll() {
        this.pointViews.forEach(p => p.element?.remove());
        this.lineViews.forEach(l => l.element?.remove());
        this.pointViews = [];
        this.lineViews = [];
    }

    update() {

        this.pointViews = this.pointViews.filter(view => {
            if (!this.sceneModel.pointModels.includes(view.model)) {
                view.element.remove();
                return false;
            }
            return true;
        });

        this.lineViews = this.lineViews.filter(view => {
            if (!this.sceneModel.lineModels.includes(view.model)) {
                view.element.remove();
                return false;
            }
            return true;
        });

        this.pointViews.forEach(p => p.update());
        this.lineViews.forEach(l => l.update());
    }

    mathToScreen(pointModel) {
        const px = this.containerWidth / 2 + pointModel.x * this.scale;
        const py = this.containerHeight / 2 - pointModel.y * this.scale;
        return { x: px, y: py };
    }

    mathToScreenPoint(pointModel) {
        const { x, y } = this.mathToScreen(pointModel);
        return new PointModel(x, y);
    }

    screenToMath(px, py) {
        const x = (px - this.containerWidth / 2) / this.scale;
        const y = (this.containerHeight / 2 - py) / this.scale;
        return { x, y };
    }

    screenToMathPoint(px, py) {
        const { x, y } = this.screenToMath(px, py);
        return new PointModel(x, y);
    }


}