import { GeodesicView } from "./GeodesicView";
import { SceneView } from "./SceneView.js";

export class hCircleView extends GeodesicView {
    constructor(model, sceneView, color = "black", width = 2) {
        super(model, sceneView, color, width);
    }

    draw() {
        const center = this.sceneView.mathToScreen(this.model.center);
        const radius = this.sceneView.scaleLength(this.model.radius);

        if (!this.element) {
            this.element = this.sceneView.svg.circle(radius * 2)
                .center(center.x, center.y)
                .fill('none')
                .stroke({ color: this.color, width: this.width });
        } else {
            this.element.size(radius * 2).center(center.x, center.y);
        }

        return this.element;
    }

    update() {
        if (!this.element) return;

        const center = this.sceneView.mathToScreen(this.model.center);
        const radius = this.sceneView.scaleLength(this.model.radius);

        this.element.size(radius * 2).center(center.x, center.y);
    }

    computeCenter() {
        
    }
}