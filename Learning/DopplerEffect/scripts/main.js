
import { profile } from './lib/utils.js';
import Canvas from './lib/canvas.js';
import Vector from './lib/math/vector.js';
import { Box, Sphere } from './lib/collisions.js';

import App from './app.js';
import Renderer from './renderer.js';

const elCanvas = document.querySelector('#canvas');

const audioCtx = new AudioContext();

const canvas = Canvas(elCanvas);

const app = App(canvas);
const renderer = Renderer(canvas);

app.setAudioContext(audioCtx);

app.subscribe('updated', renderer.render);

const planets = {
    mercury: {
        orbitRadius: 579.1,
        orbitSpeed: Math.PI * (2/2.4),
        radius: 12
    },
    venus: {
        orbitRadius: 1082,
        orbitSpeed: Math.PI * (2/6.1),
        radius: 29.6
    },
    earth: {
        orbitRadius: 1496,
        orbitSpeed: Math.PI * (2/10),
        radius: 31.2
    },
    mars: {
        orbitRadius: 2279,
        orbitSpeed: Math.PI * (2/18.8),
        radius: 16.6
    },
    jupyter: {
        orbitRadius: 7785,
        orbitSpeed: Math.PI * (2/118),
        radius: 342
    },
    saturn: {
        orbitRadius: 14340,
        orbitSpeed: Math.PI * (2/294),
        radius: 286
    },
    uranus: {
        orbitRadius: 28710,
        orbitSpeed: Math.PI * (2/840),
        radius: 124.6
    },
    neptune: {
        orbitRadius: 44950,
        orbitSpeed: Math.PI * (2/1649),
        radius: 121
    }
}

app.init();

const center = [900, 550];

const listener = app.createListener(app.state.screenCenter);

for (let [planet, attr] of Object.entries(planets)) {
    console.log(`Adding ${planet}.`);
    const orbiter = app.createOrbiter(center, attr.orbitRadius, attr.orbitSpeed, {
        showName: true,
        displayName: planet.charAt(0).toUpperCase() + planet.slice(1),
        ...attr
    });
    const frequency = 100;
    const volume = 0.32;
    app.createSpeaker(listener, orbiter.pos, frequency, 0.0001);
}

app.createMouseElement(
    [100, 200],
    new Box([200, 200]),
    {
        showHitbox: true,
        fixedPos: false 
    }
);
app.createMouseElement(
    [900, 600],
    new Box([100, 100]),
    {
        showHitbox: true,
        fixedPos: false 
    }
);
app.createMouseElement(
    [300, 900],
    new Box([400, 100]),
    {
        showHitbox: true,
        fixedPos: true,
        isDraggable: false
    }
);

window.app = app;
window.Box = Box;
window.Sphere = Sphere;
window.Vector = Vector;
window.profile = profile;