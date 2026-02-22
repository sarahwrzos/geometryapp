export class PointView {
    constructor(model, svg, radius = 4, color = "black") {
        this.model = model;
        this.svg = svg;
        this.radius = radius;
        this.color = color;
        this.element = null;

        this.model.view = this;

        // Update view whenever the model changes
        this.model.addListener(() => this.update());
    }

    draw() {
        if (!this.svg) return;

        // Create the circle element
        this.element = this.svg.circle(this.radius * 2);
        this.element.cx(this.model.x).cy(this.model.y);
        this.element.fill(this.color);

        // attach hover automatically
        this.element.on('mouseover', () => this.element.stroke({ color: 'red' }));
        this.element.on('mouseout', () => this.element.stroke({ color: this.color }));

        this.element.front();

        return this.element;
    }

    enableDrag() {
        if (!this.element) return;

        this.element.draggable();

        this.element.on('dragmove', (event) => {

            const cx = this.model.unitCircleCenterX;
            const cy = this.model.unitCircleCenterY;
            const r  = this.model.unitCircleRadius;

            // Proposed new position from draggable
            let newX = event.detail.box.cx;
            let newY = event.detail.box.cy;

            const dx = newX - cx;
            const dy = newY - cy;
            const dist = Math.hypot(dx, dy);

            // clamp
            if (dist > r) {
                const scale = r / dist;
                newX = cx + dx * scale;
                newY = cy + dy * scale;

                // Override the draggable's position
                event.detail.handler.move(newX - event.detail.box.w / 2,
                                        newY - event.detail.box.h / 2);
            }

            // Update model (this triggers line updates)
            this.model.set(newX, newY);
        });
    }

    enableHover(highlightColor = "red", normalColor = "black") {
        if (!this.element) return;

        this.element.on('mouseover', () => this.element.stroke({ color: highlightColor }));
        this.element.on('mouseout', () => this.element.stroke({ color: normalColor }));
    }

    update() {
        if (!this.element) return;

        // Move the existing circle to the model's position
        this.element.cx(this.model.x).cy(this.model.y);
        this.element.front();
    }
}