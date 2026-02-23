import { PointModel } from "$lib/geometry/PointModel.js";
import { PointView } from "$lib/geometry/PointView.js";

export class SceneView {
    constructor(sceneModel, svg) {
        this.sceneModel = sceneModel;
        this.svg = svg;
        this.pointViews = [];
        this.lineViews = [];
        this.unitCircleClip = null;

        this.setup()
    }

    setup() {
        // test
        if (this.sceneModel.sceneType === "Disk"){
            //draw unit circle
            //todo clear? draw existing points?
            this.baseElement = this.svg.circle(this.sceneModel.unitCircleRadius * 2)
            .center(this.sceneModel.unitCircleCenterX, this.sceneModel.unitCircleCenterY)
            .fill('none')
            .stroke({ width: 2, color: '#000' });
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
        if (this.sceneModel.sceneType === newType) return;

        // Remove all visuals
        this.clear();
        this.baseElement.remove();

        this.sceneModel.sceneType = newType;

        this.setup();
        this.render();
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
                const view = new LineView(lineModel, this.svg);
                view.draw();
                this.lineViews.push(view);
            });
        }
        else{
            //todo
            //half plane line
        }
    }

    clear() {
        // Remove all point views
        this.pointViews.forEach(v => v.element.remove());
        this.pointViews = [];

        // Remove all line views
        this.lineViews.forEach(v => v.element.remove());
        this.lineViews = [];
    }

    update() {
        // Call update on all views to sync with the model
        this.pointViews.forEach(v => v.update());
        this.lineViews.forEach(v => v.update());
    }
}