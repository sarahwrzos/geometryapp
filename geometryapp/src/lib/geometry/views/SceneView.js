import { PointModel } from "../models/PointModel";
import { DiscSceneModel } from "../models/disc/DiscSceneModel";
import { HalfPlaneSceneModel } from "../models/halfPlane/HalfPlaneSceneModel";
import { LineView } from "./LineView";
import { CircleView } from "./CircleView";

export class SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth, controller) {
        this.sceneModel = sceneModel;
        this.svg = svg;
        this.pointViews = [];
        this.lineViews = [];
        this._containerHeight = containerHeight;
        this._containerWidth = containerWidth;
        this.scale = Math.min(this.containerHeight, this.containerWidth) / 4;
        this.controller = controller;

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
        const oldViews = this.lineViews;

        this.lineViews = this.sceneModel.lineModels.map(model => {
            let existing = oldViews.find(v => v.model === model);

            const type = model.getType();
            console.log(type)
            let shouldBeCircle = (type === "Circle"); // make sure this matches your model

            if (existing) {
                const isCircleView = existing instanceof CircleView;

                if (shouldBeCircle !== isCircleView) {
                    existing.element?.remove();
                    existing = null;
                }
            }

            if (!existing) {
                // Determine which view class to use
                const ViewClass = shouldBeCircle ? CircleView : LineView;

                // Create the view
                existing = new ViewClass(model, this);

                // Draw it immediately
                existing.draw();

                this.lineViews.push(existing);

                // Set up line actions if we have a controller
                if (this.controller) {
                    this.controller.makeLineActions(existing);
                }
            } else {
                // Update the existing view
                existing.update();
            }

            return existing;
        });

        // cleanup removed views
        oldViews.forEach(v => {
            if (!this.lineViews.includes(v)) {
                v.element?.remove();
            }
        });
    }

    getLineEndpoints(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const xmin = 0;
        const xmax = this.containerWidth;
        const ymin = 0;
        const ymax = this.containerHeight;

        let points = [];

        if (dx !== 0) {
            let t = (xmin - p1.x) / dx;
            let y = p1.y + t * dy;
            if (y >= ymin && y <= ymax) points.push({ x: xmin, y });

            t = (xmax - p1.x) / dx;
            y = p1.y + t * dy;
            if (y >= ymin && y <= ymax) points.push({ x: xmax, y });
        }

        if (dy !== 0) {
            let t = (ymin - p1.y) / dy;
            let x = p1.x + t * dx;
            if (x >= xmin && x <= xmax) points.push({ x, y: ymin });

            t = (ymax - p1.y) / dy;
            x = p1.x + t * dx;
            if (x >= xmin && x <= xmax) points.push({ x, y: ymax });
        }

        if (points.length < 2) return null;

        return { a: points[0], b: points[1] };
    }

    mathToScreen(pointModel) {
        const xCenter = this.containerWidth / 2;
        let px = xCenter + pointModel.x * this.scale;

        let py;
        if (this.sceneModel instanceof DiscSceneModel) {
            // origin in center
            py = this.containerHeight / 2 - pointModel.y * this.scale;
        } else if (this.sceneModel instanceof HalfPlaneSceneModel) {
            // origin at bottom of half-plane TODO
            py = ((2/3) * this.containerHeight) - pointModel.y * this.scale;
        } else {
            py = this.containerHeight / 2 - pointModel.y * this.scale;
        }

        return { x: px, y: py };
    }

    mathToScreenPoint(pointModel) {
        const { x, y } = this.mathToScreen(pointModel);
        return new PointModel(x, y);
    }

    screenToMath(px, py) {
        const x = (px - this.containerWidth / 2) / this.scale;
        let y;

        if (this.sceneModel instanceof DiscSceneModel) {
            y = (this.containerHeight / 2 - py) / this.scale;
        } else if (this.sceneModel instanceof HalfPlaneSceneModel) {
            y = (((2/3) * this.containerHeight) - py) / this.scale;
        } else {
            y = (this.containerHeight / 2 - py) / this.scale;
        }

        return { x, y };
    }

    screenToMathPoint(px, py) {
        const { x, y } = this.screenToMath(px, py);
        return new PointModel(x, y);
    }


}