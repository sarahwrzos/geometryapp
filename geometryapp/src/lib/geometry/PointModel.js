// PointModel.js
import * as math from 'mathjs';

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

        // Normalize to unit disk
        const nx = (this.x - this.unitCircleCenterX) / this.unitCircleRadius;
        const ny = (this.unitCircleCenterY - this.y) / this.unitCircleRadius;

        let z = math.complex(nx, ny);
        let i = math.complex(0, 1);

        const num = math.subtract( math.multiply(math.unaryMinus(i), z), i);

        const den = math.subtract(z, 1);

        const result = math.divide(num, den);

        const y0 = (2/3) * (this.unitCircleCenterY * 2);
        this.set (result.re, y0 - result.im);
        console.log("new point", this.x, this.y);

    }

    transformHalfPlaneToDisk(){
        // todo: make work with non-unit circle points
        // (z - i) / (z + i)
        // z = x + y * i
        // x is real part, y is imag

        const y0 = (2/3) * (this.unitCircleCenterY * 2);
        const nx = this.x;
        const ny = y0 - this.y;

        let z = math.complex(nx, ny);
        let i = math.complex(0, 1);

        const num = math.subtract(z, i);
        const den = math.add(z, i);

        const result = math.divide(num, den);
        this.set (this.unitCircleCenterX + result.re * this.unitCircleRadius, 
            this.unitCircleCenterY - result.im * this.unitCircleRadius);
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