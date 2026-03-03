import { PointModel } from "$lib/geometry/PointModel.js";
import { PointView } from "$lib/geometry/PointView.js";
import { DiskLineView } from "$lib/geometry/DiskLineView.js";
import { HalfPlaneLineView } from "$lib/geometry/HalfPlaneLineView.js";

export class SceneView {
    constructor(sceneModel, svg) {
        this.sceneModel = sceneModel;
        this.svg = svg;
        this.pointViews = [];
        this.lineViews = [];
        this.unitCircleClip = null;

        this.setup()
    }

    addDiskClip() {
        this.unitCircleClip = this.svg.clip().add(
            this.svg.circle(this.sceneModel.unitCircleRadius * 2)
            .center(this.sceneModel.unitCircleCenterX, 
                this.sceneModel.unitCircleCenterY)
            );

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

    setup() {
        // test
        if (this.sceneModel.sceneType === "Disk"){
            //draw unit circle
            //todo clear? draw existing points?
            this.addDiskClip();
            this.baseElement = this.svg.circle(this.sceneModel.unitCircleRadius * 2)
                .center(this.sceneModel.unitCircleCenterX, this.sceneModel.unitCircleCenterY)
                .fill('none')
                .stroke({ width: 2, color: '#000' });
            this.baseElement.clipWith(this.unitCircleClip)
        }
        else {
            //draw upper half plane
            const pageHeight = this.sceneModel.unitCircleCenterY * 2;
            const pageWidth  = this.sceneModel.unitCircleCenterX * 2;

            const lineY = (2/3) * pageHeight;

            this.baseElement = this.svg.line(0, lineY, pageWidth, lineY)
                .stroke({ width: 2, color: '#000' });
        }
    }

    switchModel(newType) {
        //todo apply clip again
        if (this.sceneModel.sceneType === newType) return;
        console.log("new type", newType);
        // Remove all visuals
        this.baseElement.remove();

        // remove clip
        if (this.unitCircleClip) {
            this.unitCircleClip.remove();
            this.unitCircleClip = null;
        }

        // transform points
        this.sceneModel.points.forEach(p => {
            if (newType === "HalfPlane") {
                console.log("switching to half plane");
                p.transformDiskToHalfPlane();
            } else {
                p.transformHalfPlaneToDisk();
            }
        });

        this.sceneModel.sceneType = newType;

        this.setup();
        this.render();

        // add clip if disk
        if (newType === "Disk") this.addDiskClip();
        this.applyClipToElements();

    }

    render() {
        // Draw all points
        this.sceneModel.points.forEach(pointModel => {
            const view = new PointView(pointModel, this.svg);
            view.draw();
            view.enableDrag();
            this.pointViews.push(view);
        });

        // Draw all lines
        if (this.sceneModel.sceneType === "Disk") {
            this.sceneModel.lines.forEach(lineModel => {
                const view = new DiskLineView(lineModel, this.svg);
                view.draw();
                this.lineViews.push(view);
            });
        }
        else{
            this.sceneModel.lines.forEach(lineModel => {
                const view = new HalfPlaneLineView(lineModel, this.svg, this);
                view.draw();
                this.lineViews.push(view);
            });
        }
    }

    clear() {
        // Remove all point views
        this.pointViews.forEach(v => v.element.remove());
        this.pointViews = [];

        // Remove all line views
        this.lineViews.forEach(v => v.element.remove());
        this.lineViews = [];

        // also remove models
        this.sceneModel.lines = [];
        this.sceneModel.points = [];
    }

    update() {
        // Call update on all views to sync with the model
        this.pointViews.forEach(v => v.update());
        this.lineViews.forEach(v => v.update());
    }
}