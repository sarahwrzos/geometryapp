import { GeometryTransformer } from "./GeometryTransformer"

export class AppController {
    constructor() {
        this.sceneViews = [];
        this.sceneModels = [];
        this.modelViewMap = new Map();
    }

    addScene(sceneModel, sceneType, svg, containerHeight, containerWidth, scale) {
        let sceneView;

        if (sceneType === "disc") {
            sceneView = DiscSceneView.create(sceneModel, svg, containerHeight, containerWidth, scale);
        } else if (sceneType === "half-plane") {
            sceneView = HalfPlaneSceneView.create(sceneModel, svg, containerHeight, containerWidth, scale);
        } else {
            throw new Error(`Unknown scene type: ${sceneType}`);
        }

        this.sceneModels.push(sceneModel);
        this.sceneViews.push(sceneView);
        this.modelViewMap.set(sceneModel, sceneView);

        return sceneView;
    }

    handleLineAdded() {
        const sceneView = this.modelViewMap.get(sceneModel);
        if (!sceneView) return;

        // Add a LineView (or GeodesicView subclass) for this line
        // Assuming LineView.create handles drawing and linking
        const lineView = GeodesicView.create(LineView, lineModel, sceneView.svg);
        sceneView.lineViews.push(lineView);
    }

    handlePointAdded() {
        const sceneView = this.modelViewMap.get(sceneModel);
        if (!sceneView) return;

        // Add a LineView (or GeodesicView subclass) for this line
        // Assuming LineView.create handles drawing and linking
        const lineView = GeodesicView.create(LineView, lineModel, sceneView.svg);
        sceneView.lineViews.push(lineView);
    }

    syncFrom(from, to) {
        //calls geometry transformer based on from and to
        // GeometryTransformer"from"to"to""(pointModel)
        //Disc or HalfPlane
        const sceneView = this.modelViewMap.get(sceneModel);
        if (!sceneView) return;

        // Create a draggable, clickable point view
        const pointView = PointView.createDraggable(pointModel, sceneView.svg);
        sceneView.pointViews.push(pointView);
    }

    removeScene(sceneModel) {
        const sceneView = this.modelViewMap.get(sceneModel);
        if (!sceneView) return;

        sceneView.removeScene();

        this.sceneViews = this.sceneViews.filter(v => v !== sceneView);
        this.sceneModels = this.sceneModels.filter(m => m !== sceneModel);
        this.modelViewMap.delete(sceneModel);
    }
}
