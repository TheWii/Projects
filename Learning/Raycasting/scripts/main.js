
import Vector from './lib/math/vector.js';
import Canvas from './lib/canvas.js';
import Camera from './lib/camera.js';
import { Mouse } from './lib/mouse.js';

import { Ray, Boundary, Emitter, Reflector } from './components.js';
import App from './app.js';


const rayAmount = 2000;
const rayStrength = 100;
const rayMaxAlpha = 0.4;
const rayAlpha = Math.min(rayStrength / rayAmount, rayMaxAlpha);
const maxReflections = 32;

const elCanvas = document.querySelector('#canvas');

const canvas = Canvas(elCanvas);
const camera = new Camera();
const mouse = new Mouse(canvas, camera);
const app = App(elCanvas, {
    maxReflections
});

mouse.bus.subscribe('move', app.mouseMove);


populate();
app.init(false);
app.update();


requestAnimationFrame(tick);
function tick() {
    app.update();
    render(app.state);
    requestAnimationFrame(tick);
}

function render(state) {
    canvas.fill('#000000');
    for (let line of state.groups.render) {
        if (line instanceof Boundary) {
            //const normal = line.getNormal(state.mouseTarget);
            //const pos = line.origin.sum(line.end).divide(2);
            //canvas.line(pos, pos.sum(normal.multiply(20)), 4, '#3856ff');
            if (line instanceof Reflector) {
                canvas.line(line.origin, line.end, 5, '#8ff4ff');
                continue;
            }
            canvas.line(line.origin, line.end, 5, '#ffffaa');
        }
    }
    for (let ray of state.groups.intersected) {
        let previous = ray.origin;
        for (let reflection of ray.reflections) {
            canvas.line(previous, reflection.pos, 6, '#ffffaa', rayAlpha);
            previous = reflection.pos;
        }
        canvas.line(previous, ray.intersected.pos, 6, '#ffffaa', rayAlpha);
    }

    if (state.mouseTarget) {
        canvas.circle(state.mouseTarget, 10, 1, '#ffffff', 0.5);
    }
}


function box(x1, y1, x2, y2) {
    return [
        new Boundary([x1, y1], [x2, y1]),
        new Boundary([x1, y2], [x2, y2]),
        new Boundary([x1, y1], [x1, y2]),
        new Boundary([x2, y1], [x2, y2]),
    ]
}
function polygon(Component, ...vertices) {
    let segs = [];
    for (let i=0; i < vertices.length-1; i++) {
        segs.push(new Component(vertices[i], vertices[i+1]));
    }
    segs.push(new Component(vertices[0], vertices[vertices.length-1]));
    return segs;
}


function reflectionTest() {
    const segs = [];
    
    segs.push(...box(500, 500, 600, 600))
    segs.push(...box(700, 600, 800, 700))
    
    segs.push(...polygon(Boundary, [300, 500], [350, 500], [350, 700],
        [450, 800], [1150, 800], [1150, 500], [1200, 500],
        [1200, 850], [450, 850], [300, 700], [200, 700],
        [200, 600]
    ));
    segs.push(...polygon(Boundary, [200, 200], [1150, 200], [1200, 200],
        [1200, 350], [1150, 350], [700, 250], [300, 250],
        [300, 350], [200, 350], [0, 550], [0, 200]
    ));
    segs.push(...box(1300, 500, 1400, 600));
    segs.push(...box(1500, 600, 1600, 700));
    //segs.push(new Reflector([200, 351], [0, 551]));
    //segs.push(new Reflector([0, elCanvas.height-200], [200, elCanvas.height]));
    //segs.push(new Reflector([elCanvas.width-200, elCanvas.height], [elCanvas.width, elCanvas.height-200]));
    //segs.push(new Reflector([elCanvas.width-200, 0], [elCanvas.width, 200]));
    
    const mouseEmitter = new Emitter(app.state.mouseTarget, rayAmount);
    
    app.add('render', ...segs, ...mouseEmitter.rays);
    app.add('rays', ...mouseEmitter.rays);
    app.add('boundaries', ...segs);
}

function illuminationProblem() {
    const scale = 230;
    const pos = Vector.convert([elCanvas.width/2 - (4 * scale), elCanvas.height/2]);
    const vertices = [
        [0, 0],
        [1, 0],
        [1, -1],
        [2, -2],
        [2, -1],
        [3, -1],
        [3, 0],
        [5, 0],
        [5, -1],
        [6, -1],
        [6, -2],
        [7, -1],
        [7, 0],
        [8, 0],
        [7, 1],
        [6, 1],
        [6, 2],
        [5, 1],
        [4, 1],
        [4, 2],
        [3, 1],
        [2, 2],
        [2, 1],
        [1, 1]
    ]
    const computed = vertices.map(v => Vector.convert(v).multiply(scale).add(pos));
    const segments = [];
    segments.push(...polygon(Reflector, ...computed));

    const mouseEmitter = new Emitter(app.state.mouseTarget, rayAmount);
    
    app.add('render', ...segments, ...mouseEmitter.rays);
    app.add('rays', ...mouseEmitter.rays);
    app.add('boundaries', ...segments);
}

function populate() {
    reflectionTest();
}


function profile(func, repeat, ...params) {
    let start = Date.now();
    for (let i=0; i<repeat; i++) {
        func(...params);
    }
    const delta = (Date.now() - start);
    const avg = delta / repeat;
    console.log(`Profile session completed.\nDURATION: ${delta/1000}s\nNUMBER OF CALLS: ${repeat} times\nFUNCTION SPEED: ${avg}ms\nRATE: ${(1000/avg).toFixed(6)} calls per second`);
}

window.Ray = Ray;
window.Boundary = Boundary;
window.Vector = Vector;
window.populate = populate;
window.app = app;
window.profile = profile;