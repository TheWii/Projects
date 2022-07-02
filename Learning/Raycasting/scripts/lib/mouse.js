
import EventBus from './events.js';
import Vector from './math/vector.js';

export class Mouse {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
        this.bus = EventBus({ log: false, name: 'Mouse' });
        this.buttons = [ 'left', 'middle', 'right' ];
        this.mousePos = new Vector(null, null);
        this.draggingOrigin = null;
        this.elements = [];
        this.init();
    }

    init() {
        this.canvas.element.addEventListener('mousemove', (e) => this.move(e));
        this.canvas.element.addEventListener('mousedown', (e) => this.pressed(e));
        this.canvas.element.addEventListener('mouseup', (e) => this.released(e));
        this.canvas.element.addEventListener('wheel', (e) => this.scroll(e));
    }

    createEvent(domEvent) {
        const pos = this.canvas.getPos(domEvent.offsetX, domEvent.offsetY);
        return {
            domEvent,
            isPressed: domEvent.buttons > 0,
            button: this.buttons[domEvent.button],
            pos,
            target: null
        };
    }

    
    move(domEvent) {
        const event = this.createEvent(domEvent);
        const target = this.checkHitboxes(event.pos, (element) =>
            ( !element.isDragged && element.isHoverable() )
        );
        event.target = target;
        this.mousePos.set(event.pos);

        if (this.pressedElement && this.pressedElement !== target) {
            this.pressedElement.released(event);
            this.pressedElement = null;
        }

        if (this.hoverElement && this.hoverElement !== target) {
            this.hoverElement.unhover(event);
            this.hoverElement = null;
        }
        if (target && !target.isPressed) {
            this.hoverElement = target;
            target.hover(event);
        }

        if (event.isPressed && !this.draggingOrigin) {
            this.startDragging(event)
        }
        if (!event.isPressed && this.draggingOrigin) {
            this.stopDragging(event);
        }
        if (this.draggingOrigin) {
            this.dragMouse(event);
        }

        this.bus.publish('move', event);
    }

    pressed(domEvent) {
        const event = this.createEvent(domEvent);
        const target = this.checkHitboxes(event.pos, (element) => element.isClickable());
        event.target = target;
        //console.log(`Mouse -> Pressed, target=${!!target}`);
        if (target) {
            this.pressedElement = target;
            target.pressed(event);
        }
        this.bus.publish(`pressed-${event.button}`, event);
    }

    released(domEvent) {
        const event = this.createEvent(domEvent);
        //console.log(`Mouse -> Released.`);
        if (this.pressedElement) {
            this.pressedElement.released(event);
            event.target = this.pressedElement;
            this.pressedElement = null;
        }
        if (this.draggingOrigin) {
            const dragDist = this.deltaDrag.length();
            this.stopDragging(event);
            if (dragDist > 10) return;
        }
        this.bus.publish(`released-${event.button}`, event);
    }

    scroll(event) {
        this.bus.publish('scroll', {
            delta: Math.sign(event.wheelDelta), 
            event
        });
    }


    startDragging(event) {
        // skip if targetted element is not draggable
        if (event.target && !event.target.isDraggable()) return;
        //console.log(`Mouse -> Start dragging.`);
        this.draggingElement = event.target;
        this.draggingOrigin = event.pos;
        this.deltaDrag = new Vector(0, 0);
        const dragEvent = {
            topic: `start-dragging-${event.button}`,
            origin: this.draggingOrigin,
            element: this.draggingElement,
            pos: event.pos,
            button: event.button
        }
        this.bus.publish(dragEvent.topic, dragEvent);
    }
    
    stopDragging(event) {
        //console.log(`Mouse -> Stop dragging.`);
        if (this.draggingElement) this.draggingElement.stopDragging(event);
        this.bus.publish(`stop-dragging-${event.button}`);
        this.draggingElement = null;
        this.draggingOrigin = null;
        this.deltaDrag = null;
    }
    
    dragMouse(event) {
        const deltaMove = event.pos.diff(this.draggingOrigin);
        this.deltaDrag.set(deltaMove);
        const dragEvent = {
            topic: `drag-${event.button}`,
            origin: this.draggingOrigin,
            element: this.draggingElement,
            pos: event.pos,
            deltaMove,
            button: event.button
        }
        if (this.draggingElement) {
            if (!this.draggingElement.cfg.fixedPos)
                deltaMove.set(this.camera.fromScaled(deltaMove));
            this.draggingElement.drag(dragEvent);
        }
        this.bus.publish(dragEvent.topic, dragEvent);
    }


    addElement(element) {
        const i = this.elements.indexOf(element);
        if (i < 0) this.elements.push(element);
    }
    removeElement(element) {
        const i = this.elements.indexOf(element);
        if (i > 0) this.elements.splice(i, 1);
    }


    checkHitboxes(pos, condition=null) {
        const worldPos = this.camera.fromPos(pos);
        if (!condition) condition = (element) => true;
        for (let element of this.elements) {
            if (condition(element) && element.hitbox.contains(element.cfg.fixedPos ? pos : worldPos)) {
                return element;
            }
        }
    }
}


export class MouseElement {
    constructor(pos, hitbox, cfg={}) {
        this.bus = EventBus();
        this.groups = [];
        this.hitbox = hitbox;
        this.pos = Vector.convert(pos);
        hitbox.pos = this.pos;
        this.cfg = {
            isHoverable: false,
            isClickable: false,
            isDraggable: false,
            showBorder: false,
            fixedPos: true,
            fixedScale: true,
            ...cfg
        };
    }

    isHoverable() { return this.cfg.isHoverable }
    isClickable() { return this.cfg.isClickable }
    isDraggable() { return this.cfg.isDraggable }

    hover(event) {
        //if (!this.isHovered) console.log('Element hovered.');
        this.isHovered = true;
        this.bus.publish('hover', event);
    }
    
    unhover(event) {
        //console.log('Element unhovered.');
        this.isHovered = false;
        if (this.isPressed) this.released(event);
        this.bus.publish('unhover', event);
    }

    startDragging(event) {
        //console.log(`Element started drag.`);
        this.isDragged = true;
        this.dragOrigin = Vector.copy(this.pos);
        this.bus.publish('start-dragging', event);

    }
    stopDragging(event) {
        //console.log(`Element stopped being dragged..`);
        this.isDragged = false;
        this.dragOrigin = null;
        this.bus.publish('stop-dragging', event);

    }
    drag(event) {
        if (!this.isDragged) this.startDragging(event);
        this.bus.publish('drag', event);
    }
    
    pressed(event) {
        //console.log('Element pressed.');
        this.isPressed = true;
        this.bus.publish('pressed', event);

    }
    
    released(event) {
        //console.log('Element released.');
        this.isPressed = false;
        this.bus.publish('released', event);
    }

    render(ctx) {
    }
}


export class DraggableElement extends MouseElement {
    constructor(pos, hitbox, cfg={}) {
        super(pos, hitbox, cfg);
    }

    drag(event) {
        super.drag(event);
        this.pos.set(this.dragOrigin.sum(event.deltaMove));
    }
}

export default {
    Mouse,
    MouseElement
};