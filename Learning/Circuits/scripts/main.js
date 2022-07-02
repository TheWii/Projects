
import Canvas from './lib/canvas.js';
import App from './app.js';
import Renderer from './renderer.js';

import { Box } from './lib/collisions.js';

const elCanvas = document.querySelector('#canvas');

const canvas = Canvas(elCanvas);

const app = App(canvas);
const renderer = Renderer(canvas);

app.subscribe('updated', renderer.render);
app.init();

const btn0 = app.createButton([20, canvas.height - 100], new Box([300, 80]), {
    showBorder: true,
    text: 'Edit Nodes'
});
btn0.bus.subscribe('released', (event) => {
    if (app.state.mode === app.modes.ADDNODE) {
        app.setMode(app.modes.VIEW);
        btn0.cfg.text = 'Edit Nodes';
    } else {
        app.setMode(app.modes.ADDNODE);
        btn0.cfg.text = 'Cancel';
    }
});

const btn1 = app.createButton([340, canvas.height - 100], new Box([300, 80]), {
    showBorder: true,
    text: app.state.role
});
btn1.bus.subscribe('released', (event) => {
    app.nextRole();
})
app.subscribe('changed-role', (role) => {
    btn1.cfg.text = role;
});


const srcOut = app.createSource([200, 400], 1);
const srcIn = srcOut.role.in;
const t0 = app.createTransmitter([600, 400], 0.01);
const t1 = app.createTransmitter([800, 500], 0.01);
const t2 = app.createTransmitter([300, 700], 0.01);
srcOut.connect(t0);
t0.connect(t1);
t1.connect(t2);
t2.connect(srcIn);

window.app = app;
window.source = srcOut.role;