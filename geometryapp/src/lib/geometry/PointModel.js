// PointModel.js

export class PointModel{
    constructor(x, y, unitCircleCenterX, unitCircleCenterY, unitCircleRadius) {
        this.x = x;
        this.y = y;
        this.unitCircleCenterX = unitCircleCenterX;
        this.unitCircleCenterY = unitCircleCenterY;
        this.unitCircleRadius = unitCircleRadius;
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(l => l());
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        this.notify();
    }

    transformDiskToHalfPlane(){
        // (-i * z - i) / (z - 1)
        const math = require('mathjs');
        let z = math.complex(this.x, this.y);
        let i = math.complex(0, 1);

        const num = math.subtract( math.multiply(math.unaryMinus(i), z), i);

        const den = math.subtract(z, 1);

        const result = math.divide(num, den);
        this.set (result.re, result.im);

    }

    transformHalfPlaneToDisk(){
        // todo: make work with non-unit circle points
        // (z - i) / (z + i)
        // z = x + y * i
        // x is real part, y is imag

        const math = require('mathjs');
        let z = math.complex(this.x, this.y);
        let i = math.complex(0, 1);

        const num = math.subtract(z, i);
        const den = math.add(z, i);

        const result = math.divide(num, den);
        this.set (result.re, result.im);
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y
        };
    }

    static fromJSON(data) {
        return new PointModel(data.x, data.y);
    }

}