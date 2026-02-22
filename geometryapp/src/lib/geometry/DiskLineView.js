export class DiskLineView {
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
        if (!this.svg) return;

        if (this.element) this.element.remove();

        if (this.model.isDiameter) {
            this.element = this.svg.line(
                [this.model.p1.x, this.model.p1.y, this.model.p2.x, this.model.p2.y]
            ).stroke({ width: this.width, color: this.model.color });
        } else {
            // Arc / placeholder circle
            console.log(this.model.radius, this.model.center.x, this.isDiameter)
             this.element = this.svg.circle(this.model.radius * 2)
            .center(this.model.center.x, this.model.center.y)
            .fill('none')
            .stroke({ width: this.width, color: this.model.color });

        }

        // Apply the clip
        if (this.sceneView?.unitCircleClip) {
            this.element.clipWith(this.sceneView.unitCircleClip);
        }
        // this.enableHover();
        return this.element;
    }

    update() {
        if (!this.element) return;

        if (this.model.isDiameter) {
            this.element.plot([this.model.p1.x, this.model.p1.y, this.model.p2.x, this.model.p2.y]);
        } else {
            this.element.size(this.model.radius * 2)
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