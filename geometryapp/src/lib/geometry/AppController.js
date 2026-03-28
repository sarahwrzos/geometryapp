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

            document
                .querySelectorAll("button.line-action")
                .forEach(b => b.remove());

            const removeBtn = document.createElement("button");

            removeBtn.textContent = "Remove";
            removeBtn.classList.add("line-action");

            removeBtn.style.position = "absolute";
            removeBtn.style.top = `${e.clientY}px`;
            removeBtn.style.left = `${e.clientX}px`;

            removeBtn.onclick = () => {

                sceneView.sceneModel.removeLine(lineView.model);

                document
                    .querySelectorAll("button.line-action")
                    .forEach(b => b.remove());
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

                document
                    .querySelectorAll("button.line-action")
                    .forEach(b => b.remove());
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

    createSceneView(type, model) {
        let view;
        if (type === "disc") {
            view = DiscSceneView.create(model, this.svg, this.container.clientHeight, this.container.clientWidth, this);
            view.createScene();
        } else if (type === "halfPlane") {
            view = HalfPlaneSceneView.create(model, this.svg, this.container.clientHeight, this.container.clientWidth, this);
            view.createScene();
        }

        // Rebuild all points
        model.pointModels.forEach(p => {
            const pointView = PointView.createDraggable(p, view);
            view.pointViews.push(pointView);
        });

        // Rebuild all lines
        //model.lineModels.forEach(line => this.drawLine(line, view));

        view.updateClip();
        return view;
    }

    syncTo(sceneType) {
        console.log(this.currentSceneView.lineViews)
        if (this.currentSceneType === sceneType) return;

        const current = this.scenes.get(this.currentSceneType);

        // 1️⃣ Create a brand new model for the target scene
        let newModel;
        if (sceneType === "disc") {
            newModel = new DiscSceneModel();
        } else if (sceneType === "halfPlane") {
            newModel = new HalfPlaneSceneModel();
        } else {
            throw new Error("Unknown scene type");
        }

        // 2️⃣ Transform points from current model → new model
        const pointMap = new Map();

        current.model.pointModels.forEach(p => {
            let transformed;

            if (this.currentSceneType === "disc" && sceneType === "halfPlane") {
                transformed = GeometryTransformer.DiscToHalfPlane(p);
            } else if (this.currentSceneType === "halfPlane" && sceneType === "disc") {
                transformed = GeometryTransformer.HalfPlaneToDisc(p);
            } else {
                transformed = new p.constructor(p.x, p.y);
            }

            newModel.pointModels.push(transformed);
            pointMap.set(p, transformed);
        });

        // 3️⃣ Recreate lines using transformed points
        current.model.lineModels.forEach(line => {
            const p1 = pointMap.get(line.pointModel1);
            const p2 = pointMap.get(line.pointModel2);
            newModel.addLine(p1, p2, line.color);
        });

        // 4️⃣ Create a fresh view (this rebuilds the base scene correctly)
        const newView = this.createSceneView(sceneType, newModel);

        // 5️⃣ Store new scene
        this.scenes.set(sceneType, {
            view: newView,
            model: newModel
        });

        // 6️⃣ Remove old scene
        current.view.removeScene();

        // 7️⃣ Update current references
        this.currentSceneType = sceneType;
        this.currentSceneView = newView;

        this.currentSceneView.update();
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