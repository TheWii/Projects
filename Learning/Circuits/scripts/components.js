
import Vector from './lib/math/vector.js';
import { MouseElement } from './lib/mouse.js';

export class Component {
    constructor(pos) {
        this.groups = [];
        this.pos = Vector.convert(pos);
        this.cfg = {};
    }

    update(time) {
    }
}


export class Node extends Component {
    constructor(pos, mouseElement, cfg={}) {
        super(pos);
        this.connections = [];
        this.mouse = mouseElement;
        this.mouse.pos = this.pos;
        this.mouse.parent = this;
        this.cfg = {
            size: 10,
            color: '#FFC89B',
            connectionColor: '#FFC89B',
            alpha: 1.0,
            ...cfg
        }
        this.mouse.bus.subscribe('drag', (event) =>
            this.drag(event)
        );
    }

    setRole(role) {
        role.link(this);
        this.role = role;
    }

    drag(event) {
        this.pos.set(this.mouse.dragOrigin.sum(event.deltaMove));
    }

    connect(node) {
        if (this.connections.indexOf(node) === -1) {
            this.connections.push(node);
        }
        if (node.connections.indexOf(this) === -1) {
            node.connections.push(this);
        }
        this.connected(node);
        node.connected(this);
    }

    disconnect(node) {
        const thisIndex = this.connections.indexOf(node);
        if (thisIndex >= 0) {
            this.connections.splice(thisIndex, 1);
            this.disconnected(node);
        }
        const nodeIndex = node.connections.indexOf(this);
        if (nodeIndex >= 0) {
            node.connections.splice(nodeIndex, 1);
            node.disconnected(this);
        }
    }

    disconnectAll() {
        while (this.connections.length) {
            this.disconnect(this.connections[0]);
        }
    }

    select() {
        this.isSelected = true;
    }
    unselect() {
        this.isSelected = false;
    }

    connected(node) {}
    disconnected(node) {}

    update(time) {
        super.update(time);
        if (this.role) this.role.update(time);
    }


    render(ctx) {
        if (this.isSelected) {
            ctx.disk({ pos: this.pos, radius: this.cfg.size + 5,
                color: '#ffffff', alpha: 0.5 });
        }
        for (let node of this.connections) {
            ctx.line({pos1: this.pos, pos2: node.pos,
                width: 5, color: this.cfg.connectionColor, alpha: 1.0 })
        }
        ctx.disk({ pos: this.pos, radius: this.cfg.size,
            color: this.cfg.color, alpha: this.cfg.alpha });
        if (this.mouse.isHovered) {
            ctx.circle({pos: this.pos, radius: this.mouse.hitbox.radius,
                width: 3, color: '#ffffff', alpha: 0.75})
        }
    }
}

export class Button extends MouseElement {
    constructor(pos, hitbox, cfg={}) {
        super(pos, hitbox, {
            isHoverable: true,
            isClickable: true,
            isDraggable: false,
            color: '#FFF18F',
            hoverColor: '#FFF9C9',
            pressedColor: '#FFFFFF',
            borderWidth: 5,
            borderAlpha: 1.0,
            showText: true,
            text: '',
            textSize: hitbox.size.y / 1.5,
            ...cfg
        });
    }

    render(ctx) {
        const mainCfg = {   
            fixedPos: this.cfg.fixedPos,
            fixedWidth:  this.cfg.fixedScale,
            fixedSize: this.cfg.fixedScale
        }
        if (this.cfg.showBorder) {
            const [tl, tr, bl, br] = this.hitbox.getCorners();
            const cfg = {
                ...mainCfg,
                width: this.cfg.borderWidth,
                color: this.cfg.color,
                alpha: this.cfg.borderAlpha
            };
            if (this.isHovered) cfg.color = this.cfg.hoverColor;
            if (this.isPressed) cfg.color = this.cfg.pressedColor;
            ctx.line({ pos1: tl, pos2: tr, ...cfg });
            ctx.line({ pos1: bl, pos2: br, ...cfg });
            ctx.line({ pos1: tl, pos2: bl, ...cfg });
            ctx.line({ pos1: tr, pos2: br, ...cfg });
        }
        if (this.cfg.showText) {
            const pos = this.hitbox.size.quot(2).add(this.pos);
            pos.add([0, this.cfg.textSize/4]);
            let color = this.cfg.color;
            if (this.isHovered) color = this.cfg.hoverColor;
            if (this.isPressed) color = this.cfg.pressedColor;
            ctx.text({ ...mainCfg, pos, text: this.cfg.text,
                textAlign: true, size: this.cfg.textSize, color})
        }
    }
}