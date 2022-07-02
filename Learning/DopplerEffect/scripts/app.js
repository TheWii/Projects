
import Vector from './lib/math/vector.js';
import EventBus from './lib/events.js';
import Clock from './lib/clock.js';
import Groups from './lib/groups';
import Camera from './lib/camera.js';

import { Orbiter, Speaker, Listener } from './components.js';
import { Mouse, MouseElement } from './lib/mouse.js';
import { Box } from './lib/collisions.js';

export default function App(canvas) {
    const defaultConfigs = {
        orbiter: {
            showPath: true
        }
    }
    let tickSpeed = 1000 / 100;
    let maxTickInterval = 50;

    const bus = EventBus();
    const clock = Clock(maxTickInterval);
    const tagger = Groups();
    const camera = new Camera();
    const mouse = new Mouse(canvas, camera);
    let audioCtx = null;

    camera.setSize(canvas.width, canvas.height);

    let state = {
        speed: 1,
        runtime: 0,
        mousePos: Vector.copy(mouse.mousePos),
        screenCenter: camera.fromPos(new Vector(canvas.width/2, canvas.height/2)),
        camera,
        groups: tagger.groups
    };

    function setAudioContext(ctx) {
        audioCtx = ctx;
    }

    let initialCameraPos = null;
    
    mouse.bus.subscribe('start-dragging-left', startDragging);
    function startDragging(event) {
        if (event.element) return;
        initialCameraPos = Vector.copy(camera.pos);
    }
    
    mouse.bus.subscribe('drag-left', draggedMouse);
    function draggedMouse(event) {
        if (event.element) return;
        const worldDelta = camera.fromScaled(event.deltaMove.multiply(-1));
        camera.moveTo(worldDelta.add(initialCameraPos));    
    }
    
    mouse.bus.subscribe('scroll', scrolledMouse);
    function scrolledMouse(event) {
        const zoom = camera.zoom * (1 + 0.1 * event.delta);
        const focus = mouse.mousePos;
        camera.setZoom(zoom, focus);
    }

    mouse.bus.subscribe('move', updateMouse);
    mouse.bus.subscribe('scroll', updateMouse);
    function updateMouse(event) {
        state.mousePos.set(camera.fromPos(mouse.mousePos));
        state.screenCenter.set(camera.fromPos(new Vector(canvas.width/2, canvas.height/2)));
    }


    function init(autoStart=true) {
        tagger.add('update');
        tagger.add('orbiters');
        tagger.add('listener');
        tagger.add('speakers');
        tagger.add('mouse-elements');
        if (autoStart) start();
    }

    let interval = null;
    function start() {
        interval = setInterval(tick, tickSpeed);
    }
    function stop() {
        clearInterval(interval);
    }

    function tick() {
        const deltaTime = (clock.tick() / 1000) * state.speed;
        update(deltaTime);
        state.runtime += deltaTime;
    }

    function update(time) {
        for (let component of state.groups.update) {
            component.update(time);
        }
        camera.update(time);
        bus.publish('updated', state);
    }


    function createOrbiter(pos, radius, speed, configs={}) {
        configs = {
            ...defaultConfigs.orbiter,
            ...configs
        }
        const orbiter = new Orbiter(pos, radius, speed, configs);
        tagger.add('orbiters', orbiter);
        tagger.add('update', orbiter);
        return orbiter;
    }

    function createSpeaker(listener, pos, frequency, volume=null) {
        const speaker = new Speaker(audioCtx, pos, frequency, volume);
        tagger.add('speakers', speaker);
        tagger.add('update', speaker);
        speaker.setListener(listener);
        speaker.play();
        return speaker;
    }

    function createListener(...params) {
        const listener = new Listener(...params);
        tagger.add('listener', listener);
        tagger.add('update', listener);
        return listener;
    }
    
    function createMouseElement(pos, hitbox, cfg, render=undefined) {
        const element = new MouseElement(pos, hitbox, cfg);
        if (render) element.render = render;
        mouse.addElement(element);
        tagger.add('mouse-elements', element);
    }


    return {
        state,
        
        // setters
        setAudioContext,
        
        // factory methods
        createOrbiter,
        createSpeaker,
        createListener,
        createMouseElement,
        
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        add: tagger.add,
        remove: tagger.remove,
        init,
        start,
        stop,
        tick
    };
}
