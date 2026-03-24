import { GeodesicView } from "./GeodesicView.js";
import { SceneView } from "./SceneView.js";

export class LineView extends GeodesicView {
    constructor(model, sceneView, color = "black", width = 2) {
        super(model, sceneView, color, width);
        this.currentType = null;
    }

    draw() {
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

        return this.element;
    }

    update() {
        if (!this.element) return;
        console.log("update")
        this.draw();
    }
}