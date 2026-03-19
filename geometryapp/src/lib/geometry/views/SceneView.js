import { PointModel } from "../models/PointModel";
import { DiscSceneModel } from "../models/disc/DiscSceneModel";
import { HalfPlaneSceneModel } from "../models/halfPlane/HalfPlaneSceneModel";
import { DiscSceneView } from "./DiscSceneView";
//import { HalfPlaneSceneView } from "./HalfPlaneSceneView";

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
        console.log("SceneView size:", containerWidth, containerHeight);

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
        this.scale = Math.min(this.containerHeight, this.containerWidth) / 4;
        this.createScene();
        this.renderAll();
    }

    set containerHeight(value) {
        this._containerHeight = value;
        this.scale = Math.min(this.containerHeight, this.containerWidth) / 4;
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

    yToScreen(y) {
        throw new Error("yToScreen must be implemented in subclass");
    }

    mathToScreen(pointModel) {
        const xCenter = this.containerWidth / 2;
        const px = xCenter + pointModel.x * this.scale;

        // delegate y handling
        const py = this.yToScreen(pointModel.y);

        return { x: px, y: py };
    }

    mathToScreenPoint(pointModel) {
        const { x, y } = this.mathToScreen(pointModel);
        return new PointModel(x, y);
    }

    screenYToMath(py) {
        throw new Error("screenYToMath must be implemented in subclass");
    }

    screenToMath(px, py) {
        const x = (px - this.containerWidth / 2) / this.scale;
        const y = this.screenYToMath(py);
        return { x, y };
    }

    screenToMathPoint(px, py) {
        const { x, y } = this.screenToMath(px, py);
        return new PointModel(x, y);
    }


}