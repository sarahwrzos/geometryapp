export class PointView {
    static createDraggable(model, sceneView, options = {}) {
        // default options
        const radius = options.radius ?? 4;
        const color = options.color ?? "black";
        const highlightColor = options.highlightColor ?? "red";
        const normalColor = options.normalColor ?? color;

        const view = new PointView(model, sceneView, radius, color);
        view.draw();
        view.enableDrag();
        view.enableHover(highlightColor, normalColor);
        return view;
    }

    constructor(model, sceneView, radius = 4, color = "black") {
        this.model = model;
        this.sceneView = sceneView;
        this.svg = sceneView.svg; 
        this.radius = radius;
        this.color = color;
        this.element = null;

        this.model.view = this;

        // Update view whenever the model changes
        this.model.addListener(() => this.update());
    }

    draw() {
        if (!this.svg) return;

        const { x, y } = this.sceneView.mathToScreen(this.model);

        this.element = this.svg.circle(this.radius * 2);
        this.element.cx(x).cy(y);
        this.element.fill(this.color);

        this.element.on('mouseover', () => this.element.stroke({ color: 'red' }));
        this.element.on('mouseout', () => this.element.stroke({ color: this.color }));

        this.element.front();

        return this.element;
    }

    enableDrag() {
        if (!this.element) return;

        this.element.draggable();

        this.element.on('dragmove', (event) => {

            // pixel position from SVG draggable
            const px = event.detail.box.cx;
            const py = event.detail.box.cy;

            // convert to math coordinates
            let { x, y } = this.sceneView.screenToMath(px, py);

            // clamp to unit disc
            const dist = Math.hypot(x, y);
            if (dist > 1) {
                x /= dist;
                y /= dist;
            }

            // update model
            this.model.setXY(x, y);
        });
    }

    enableHover(highlightColor = "red", normalColor = "black") {
        if (!this.element) return;

        this.element.on('mouseover', () => this.element.stroke({ color: highlightColor }));
        this.element.on('mouseout', () => this.element.stroke({ color: normalColor }));
    }

    update() {
        if (!this.element) return;

        const { x, y } = this.sceneView.mathToScreen(this.model);
        this.element.cx(x).cy(y);
    }
}