
import Vector from './math/vector.js';

export class Box {
    constructor(size, pos=null) {
        this.pos = pos ? Vector.convert(pos) : new Vector(0, 0);
        this.size = Vector.convert(size);
    }

    contains(pos) {
        pos = Vector.convert(pos);
        return (this.pos.x <= pos.x && pos.x <= (this.pos.x + this.size.x)) &&
               (this.pos.y <= pos.y && pos.y <= (this.pos.y + this.size.y));
    }

    getCorners() {
        return [
            Vector.copy(this.pos),
            this.pos.sum([this.size.x, 0]),
            this.pos.sum([0, this.size.y]),
            this.pos.sum(this.size),
        ];
    }
}

export class Circle {
    constructor(radius, pos=null) {
        this.pos = pos ? Vector.convert(pos) : new Vector(0, 0);
        this.radius = radius;
    }

    contains(pos) {
        return this.pos.dist(Vector.convert(pos)) <= this.radius;
    }
}