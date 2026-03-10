import { SceneView } from "./SceneView.js";

export class DiscSceneView extends SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth) {
        super(sceneModel, svg, containerHeight, containerWidth);
        this.unitCircleClip = null;
        this.circleElement = null; // the actual SVG circle for display
    }

    // Factory method
    static create(sceneModel, svg, containerHeight, containerWidth ) {
        const view = new DiscSceneView(sceneModel, svg, containerHeight, containerWidth);

        view.createScene(); // actually draw the unit disc and clip
        return view;
    }

    // Draws the unit disc and sets up the clip
    createScene() {
        if (!this.svg) return;

        const radius = Math.min(this.containerWidth, this.containerHeight) / 2;
        const cx = this.containerWidth / 2;
        const cy = this.containerHeight / 2;
        // Draw the circle for the scene
        if (this.circleElement) this.circleElement.remove(); // remove old if exists
        this.circleElement = this.svg.circle(radius * 2)
            .center(cx, cy)
            .fill("none")
            .stroke({ color: "black", width: 2 });

        // Create clip for all elements
        this.updateClip();
    }

    removeScene() {
        // Remove the main circle
        if (this.circleElement) {
            this.circleElement.remove();
            this.circleElement = null;
        }

        // Remove the clip
        if (this.unitCircleClip) {
            this.unitCircleClip.remove();
            this.unitCircleClip = null;
        }

        // Remove all line and point elements
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

    updateClip() {
        if (!this.svg) return;

        if (this.unitCircleClip) this.unitCircleClip.remove();

        const radius = Math.min(this.containerWidth, this.containerHeight) / 2;
        const cx = this.containerWidth / 2;
        const cy = this.containerHeight / 2;

        this.unitCircleClip = this.svg.clip().add(this.svg.circle(radius * 2).center(cx, cy));

        this.applyClipToElements();
    }

    applyClipToElements() {
        if (!this.unitCircleClip) return;

        this.pointViews.forEach(v => {
            if (v.element) v.element.clipWith(this.unitCircleClip);
        });

        this.lineViews.forEach(v => {
            if (v.element) v.element.clipWith(this.unitCircleClip);
        });
    }

    // Call this when container resizes
    updateContainerSize(newWidth, newHeight) {
        this.containerWidth = newWidth;
        this.containerHeight = newHeight;
        this.createScene(); // redraw circle and update clip
    }
}