export class PointModel {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.listeners = [];
    }

    setXY(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    addListener(fn) {
        this.listeners.push(fn);
    }

    // save x and y values
    toJSON() {
        return JSON.stringify({x: this.x, y: this.y});
    }

    static fromJSON(jsonString) {
        const obj = JSON.parse(jsonString);
        return new PointModel(obj.x, obj.y);
    }
}