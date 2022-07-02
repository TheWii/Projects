console.log('> Initiated script.');



function squareFormula(index, trig) {
    const m = 1 + index * 2;
    return (angle) => (
        (4 * trig(m * angle)) / (m * Math.PI)
    );
}
function sawtoothFormula(index, trig) {
    let m = (index % 2) ? -(1+index) : (1+index);
    return (angle) => (
        (2 * trig(Math.abs(m) * angle)) / (m * Math.PI)
    );
}
function customFormula(index, trig) {
    let m = 1 + index * 1;
    return (angle) => (
        (4 * trig(m*angle)**2 / (m**2 * Math.PI))
    );
}


let canvas = {
    element: document.getElementById('canvas'),
    fontFamily: 'Arial',
    fontSize: 16,
    fontColor: 'white',
    strokeColor: 'white',
    fillColor: 'black',
    globalAlpha: 1.0,
    ctx: null,
    vertices: [],

    init() {
        this.ctx = this.element.getContext('2d');
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.globalAlpha;
        this.ctx.save();
    },


    text(x, y, text, size=0, textAlign=false, color='', family='') {
        this.ctx.restore();
        this.ctx.fillStyle = this.fontColor;
        if (color) this.ctx.fillStyle = color;
        if (textAlign) this.ctx.textAlign = 'center';
        if (!family) family = this.fontFamily;
        if (!size) size = this.fontSize;
        this.ctx.font = `${size}px ${family}`;
        this.ctx.fillText(text, x, y);
    },
    
    fill(color='', alpha=1.0) {
        this.ctx.restore();
        if (alpha) this.ctx.globalAlpha = alpha;
        if (color) this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.fillRect(0, 0, canvas.element.width, canvas.element.height);
    },
    
    line(x1, y1, x2, y2, width=1, color='', alpha=1.0) {
        this.ctx.restore();
        if (alpha) this.ctx.globalAlpha = alpha;
        if (color) this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },
    
    circle(x, y, radius, width=1, color='', alpha=1.0) {
        this.ctx.restore();
        if (alpha) this.ctx.globalAlpha = alpha;
        if (color) this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    },
    
    disk(x, y, radius, color='', alpha=1.0) {
        this.circle(x, y, radius/2, radius, color, alpha);
    },

    beginShape(width=1, color='') {
        this.clearShape();
        if (color) this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
    },

    shapeVertex(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.moveTo(x, y);
        this.vertices.push([x, y]);
    },

    drawShape() {
        this.ctx.stroke();
        this.clearShape();
    },
    
    clearShape() {
        this.ctx.restore();
        this.vertices = [];
    }
}

let clock = {
    lastTick: null,
    deltaTime: null,

    tick() {
        let now = Date.now();
        if (!this.lastTick) this.lastTick = now;
        let deltaTime = now - this.lastTick;
        if (deltaTime > 50) {
            //console.warn(`Tick loop is over, took more than 50ms to process. (${deltaTime}ms)`);
        }
        this.deltaTime = Math.min(deltaTime, 50);
        this.lastTick = now;
        return this.deltaTime;
    }
    
}



class Term {
    constructor(fX, fY, size) {
        this.size = size;
        this.imageX = null;
        this.imageY = null;
        this.setFunction(fX, fY);
    }

    setFunction(fX, fY) {
        this.fX = fX;
        this.fY = fY;
        this.radius = Math.abs(this.fX(0)) * this.size;
    }

    update(angle) {
        let h = Math.sqrt(this.fX(angle)**2 + this.fY(angle)**2);
        this.radius = h * this.size;
        this.imageX = this.fX(angle) * this.size;
        this.imageY = this.fY(angle) * this.size;
    }

    draw(x, y) {
        const width = 3;
        const endX = this.imageX + x
        const endY = this.imageY + y;
        canvas.circle(x, y, this.radius, width, '#fff2ab', 0.2);
        canvas.line(x, y, endX, endY, width, '#fff', 0.2);
        canvas.disk(x, y, this.radius/40, '#ffc654', 0.5);
        canvas.disk(endX, endY, this.radius/40, '#99ffa0', 1.0);

    }
}

const convergence = {
    length: 3,
    anglePerSec: Math.PI * -0.1,
    size: 170,
    wavePeriod: 1,
    waveMaxWidth: 500,
    maxVisibleTerms: 100,
    fType: sawtoothFormula,
    
    terms: [],
    wave: [],
    angle: 0,
    x: 0,
    y: 0,
    waveOriginX: 0,
    waveOriginY: 0,

    init() {
        this.x = canvas.element.width / 2;
        this.y = canvas.element.height / 2;
        this.waveOriginX = this.x;
        this.waveOriginY = this.y;
        this.createTerms();
    },

    createTerms(length=0) {
        this.terms = [];
        if (length) this.length = length;
        for (let i = 0; i < this.length; i++) {
            const fX = this.fType(i, Math.cos);
            const fY = this.fType(i, Math.sin);
            this.terms.push(
                new Term(fX, fY, this.size)
            )
        }
    },

    setFunction(type) {
        console.log('Setting function');
        this.fType = type;
        for (let i = 0; i < this.terms.length; i++) {
            const fX = this.fType(i, Math.cos);
            const fY = this.fType(i, Math.sin);
            this.terms[i].setFunction(fX, fY);            
        }
    },

    getFinalX() {
        let x = this.x;
        for (let term of this.terms) {
            x += term.imageX;
        }
        return x;
    },
    getFinalY() {
        let y = this.y;
        for (let term of this.terms) {
            y += term.imageY;
        }
        return y;
    },


    update(time) {
        this.angle += this.anglePerSec * time;
        for (let term of this.terms) term.update(this.angle);
        this.wave.unshift(this.getFinalY());
        if ((this.wave.length * this.wavePeriod) > this.waveMaxWidth)
            this.wave.pop();
    },

    drawWave(originX) {
        canvas.beginShape(3, '#ddffff');
        for(let i = 0; i < this.wave.length; i++) {
            const x = originX + i * this.wavePeriod;
            const y = this.wave[i];
            canvas.shapeVertex(x, y);
        }
        canvas.drawShape();
    },

    drawTerms(x, y, max=Infinity) {
        let i=0;
        for(let term of this.terms) {
            if (i >= max) return;
            term.draw(x, y);
            x += term.imageX;
            y += term.imageY;
            i++;
        }
    },

    draw(time) {
        let radius = 0;
        if (this.terms.length) radius = this.terms[0].radius;
        this.drawTerms(this.x, this.y, this.maxVisibleTerms);
        this.drawWave(this.waveOriginX);
        canvas.line( this.getFinalX(), this.getFinalY(),
            this.waveOriginX, this.wave[0], 3, '#fff', 0.5);
        canvas.line(this.x, 0, this.x, canvas.element.height,
            4, '#ffffff', 0.2);
        canvas.disk(this.getFinalX(), this.getFinalY(),
            4, '#ffffff', 1.0);
    }

}



let app = {

    init() {
        canvas.init();
        convergence.init();
    },

    update(time) {
        convergence.update(time);
    },
    
    draw(time) {
        canvas.fill('#000000');
        convergence.draw(time);
    },
    
    tick() {
        const time = clock.tick() / 1000;
        this.update(time);
        this.draw(time);
    }

}


function main() {
    app.tick();
    requestAnimationFrame(main);
}



app.init();
requestAnimationFrame(main);


/*
function keypress(event) {
    let charcode = event.keyCode || event.which;
    let key = String.fromCharCode(charcode);
    console.log(`Pressed ${charcode}. ${key}`);
}
window.addEventListener('keydown', keypress);
*/
