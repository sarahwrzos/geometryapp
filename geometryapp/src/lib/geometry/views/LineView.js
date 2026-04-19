import { GeodesicView } from "./GeodesicView.js";
import { SceneView } from "./SceneView.js";
import { HalfPlaneSceneModel } from "../models/halfPlane/HalfPlaneSceneModel.js";

export class LineView extends GeodesicView {
    constructor(model, sceneView, color = "black", width = 2) {
        super(model, sceneView, color, width);
        this.currentType = null;
    }

    draw() {
        if (this.model?.type === "Line" && this.sceneView.sceneModel instanceof HalfPlaneSceneModel && typeof this.model.x === "number") {
            const screenX = this.sceneView.mathToScreen({ x: this.model.x, y: 0 }).x;
            const topY = 0;
            const bottomY = this.sceneView.containerHeight;

            if (!this.element) {
                this.element = this.sceneView.svg.line(screenX, topY, screenX, bottomY)
                    .stroke({ color: this.color, width: this.width });
            } else {
                this.element.plot(screenX, topY, screenX, bottomY);
            }

            return this.element;
        }
        
        const p1 = this.sceneView.mathToScreen(this.model.pointModel1);
        const p2 = this.sceneView.mathToScreen(this.model.pointModel2);

        const endpoints = this.sceneView.getLineEndpoints(p1, p2);
        if (!endpoints) return;

        const { a, b } = endpoints;
        if (!this.element) {
            this.element = this.sceneView.svg.line(a.x, a.y, b.x, b.y)
                .stroke({ color: this.color, width: this.width });
        } else {
            this.element.plot(a.x, a.y, b.x, b.y);
        }
        //console.log(this.sceneView.lineViews)
        //this.element.front();
        return this.element;
        
    }

    update() {
        if (!this.element) return;
        this.draw();
    }
}