
import Vector from './math/vector.js';

export default function Canvas(element, cfg={}) {
    const defaultConfigs = {
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: 'white',
        strokeColor: 'white',
        fillColor: 'black',
        globalAlpha: 1.0
    }
    cfg = { ...defaultConfigs, ...cfg };

    let vertices = [];

    // init context
    const ctx = element.getContext('2d');
    ctx.font = `${cfg.fontSize}px ${cfg.fontFamily}`;
    ctx.fillStyle = cfg.fillColor;
    ctx.strokeStyle = cfg.strokeColor;
    ctx.globalAlpha = cfg.globalAlpha;
    ctx.save();

    /**
     * Get canvas coordinate from a position in
     * the canvas element(client screen). 
     * @param {*} elementX 
     * @param {*} elementY 
     * @returns 
     */
    function getPos(elementX, elementY) {
        return new Vector(
            Math.round(elementX * element.width / element.clientWidth),
            Math.round(elementY * element.height / element.clientHeight)
        );
    }


    function text(pos, text, size=0, textAlign=false, color='', family='') {
        ctx.restore();
        ctx.save();
        ctx.fillStyle = cfg.fontColor;
        if (color) ctx.fillStyle = color;
        if (textAlign) ctx.textAlign = 'center';
        if (!family) family = cfg.fontFamily;
        if (!size) size = cfg.fontSize;
        ctx.font = `${size}px ${family}`;
        ctx.fillText(text, pos.x, pos.y);
    }
    
    function fill(color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillRect(0, 0, element.width, element.height);
    }

    function rect(pos1, pos2,  width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.fillStyle = color;
        if (width) ctx.lineWidth = width;
        ctx.beginPath();
        ctx.fillRect(pos1.x, pos1.y, pos2.x, pos2.y);
    }
    
    function line(pos1, pos2, width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
    }
    
    function circle(pos, radius, width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    function disk(pos, radius, color='', alpha=cfg.globalAlpha) {
        this.circle(pos, radius/2, radius, color, alpha);
    }

    function beginShape(width=1, color='', alpha=0.0) {
        this.clearShape();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
    }

    function shapeVertex(x, y) {
        ctx.lineTo(x, y);
        ctx.moveTo(x, y);
        vertices.push([x, y]);
    }

    function drawShape() {
        ctx.stroke();
        this.clearShape();
    }
    
    function clearShape() {
        ctx.restore();
        ctx.save();
        vertices = [];
    }

    return {
        element,
        width: element.width,
        height: element.height,
        getPos,
        text,
        fill,
        rect,
        line,
        circle,
        disk,

        beginShape,
        shapeVertex,
        drawShape,
        clearShape
    }
}