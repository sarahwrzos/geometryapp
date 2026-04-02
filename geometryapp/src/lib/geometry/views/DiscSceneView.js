import { SceneView } from "./SceneView.js";

export class DiscSceneView extends SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex = 0, sceneCount = 2) {
        super(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex, sceneCount);
        this.unitCircleClip = null;
        this.circleElement = null; // the actual SVG circle for display
        this.showAxes = false;
        this.xAxisElement = null;
        this.yAxisElement = null;
    }

    // Factory method
    static create(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex = 0, sceneCount = 2 ) {
        const view = new DiscSceneView(sceneModel, svg, containerHeight, containerWidth, controller, sceneIndex, sceneCount);

        view.createScene(); // actually draw the unit disc and clip
        return view;
    }

    // Draws the unit disc and sets up the clip
    createScene() {
        if (!this.svg) return;

        const { xmin, sceneWidth } = this.getSceneXBounds();
        const radius = Math.min(sceneWidth, this.containerHeight) / 4;
        const cx = xmin + sceneWidth / 2;
        const cy = this.containerHeight / 2;
        // Draw the circle for the scene
        if (this.circleElement) this.circleElement.remove(); // remove old if exists
        this.circleElement = this.svg.circle(radius * 2)
            .center(cx, cy)
            .fill("none")
            .stroke({ color: "black", width: 2 });

        this.updateAxes();

        // Create clip for all elements
        this.updateClip();
    }

    setAxesVisible(visible) {
        this.showAxes = Boolean(visible);
        this.updateAxes();
        this.applyClipToElements();
    }

    updateAxes() {
        this.removeAxes();

        if (!this.showAxes || !this.svg) return;

        const { xmin, sceneWidth } = this.getSceneXBounds();
        const cx = xmin + sceneWidth / 2;
        const cy = this.containerHeight / 2;

        this.xAxisElement = this.svg
            .line(xmin, cy, xmin + sceneWidth, cy)
            .stroke({ color: "blue", width: 1 })
            .attr({ "pointer-events": "none" });

        this.yAxisElement = this.svg
            .line(cx, 0, cx, this.containerHeight)
            .stroke({ color: "blue", width: 1 })
            .attr({ "pointer-events": "none" });
    }

    removeAxes() {
        if (this.xAxisElement) {
            this.xAxisElement.remove();
            this.xAxisElement = null;
        }

        if (this.yAxisElement) {
            this.yAxisElement.remove();
            this.yAxisElement = null;
        }
    }

    removeScene() {
        this.deactivate();

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

        this.removeAxes();

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

        const { xmin, sceneWidth } = this.getSceneXBounds();
        const radius = Math.min(sceneWidth, this.containerHeight) / 4;
        const cx = xmin + sceneWidth / 2;
        const cy = this.containerHeight / 2;

        this.unitCircleClip = this.svg.clip().add(this.svg.circle(radius * 2).center(cx, cy));

        this.applyClipToElements();
    }

    applyClipToElements() {
        if (!this.unitCircleClip) return;

        if (this.xAxisElement) this.xAxisElement.clipWith(this.unitCircleClip);
        if (this.yAxisElement) this.yAxisElement.clipWith(this.unitCircleClip);

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