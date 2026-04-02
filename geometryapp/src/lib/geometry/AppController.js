import { GeometryTransformer } from "./GeometryTransformer.js";
import { DiscSceneView } from "$lib/geometry/views/DiscSceneView.js";
import { HalfPlaneSceneView } from "$lib/geometry/views/HalfPlaneSceneView.js";
import { PointView } from "$lib/geometry/views/PointView.js";
import { LineView } from "$lib/geometry/views/LineView.js";
import { CircleView } from "$lib/geometry/views/CircleView.js";
import { DiscSceneModel } from "./models/disc/DiscSceneModel.js";
import { HalfPlaneSceneModel } from "./models/halfPlane/HalfPlaneSceneModel.js";

export class AppController {

    constructor(svg, container) {
        this.svg = svg;
        this.container = container;

        this.activeTool = null;
        this.tempPoint = null;

        this.scenes = new Map();
        this.currentSceneType = null;
        this.secondarySceneView = null;
        this.rightSceneType = null;
        this.rightSceneModel = null;
        this.showDiscAxes = false;

        this.handleOutsideLineActionClick = (e) => {
            if (e.target.closest("button.line-action")) return;
            this.removeLineActionButtons();
        };

        document.addEventListener("click", this.handleOutsideLineActionClick);
    }

    removeLineActionButtons() {
        document
            .querySelectorAll("button.line-action")
            .forEach(b => b.remove());
    }

    init(sceneType) {

        let sceneModel;

        if (sceneType === "disc") {
            sceneModel = new DiscSceneModel();
        }
        else if (sceneType === "halfPlane") {
            sceneModel = new HalfPlaneSceneModel();
        }
        else {
            throw new Error("Unknown scene type");
        }

        const view = this.createSceneView(sceneType, sceneModel);

        this.currentSceneView = view;

        this.scenes.set(sceneType, {
            view: view,
            model: sceneModel
        });

        this.currentSceneType = sceneType;
    }

    setTool(tool) {
        this.activeTool = tool;
        this.tempPoint = null;
    }

    handleClick(x, y) {

        if (!this.currentSceneView) return;

        const sceneCount = this.currentSceneView.sceneCount ?? 1;
        const editableWidth = this.container.clientWidth / sceneCount;
        if (x > editableWidth) return;

        // POINT TOOL
        if (this.activeTool === "point") {

            this.addPoint(x, y);
            this.activeTool = null;
            return;
        }

        // LINE TOOL
        if (this.activeTool === "hyperbolicLine") {

            const newPoint = this.addPoint(x, y);

            // FIRST CLICK
            if (this.tempPoint === null) {
                this.tempPoint = newPoint;
                return;
            }

            // SECOND CLICK
            const lineModel =
                this.currentSceneView.sceneModel.addLine(this.tempPoint, newPoint);

            this.currentSceneView.updateClip();

            //this.drawLine(lineModel);

            this.tempPoint = null;
            this.activeTool = null;
        }
    }

    addPoint(x, y) {

        const mathPoint =
            this.currentSceneView.screenToMathPoint(x, y);

        this.currentSceneView.sceneModel.addPoint(mathPoint);

        const pointView =
            PointView.createDraggable(mathPoint, this.currentSceneView);

        this.currentSceneView.pointViews.push(pointView);

        this.currentSceneView.updateClip();  

        return mathPoint;
    }

    makeLineActions(lineView) {

        if (!lineView.element) return;

        const sceneView = this.currentSceneView;

        lineView.element.on("click", (e) => {

            e.stopPropagation();

            this.removeLineActionButtons();

            const removeBtn = document.createElement("button");

            removeBtn.textContent = "Remove";
            removeBtn.classList.add("line-action");

            removeBtn.style.position = "absolute";
            removeBtn.style.top = `${e.clientY}px`;
            removeBtn.style.left = `${e.clientX}px`;

            removeBtn.onclick = () => {

                sceneView.sceneModel.removeLine(lineView.model);
                this.removeLineActionButtons();
            };

            document.body.appendChild(removeBtn);

            const colorBtn = document.createElement("button");

            colorBtn.textContent = "Color";
            colorBtn.classList.add("line-action");

            colorBtn.style.position = "absolute";
            colorBtn.style.top = `${e.clientY}px`;
            colorBtn.style.left = `${e.clientX + 60}px`;

            colorBtn.onclick = () => {

                const newColor =
                    prompt("Enter color:", "black");

                if (newColor) {

                    lineView.model.color = newColor;

                    lineView.element.stroke({
                        color: newColor
                    });
                }

                this.removeLineActionButtons();
            };

            document.body.appendChild(colorBtn);
        });

        lineView.element.on("mouseover", () =>
            lineView.element.stroke({ color: "red" })
        );

        lineView.element.on("mouseout", () =>
            lineView.element.stroke({ color: lineView.model.color })
        );
    }

    clear() {
        if (!this.currentSceneView) return;

        this.currentSceneView.sceneModel.clearAll();
        //this.currentSceneView.removeScene();
    }

    setDiscAxesVisible(visible) {
        this.showDiscAxes = Boolean(visible);
        this.applyDiscAxesVisibility();
    }

    toggleDiscAxes() {
        this.showDiscAxes = !this.showDiscAxes;
        this.applyDiscAxesVisibility();
        return this.showDiscAxes;
    }

    applyDiscAxesVisibility() {
        if (this.currentSceneView?.setAxesVisible) {
            this.currentSceneView.setAxesVisible(this.showDiscAxes);
        }

        if (this.secondarySceneView?.setAxesVisible) {
            this.secondarySceneView.setAxesVisible(this.showDiscAxes);
        }
    }

    createSceneView(type, model) {
        let view;

        if (this.secondarySceneView) {
            this.secondarySceneView.removeScene();
            this.secondarySceneView = null;
        }

        if (type === "disc") {
            view = DiscSceneView.create(model, this.svg, this.container.clientHeight, this.container.clientWidth, this, 0, 2);
            const rightModel = new HalfPlaneSceneModel();
            this.secondarySceneView = HalfPlaneSceneView.create(rightModel, this.svg, this.container.clientHeight, this.container.clientWidth, null, 1, 2);
            this.rightSceneType = "halfPlane";
            this.rightSceneModel = rightModel;
        } else if (type === "halfPlane") {
            view = HalfPlaneSceneView.create(model, this.svg, this.container.clientHeight, this.container.clientWidth, this, 0, 2);
            const rightModel = new DiscSceneModel();
            this.secondarySceneView = DiscSceneView.create(rightModel, this.svg, this.container.clientHeight, this.container.clientWidth, null, 1, 2);
            this.rightSceneType = "disc";
            this.rightSceneModel = rightModel;
        }

        // Rebuild all points
        model.pointModels.forEach(p => {
            const pointView = PointView.createDraggable(p, view);
            view.pointViews.push(pointView);
        });

        // Rebuild all lines
        //model.lineModels.forEach(line => this.drawLine(line, view));

        view.updateClip();
        this.applyDiscAxesVisibility();
        return view;
    }

    transformModel(sourceModel, sourceType, targetType) {
        let targetModel;
        if (targetType === "disc") {
            targetModel = new DiscSceneModel();
        } else if (targetType === "halfPlane") {
            targetModel = new HalfPlaneSceneModel();
        } else {
            throw new Error("Unknown scene type");
        }

        const pointMap = new Map();

        sourceModel.pointModels.forEach(p => {
            let transformed;

            if (sourceType === "disc" && targetType === "halfPlane") {
                transformed = GeometryTransformer.DiscToHalfPlane(p);
            } else if (sourceType === "halfPlane" && targetType === "disc") {
                transformed = GeometryTransformer.HalfPlaneToDisc(p);
            } else {
                transformed = new p.constructor(p.x, p.y);
            }

            targetModel.pointModels.push(transformed);
            pointMap.set(p, transformed);
        });

        sourceModel.lineModels.forEach(line => {
            const p1 = pointMap.get(line.pointModel1);
            const p2 = pointMap.get(line.pointModel2);
            targetModel.addLine(p1, p2, line.color);
        });

        return targetModel;
    }

    createRightSceneView(type, model) {
        if (this.secondarySceneView) {
            this.secondarySceneView.removeScene();
            this.secondarySceneView = null;
        }

        if (type === "disc") {
            this.secondarySceneView = DiscSceneView.create(
                model,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth,
                null,
                1,
                2
            );
        } else if (type === "halfPlane") {
            this.secondarySceneView = HalfPlaneSceneView.create(
                model,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth,
                null,
                1,
                2
            );
        } else {
            throw new Error("Unknown scene type");
        }

        model.pointModels.forEach(p => {
            const pointView = new PointView(p, this.secondarySceneView);
            pointView.draw();
            this.secondarySceneView.pointViews.push(pointView);
        });

        this.secondarySceneView.update();
        this.secondarySceneView.updateClip();
        this.applyDiscAxesVisibility();

        this.rightSceneType = type;
        this.rightSceneModel = model;
    }

    syncTo(sceneType) {
        if (!sceneType) {
            sceneType = this.currentSceneType === "disc" ? "halfPlane" : "disc";
        }

        const current = this.scenes.get(this.currentSceneType);

        const newModel = this.transformModel(current.model, this.currentSceneType, sceneType);

        this.createRightSceneView(sceneType, newModel);

        this.scenes.set(sceneType, {
            view: this.secondarySceneView,
            model: newModel
        });
    }

    switchSides() {
        if (!this.currentSceneView || !this.rightSceneModel || !this.rightSceneType) return;

        const newLeftType = this.rightSceneType;
        const newLeftModel = this.rightSceneModel;
        const newRightType = this.currentSceneType;
        const newRightModel = this.transformModel(newLeftModel, newLeftType, newRightType);

        this.currentSceneView.removeScene();
        if (this.secondarySceneView) {
            this.secondarySceneView.removeScene();
            this.secondarySceneView = null;
        }

        let newLeftView;
        if (newLeftType === "disc") {
            newLeftView = DiscSceneView.create(
                newLeftModel,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth,
                this,
                0,
                2
            );
        } else if (newLeftType === "halfPlane") {
            newLeftView = HalfPlaneSceneView.create(
                newLeftModel,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth,
                this,
                0,
                2
            );
        } else {
            throw new Error("Unknown scene type");
        }

        newLeftModel.pointModels.forEach(p => {
            const pointView = PointView.createDraggable(p, newLeftView);
            newLeftView.pointViews.push(pointView);
        });

        newLeftView.update();
        newLeftView.updateClip();

        this.currentSceneView = newLeftView;
        this.currentSceneType = newLeftType;
        this.tempPoint = null;
        this.activeTool = null;

        this.createRightSceneView(newRightType, newRightModel);

        this.scenes.set(newLeftType, {
            view: this.currentSceneView,
            model: newLeftModel
        });

        this.scenes.set(newRightType, {
            view: this.secondarySceneView,
            model: newRightModel
        });

        this.applyDiscAxesVisibility();
    }

    drawLine(lineModel, sceneView = this.currentSceneView) {
        let lineView;
        if (lineModel.getType() === "Line") {
            console.log("in not else")
            lineView = LineView.create(LineView, lineModel, sceneView);
        } else {
            console.log("in else")
            lineView = CircleView.create(CircleView, lineModel, sceneView);
        }
        sceneView.lineViews.push(lineView);
        this.makeLineActions(lineView); // keep hover/remove/color
        sceneView.updateClip();
    }
}