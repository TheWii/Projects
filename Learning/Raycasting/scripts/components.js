
import Vector from './lib/math/vector.js';

// Refactored components

export class Boundary {
    constructor(origin, end) {
        this.origin = Vector.convert(origin);
        this.end = Vector.convert(end);
    }

    getNormal(pos) {
        const dLine = this.end.diff(this.origin);
        const dPos = pos.diff(this.origin);
        const normal = new Vector(-dLine.y, dLine.x).normalize();
        if (dPos.dot(normal) >= 0) return normal;
        return normal.multiply(-1);
    }

    intersected(context) {
        // do cool stuff
    }
}

export class Reflector extends Boundary {
    constructor(origin, end) {
        super(origin, end);
    }

    reflect(ray) {
        const normal = this.getNormal(ray.getPosition());
        const direction = ray.getDirection();
        const dot = direction.dot(normal);
        const reflected = direction.diff(normal.multiply(2 * dot));
        return reflected.normalize();
    }

    intersected(context) {
        const direction = this.reflect(context.ray);
        context.ray.addReflection(context.pos, direction);
        context.retrace();
    }
}



export class Ray {
    constructor(origin, angle) {
        this.origin = Vector.convert(origin);
        this.direction = Vector.fromAngle(angle);
        this.angle = angle;
        this.clear();
    }

    setOrigin(pos) {
        this.origin = pos;
    }

    clear() {
        this.intersected = null;
        this.reflections = [];
    }

    getPosition() {
        if (this.reflections.length) {
            const i = this.reflections.length - 1;
            return this.reflections[i].pos;
        }
        return this.origin;
    }

    getDirection() {
        if (this.reflections.length) {
            const i = this.reflections.length - 1;
            return this.reflections[i].direction;
        }
        return this.direction;
    }

    addReflection(pos, direction) {
        this.reflections.push({
            pos,
            direction
        });
    }

    intersection(boundary) {
        const rayPos = this.getPosition();
        const rayDir = this.getDirection();

        const dB = boundary.origin.diff(boundary.end);
        const dR = rayPos.diff(rayPos.sum(rayDir));

        const den = (dB.x * dR.y) - (dB.y * dR.x);
        if (den === 0) return; // parallel

        const dOrigin = boundary.origin.diff(rayPos);

        const t = ((dOrigin.x * dR.y) - (dOrigin.y * dR.x)) / den;
        if (0 >= t || t >= 1) return; // no intersection

        const dist = -((dB.x * dOrigin.y) - (dB.y * dOrigin.x)) / den;
        if (dist <= 0) return; // no intersection

        const pos =  boundary.origin.sum(dB.multiply(-t));
        const deltaRay = rayPos.diff(pos).abs();
        if (deltaRay.x < 0.1 && deltaRay.y < 0.1) return;
        return {
            pos,
            dist,
            t
        };
    }
}



export class Emitter {
    constructor(origin, rayAmount) {
        this.origin = Vector.convert(origin);
        this.amount = rayAmount;
        this.rays = this.createRays(this.amount);
    }

    createRays(amount) {
        const rays = [];
        const fraction = (2 * Math.PI) / amount;
        for (let i = 0; i < amount; i++) {
            const angle = fraction * i;
            rays.push(new Ray(this.origin, angle));
        }
        return rays; 
    }

    setOrigin(pos) {
        this.rays.forEach(ray => ray.setOrigin(pos));
    }
}