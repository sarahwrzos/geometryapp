export class HalfPlaneLineView {
    constructor(model, svg, sceneView, color = "black", width = 2) {
        this.model = model;
        this.svg = svg;
        this.element = null;
        this.color = color;
        this.width = width;
        this.sceneView = sceneView;

        // Re-render whenever the model changes
        this.model.addListener(() => this.update());
    }

    draw() {
        console.log("here")
        if (!this.svg) return;

        if (this.element) this.element.remove();
        console.log("here")
        if (this.model.isVertical) {
            // Vertical Euclidean line
            this.element = this.svg.line(
                this.model.x, 0,
                this.model.x, this.svg.height()
            ).stroke({ width: this.width, color: this.model.color });

        } else {
            // Semicircle orthogonal to boundary
            const diameter = this.model.radius * 2;

            this.element = this.svg.circle(diameter)
                .center(this.model.center.x, this.model.center.y)
                .fill('none')
                .stroke({ width: this.width, color: this.model.color });

            // Clip to upper half-plane only
            this.element.clipWith(this.sceneView.halfPlaneClip);
        }

        return this.element;
    }

    update() {
        if (!this.element) return;

        // HALF-PLANE MODE
        if (this.model.isVertical) {

            // Update vertical line
            this.element.plot(
                this.model.x, 0,
                this.model.x, this.svg.height()
            );

        } else {

            // Update semicircle
            const diameter = this.model.radius * 2;

            this.element
                .size(diameter) // sets width + height
                .center(this.model.center.x, this.model.center.y);
        }
    }

    enableHover(highlightColor = "red") {
        if (!this.element) return;
        if (!this.color) this.color = 'black';

        this.element.on('mouseover', () => this.element.stroke({ color: highlightColor }));
        this.element.on('mouseout', () => this.element.stroke({ color: this.model.color }));
    }

    enableClickMenu(addButtonCallback) {
        if (!this.element) return;

        this.element.on('click', (e) => {
            e.stopPropagation();
            addButtonCallback(this, e.clientX, e.clientY);
        });
    }
}