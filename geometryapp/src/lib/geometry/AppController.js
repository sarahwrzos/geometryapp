import { DiscSceneView } from "$lib/geometry/views/DiscSceneView.js";
import { HalfPlaneSceneView } from "$lib/geometry/views/HalfPlaneSceneView.js";
import { PointView } from "$lib/geometry/views/PointView.js";
import { LineView } from "$lib/geometry/views/LineView.js";
import { CircleView } from "$lib/geometry/views/CircleView.js";
import { DiscSceneModel } from "./models/disc/DiscSceneModel.js";

export class AppController {

    constructor(svg, container) {
        this.svg = svg;
        this.container = container;

        // 🔥 SINGLE SOURCE OF TRUTH
        this.masterModel = new DiscSceneModel();

        this.currentSceneView = null;
        this.currentSceneType = null;

        this.activeTool = null;
        this.tempPoint = null;
    }

    init(sceneType = "disc") {
        this.switchScene(sceneType);
    }

    // =========================
    // TOOL CONTROL
    // =========================

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
            console.log(x,y )

            if (this.tempPoint === null) {
                this.tempPoint = newPoint;
                return;
            }

            const lineModel =
                this.masterModel.addLine(this.tempPoint, newPoint);

            
            this.currentSceneView.drawLine(lineModel);

            this.tempPoint = null;
            this.activeTool = null;
        }
    }

    // =========================
    // MODEL → VIEW
    // =========================

    addPoint(x, y) {
        const mathPoint =
            this.currentSceneView.screenToMathPoint(x, y);

        this.masterModel.addPoint(mathPoint);

        const pointView =
            PointView.createDraggable(mathPoint, this.currentSceneView);

        this.currentSceneView.pointViews.push(pointView);

        this.currentSceneView.updateClip();

        return mathPoint;
    }

    // =========================
    // LINE ACTIONS (unchanged)
    // =========================

    makeLineActions(lineView) {
        if (!lineView.element) return;

        const sceneView = this.currentSceneView;

        lineView.element.on("click", (e) => {
            e.stopPropagation();

            document.querySelectorAll("button.line-action")
                .forEach(b => b.remove());

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.classList.add("line-action");

            removeBtn.style.position = "absolute";
            removeBtn.style.top = `${e.clientY}px`;
            removeBtn.style.left = `${e.clientX}px`;

            removeBtn.onclick = () => {
                this.masterModel.removeLine(lineView.model);
                sceneView.update();
                document.querySelectorAll("button.line-action")
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
                const newColor = prompt("Enter color:", "black");

                if (newColor) {
                    lineView.model.color = newColor;
                    lineView.element.stroke({ color: newColor });
                }

                document.querySelectorAll("button.line-action")
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

    // =========================
    // SCENE SWITCHING (🔥 SIMPLE NOW)
    // =========================

    switchScene(sceneType) {
        if (this.currentSceneType === sceneType) return;

        // remove old scene
        if (this.currentSceneView) {
            this.currentSceneView.removeScene();
        }

        // create new view USING SAME MODEL
        if (sceneType === "disc") {
            this.currentSceneView = DiscSceneView.create(
                this.masterModel,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth
            );
        } else if (sceneType === "halfPlane") {
            this.currentSceneView = HalfPlaneSceneView.create(
                this.masterModel,
                this.svg,
                this.container.clientHeight,
                this.container.clientWidth
            );
        } else {
            throw new Error("Unknown scene type");
        }

        this.currentSceneType = sceneType;
        this.currentSceneView.appController = this;

        // rebuild views from model
        this.rebuildView();
    }

    rebuildView() {
        const view = this.currentSceneView;

        // points
        this.masterModel.pointModels.forEach(p => {
            const pv = PointView.createDraggable(p, view);
            view.pointViews.push(pv);
        });

        // lines
        this.masterModel.lineModels.forEach(line => {
            const lv = view.drawLine(line);
            this.makeLineActions(lv);
        });

        view.updateClip();
    }

    // =========================
    // CLEAR
    // =========================

    clear() {
        this.masterModel.clearAll();
        this.currentSceneView?.clearAll();
    }
}