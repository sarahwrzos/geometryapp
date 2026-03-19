import { SceneView } from "./SceneView.js";
import { GeometryTransformer } from "../GeometryTransformer.js";

export class HalfPlaneSceneView extends SceneView {
    constructor(sceneModel, svg, containerHeight, containerWidth) {
        super(sceneModel, svg, containerHeight, containerWidth);
        this.baseLineElement = null;   // horizontal line at 2/3 height
        this.clipRect = null;          // SVG rectangle clip for top 2/3
    
    }

    // Factory method
    static create(sceneModel, svg, containerHeight, containerWidth) {
        const view = new HalfPlaneSceneView(sceneModel, svg, containerHeight, containerWidth);
        view.createScene();
        return view;
    }

    drawLine(lineModel) {
        const EPS = 1e-10;

        const p1 = GeometryTransformer.DiscToHalfPlane(lineModel.pointModel1);
        const p2 = GeometryTransformer.DiscToHalfPlane(lineModel.pointModel2);
        console.log("in half plane sceneview", p1, p2)

        let element;

        // vertical line
        if (Math.abs(p1.x - p2.x) < EPS) {

            const x = p1.x;

            const topY = 0.0001;      // very close to boundary
            const bottomY = this.containerHeight; // bottom of screen

            const top = this.mathToScreen({ x, y: topY });
            const bottom = this.mathToScreen({ x, y: this.screenYToMath(this.containerHeight) });

            element = this.svg.line(
                top.x, top.y,
                bottom.x, bottom.y
            ).stroke({
                width: 2,
                color: lineModel.color || "black"
            });
        }

        // semicircle
        else {
            const x1 = p1.x;
            const y1 = p1.y;
            const x2 = p2.x;
            const y2 = p2.y;

            const c = (x1*x1 + y1*y1 - x2*x2 - y2*y2) / (2 * (x1 - x2));
            const r = Math.sqrt((x1 - c)*(x1 - c) + y1*y1);

            const center = { x: c, y: 0 };

            const screenCenter = this.mathToScreen(center);
            const screenR = r * this.scale;

            element = this.svg.circle(2 * screenR)
                .center(screenCenter.x, screenCenter.y)
                .fill("none")
                .stroke({
                    width: 2,
                    color: lineModel.color || "black"
                });
        }

        const lineView = {
            model: lineModel,
            element: element,
            draw: () => {},
            update: () => {}
        };

        this.lineViews.push(lineView);

        return lineView;
    }

    // Draws the horizontal base line and sets up the clip
    createScene() {
        if (!this.svg) return;

        this.baseY = (2 / 3) * this.containerHeight;

        // Remove old line if it exists
        if (this.baseLineElement) this.baseLineElement.remove();

        // Draw base horizontal line
        this.baseLineElement = this.svg.line(0, this.baseY, this.containerWidth, this.baseY)
            .stroke({ color: "black", width: 2 });

        // Create clip rectangle for top 2/3
        this.updateClip();
    }

    updateClip() {
        if (!this.svg) return;

        if (this.clipRect) this.clipRect.remove();

        const clipHeight = (2 / 3) * this.containerHeight;
        this.clipRect = this.svg.clip().add(
            this.svg.rect(this.containerWidth, clipHeight).move(0, 0)
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

    yToScreen(y) {
        return this.baseY - y * this.scale;
    }

    screenYToMath(py) {
        return (this.baseY - py) / this.scale;
    }

    // Call this when container resizes
    updateContainerSize(newWidth, newHeight) {
        this.containerWidth = newWidth;
        this.containerHeight = newHeight;
        this.createScene(); // redraw line and clip
    }
}