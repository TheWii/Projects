
import Vector from './math/vector.js';

export default class Camera {
    constructor(pos=[0, 0], zoom=1, width=0, height=0) {
        this.pos = Vector.convert(pos);
        this.animationPos = Vector.copy(this.pos);
        this.zoom = zoom;
        this.minZoom = 0.01;
        this.size = new Vector(width, height);
    }

    /**
     * Converts world position to the corresponding screen position
     * based on the current camera offset and zoom level.
     * @param {Vector} screenPos Position on the world to be converted.
     * @returns A new vector of the screen position.
     */

    getPos(planePos) {
        return Vector.convert(planePos).diff(this.pos).multiply(this.zoom);
    }

    /**
     * Scales a value by the current zoom level of the camera. If
     * value is a Vector, each of its components (x and y) will be
     * multiplied. 
     * @param {number|Vector} Value to be scaled.
     * @returns A new Vector with the scaled values.
     */
    getScaled(value) {
        if (value instanceof Vector) return Vector.copy(value).multiply(this.zoom);
        return value * this.zoom;
    }

    /**
     *  Converts position on screen to the corresponding world position
     * based on the current camera offset and zoom level.
     * @param {Vector} screenPos Position on screen to be converted.
     * @returns A new vector of the world position.
     */
    fromPos(screenPos) {
        return Vector.convert(screenPos).quot(this.zoom).add(this.pos);
    }

    fromScaled(value) {
        if (value instanceof Vector) return Vector.copy(value).divide(this.zoom);
        return value / this.zoom;
    }

    setSize(width, height) {
        this.size.set(width, height);
    }

    moveTo(pos, animationSpeed=0) {
        if (animationSpeed > 0) {
            this.animatePos(pos, animationSpeed);
            return;
        }
        this.pos.set(pos);
    }

    setZoom(value, focusPos=null) {
        if (!focusPos) focusPos = this.size.quot(2);
        const beforePos = this.fromPos(focusPos);
        this.zoom = Math.max(this.minZoom, value);
        const afterPos = this.fromPos(focusPos);
        const delta = beforePos.diff(afterPos);
        this.moveTo(delta.add(this.pos)); 
    }

    animatePos(toPos, speed) {
        this.animationPos.set(toPos);
        this.animationSpeed = speed;
        this.isAnimatingPos = true;
    }

    updatePosAnimation(time) {
        const delta = this.animationPos.diff(this.pos).multiply(this.animationSpeed);
        if (delta.length() < 1) {
            this.pos.set(this.animationPos);
            this.isAnimatingPos = false;
            return;
        }
        this.pos.add(delta);
    }

    update(time) {
        if (this.isAnimatingPos) this.updatePosAnimation(time);
    }
}