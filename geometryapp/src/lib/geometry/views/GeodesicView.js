export class GeodesicView {
    static create(ViewClass, model, sceneView, options = {}) {
        console.log("viewclass", ViewClass);
        const color = options.color ?? "black";
        const width = options.width ?? 2;

        const view = new ViewClass(model, sceneView, color, width);
        console.log("before draw", view)
        view.draw();
        view.enableHover(options.highlightColor ?? "red");

        if (options.clickCallback) {
            view.enableClickMenu(options.clickCallback);
        }

        return view;
    }

    constructor(model, sceneView, color = "black", width = 2) {

        this.model = model;
        this.color = color;
        this.width = width;
        this.sceneView = sceneView; // for math->pixel conversion
        this.element = null;

        // Re-render whenever the model changes
        this.model.addListener(() => this.update());
    }


    draw() {
        throw new Error("draw() must be implemented by subclasses");
    }


    update() {
        if (!this.element) return;

        // Default behavior: redraw
        this.draw();
    }

    enableHover(highlightColor = "red") {
        if (!this.element) return;

        const baseColor = this.color ?? "black";

        this.element.on("mouseover", () => {
            this.element.stroke({ color: highlightColor });
        });

        this.element.on("mouseout", () => {
            this.element.stroke({ color: baseColor });
        });
    }

    enableClickMenu(addButtonCallback) {
        if (!this.element) return;

        this.element.on("click", (e) => {
            e.stopPropagation();
            addButtonCallback(this, e.clientX, e.clientY);
        });
    }
}