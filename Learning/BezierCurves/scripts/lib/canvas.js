
export default Canvas;

export function Canvas(element, cfg={}) {
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


    function text(x, y, text, size=0, textAlign=false, color='', family='') {
        ctx.restore();
        ctx.save();
        ctx.fillStyle = cfg.fontColor;
        if (color) ctx.fillStyle = color;
        if (textAlign) ctx.textAlign = 'center';
        if (!family) family = cfg.fontFamily;
        if (!size) size = cfg.fontSize;
        ctx.font = `${size}px ${family}`;
        ctx.fillText(text, x, y);
    }
    
    function fill(color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillRect(0, 0, element.width, element.height);
    }

    function rect(x1, y1, x2, y2, width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.fillRect(x1, y1, x2, y2);
    }
    
    function line(x1, y1, x2, y2, width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    function circle(x, y, radius, width=1, color='', alpha=cfg.globalAlpha) {
        ctx.restore();
        ctx.save();
        if (alpha) ctx.globalAlpha = alpha;
        if (color) ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    function disk(x, y, radius, color='', alpha=cfg.globalAlpha) {
        this.circle(x, y, radius/2, radius, color, alpha);
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