export class PointModel {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setXY(newX, newY) {
        this.x = newX;
        this.y = newY;
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