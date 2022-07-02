
import Canvas from './lib/canvas.js';
import KeyboardListener from './lib/keyboard.js';
import MouseListener from './lib/mouse.js';
import App from './app.js';

const elCanvas = document.querySelector('#canvas');
const canvas = Canvas(elCanvas);
const app = App(elCanvas);

const keyboardListener = KeyboardListener(document);
const mouseListener = MouseListener(elCanvas);



keyboardListener.subscribe(app.undoVertex, 'keydown', 'z');
keyboardListener.subscribe(app.switchMode, 'keydown', 'v');

mouseListener.subscribe(app.mouseLeftClick, 'mouseup', 'left');
mouseListener.subscribe(app.mouseRightClick, 'mouseup', 'right');
mouseListener.subscribe(app.mouseMove, 'mousemove');
mouseListener.subscribe(app.mouseScroll, 'wheel');

// prevent context menu from showing up when right
// clicking the canvas.
elCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});


requestAnimationFrame(() => render(app.state));
function render(state) {
    canvas.fill();

    // draw lines
    let previous = state.vertices[0];
    for (let i = 1; i < state.vertices.length; i++) {
        const alpha = state.status === 'drawing' ? 1.0 : 0.2;
        let current = state.vertices[i];
        canvas.line(...previous, ...current, 5, '', alpha);
        previous = current;
    }

    // draw vertice dots
    for (let [i, vertex] of state.vertices.entries()) {
        // render targeted vertices differently
        if (i === state.targetVertex) {
            canvas.disk(...vertex, 5, '#48a7ff');
            continue;
        }
        canvas.disk(...vertex, 5);
    }

    // draw path preview
    canvas.beginShape(5, '#fffc48', 0.5);
    for (let vertex of state.path) canvas.shapeVertex(...vertex);
    canvas.drawShape();

    // draw interpolated points
    for (let [lIndex, level] of state.levels.entries()) {
        for (let [pIndex, point] of level.entries()) {
            if (lIndex > 0) {
                const parentLevel = state.levels[lIndex-1];
                const firstParent = parentLevel[pIndex];
                const secondParent = parentLevel[pIndex+1];
                canvas.line(...firstParent, ...secondParent, 5, '#b9ff8b', 0.1);
            }
            if (level.length > 1) canvas.disk(...point, 8, '#aaffaa', 0.2);
        }
    }

    // path current position
    if (state.pathPos) canvas.disk(...state.pathPos, 8, '#fffc48', 1)

    // line preview
    if (state.status === 'drawing') {
        const last = state.vertices[state.vertices.length-1];
        canvas.line(...last, ...state.mouse, 3, '', 0.5);
        canvas.disk(...state.mouse, 5, '', 0.5);
    }

    // targeted vertex
    if (state.targetVertex !== null) {
        const vertex = state.vertices[state.targetVertex];
        const weight = state.weights[state.targetVertex];
        canvas.text(vertex[0], vertex[1]-20, weight.toFixed(1), 24, true, '#48a7ff');
        canvas.text(vertex[0], vertex[1]-50, 'Weight', 24, true, '#48a7ff');
    }

    // mouse pointer
    if (state.status === 'idle' || state.status === 'paused') {
        canvas.circle(...state.mouse, 8);
    }

    requestAnimationFrame(() => render(app.state));
}

app.init();