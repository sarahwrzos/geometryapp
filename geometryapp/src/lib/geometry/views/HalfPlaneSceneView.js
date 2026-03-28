import { SceneView } from "./SceneView.js";

export class HalfPlaneSceneView extends SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex = 0, sceneCount = 2) {
        super(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex, sceneCount);
        this.baseLineElement = null;   // horizontal line at 2/3 height
        this.clipRect = null;          // SVG rectangle clip for top 2/3
    }

    // Factory method
    static create(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex = 0, sceneCount = 2) {
        const view = new HalfPlaneSceneView(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex, sceneCount);
        view.createScene();
        return view;
    }

    // Draws the horizontal base line and sets up the clip
    createScene() {
        if (!this.svg) return;

        const y = (2 / 3) * this.containerHeight;
        const { xmin, xmax } = this.getSceneXBounds();

        // Remove old line if it exists
        if (this.baseLineElement) this.baseLineElement.remove();

        // Draw base horizontal line
        this.baseLineElement = this.svg.line(xmin, y, xmax, y)
            .stroke({ color: "black", width: 2 });

        // Create clip rectangle for top 2/3
        this.updateClip();
    }

    updateClip() {
        if (!this.svg) return;

        if (this.clipRect) this.clipRect.remove();

        const { xmin, sceneWidth } = this.getSceneXBounds();
        const clipHeight = (2 / 3) * this.containerHeight;
        this.clipRect = this.svg.clip().add(
            this.svg.rect(sceneWidth, clipHeight).move(xmin, 0)
        );

        this.applyClipToElements();
    }

    applyClipToElements() {
        if (!this.clipRect) return;

        this.pointViews.forEach(v => {
            if (v.element) v.element.clipWith(this.clipRect);
        });

        this.lineViews.forEach(v => {
            if (v.element) v.element.clipWith(this.clipRect);
        });
    }

    removeScene() {
        this.deactivate();

        if (this.baseLineElement) {
            this.baseLineElement.remove();
            this.baseLineElement = null;
        }

        if (this.clipRect) {
            this.clipRect.remove();
            this.clipRect = null;
        }

        this.lineViews.forEach(view => {
            if (view.element) view.element.remove();
            view.element = null;
        });
        this.lineViews = [];

        this.pointViews.forEach(view => {
            if (view.element) view.element.remove();
            view.element = null;
        });
        this.pointViews = [];
    }

    // Call this when container resizes
    updateContainerSize(newWidth, newHeight) {
        this.containerWidth = newWidth;
        this.containerHeight = newHeight;
        this.createScene(); // redraw line and clip
    }
}