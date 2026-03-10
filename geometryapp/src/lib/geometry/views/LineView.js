import { GeodesicView } from "./GeodesicView.js";
import { SceneView } from "./SceneView.js";

export class LineView extends GeodesicView {
    constructor(model, sceneView, color = "black", width = 2) {
        super(model, sceneView, color, width);
    }

    draw() {
        console.log("draw line")
        console.log("math points", this.model.pointModel1, this.model.pointModel2);
        const p1 = this.sceneView.mathToScreenPoint(this.model.pointModel1);
        const p2 = this.sceneView.mathToScreenPoint(this.model.pointModel2);
        console.log("lineview draw", p1, p2)
        if (this.element) this.element.remove();

        this.element = this.sceneView.svg.line(p1.x, p1.y, p2.x, p2.y)
            .stroke({ color: this.color, width: this.width });

        return this.element;
    }

    update() {
        if (!this.element) return;

        const p1 = this.sceneView.mathToScreenPoint(this.model.pointModel1);
        const p2 = this.sceneView.mathToScreenPoint(this.model.pointModel2);

        this.element.plot(p1.x, p1.y, p2.x, p2.y);
    }
}