export class SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth, scale) {
        this.sceneModel = sceneModel;
        this.svg = svg;
        this.pointViews = [];
        this.lineViews = [];
        this._containerHeight = containerHeight;
        this._containerWidth = containerWidth;
        this.scale = Math.min(this.containerHeight, this.containerHeight) / 2;

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
        this.geodesicViews.forEach(l => l.element?.remove());
        this.pointViews = [];
        this.geodesicViews = [];
    }

    update() {
        this.pointViews.forEach(p => p.update());
        this.geodesicViews.forEach(l => l.update());
    }

    mathToScreen(pointModel) {
        const px = this.containerWidth / 2 + pointModel.x * this.scale;
        const py = this.containerHeight / 2 - pointModel.y * this.scale;
        return { x: px, y: py };
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