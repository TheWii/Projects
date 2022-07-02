
import Vector from './lib/math/vector.js';
import EventBus from './lib/events.js';
import Clock from './lib/clock.js';
import Groups from './lib/groups.js';
import Camera from './lib/camera.js';
import KeyboardListener from './lib/keyboard.js';

import { Circle } from './lib/collisions.js';
import { Mouse, MouseElement } from './lib/mouse.js';

import { Node, Button } from './components.js';
import { Transmitter, Source } from './roles.js';

export default function App(canvas, cfg={}) {
    const defaultConfigs = {
        tickSpeed: 1000 / 100,
        maxTickInterval: 50
    }
    cfg = {
        ...defaultConfigs,
        ...cfg
    }


    const bus = EventBus();
    const clock = Clock(cfg.maxTickInterval);
    const groups = Groups();
    const camera = new Camera();
    const mouse = new Mouse(canvas, camera);
    const keyboard = KeyboardListener(document);

    camera.setSize(canvas.width, canvas.height);

    const modes = {
        VIEW: 0,
        ADDNODE: 1
    };
    const roles = {
        //Node(pos) {
        //    return createNode(pos)
        //},
        Transmitter(pos) {
            return createTransmitter(pos, 0)
        },
        Source(pos) {
            return createSource(pos, 1)
        }
    };

    let state = {
        speed: 1,
        mousePos: Vector.copy(mouse.mousePos),
        screenCenter: camera.fromPos(new Vector(canvas.width/2, canvas.height/2)),
        camera,
        groups
    };

    mouse.bus.subscribe('start-dragging-left', startDragging);
    mouse.bus.subscribe('drag-left', draggedMouse);
    mouse.bus.subscribe('scroll', scrolledMouse);
    mouse.bus.subscribe('move', updateMouse);
    mouse.bus.subscribe('scroll', updateMouse);
    mouse.bus.subscribe('released-left', addNode);
    mouse.bus.subscribe('released-left', clickedNode);

    keyboard.subscribe('keyup', 'z', undoNode);
    keyboard.subscribe('keyup', 'Delete', (event) => {
        if (state.selectedNode) deleteNode(state.selectedNode);
    });

    // NAVIGATION
    let initialCameraPos = null;
    function startDragging(event) {
        if (event.element) return;
        //console.log('Start dragging screen.');
        initialCameraPos = Vector.copy(camera.pos);
    }
    
    function draggedMouse(event) {
        if (event.element) return;
        //console.log('Drag screen.');
        const worldDelta = camera.fromScaled(event.deltaMove.multiply(-1));
        camera.moveTo(worldDelta.add(initialCameraPos));    
    }
    
    function scrolledMouse(event) {
        //console.log('Zoom screen.');
        const zoom = camera.zoom * (1 + 0.1 * event.delta);
        const focus = mouse.mousePos;
        camera.setZoom(zoom, focus);
    }

    function updateMouse(event) {
        state.mousePos.set(camera.fromPos(mouse.mousePos));
        state.screenCenter.set(camera.fromPos(new Vector(canvas.width/2, canvas.height/2)));
    }

    function undoNode(event) {
        if (!event.ctrlKey) return;
        const nodes = groups.get('nodes');
        if (!nodes.length) return;
        const node = nodes[nodes.length - 1];
        deleteNode(node);
    }


    function clickedNode(event) {
        if (!event.target) return;
        if (!(event.target.parent instanceof Node)) return;
        const node = event.target.parent;

        if (event.domEvent.shiftKey && state.selectedNode) {
            node.connect(state.selectedNode);
            return;
        }

        selectNode(node);
    }

    function selectNode(node) {
        const unselected = unselectNode();
        if (node !== unselected) {
            state.selectedNode = node;
            node.select()
        }
    }

    function unselectNode() {
        const node = state.selectedNode;
        if (!node) return;
        node.unselect();
        state.selectedNode = null;
        return node;
    }

    function addNode(event) {
        if (state.mode !== modes.ADDNODE) return;
        if (event.target) return;

        const pos = camera.fromPos(event.pos);
        const createRole = roles[state.role];
        const node = createRole(pos);

        if (state.selectedNode) {
            node.connect(state.selectedNode);
        }
        if ( !event.domEvent.shiftKey || !state.selectedNode)
            selectNode(node);
    }

    function deleteNode(node) {
        groups.removeAll(node);
        node.disconnectAll();
        if (state.selectedNode === node) {
            unselectNode();
        } 
    }


    // SETTERS
    function setMode(mode) {
        state.mode = mode;
    }

    let roleIndex = -1;
    function nextRole() {
        const roleNames = Object.keys(roles);
        roleIndex = (roleIndex + 1) % roleNames.length;
        state.role = roleNames[roleIndex];
        bus.publish('changed-role', state.role);
    }


    // MAIN
    function init(autoStart=true) {
        state.runtime = 0;
        groups.add('nodes');
        groups.add('update');
        groups.add('mouse-elements');
        setMode(modes.VIEW);
        nextRole();
        if (autoStart) start();
    }

    let interval = null;
    function start() {
        interval = setInterval(tick, cfg.tickSpeed);
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
        for (let component of groups.get('update')) {
            //component.update(time);
        }
        camera.update(time);
        bus.publish('updated', state);
    }


    // FACTORY
    function createMouseElement(pos, hitbox, cfg, render=undefined) {
        const element = new MouseElement(pos, hitbox, cfg);
        if (render) element.render = render;
        mouse.addElement(element);
        groups.add('mouse-elements', element);
        return element;
    }
    
    function createNode(pos, cfg={}) {
        const hitbox = new Circle(30);
        const mouseElement = createMouseElement(pos, hitbox, {
            isHoverable: true,
            isClickable: true,
            isDraggable: true,
            fixedPos: false,
            fixedScale: false
        });
        const node = new Node(pos, mouseElement, cfg);
        groups.add('nodes', node);
        //groups.add('update', node);
        return node;
    }

    function createTransmitter(pos, resistance, cfg={}) {
        const node = createNode(pos, cfg);
        const role = new Transmitter(resistance);
        node.setRole(role);
        return node;
    }

    function createSource(pos, current, cfg={}) {
        pos = Vector.convert(pos);
        const nodeOut = createNode(pos, {
            color: '#ff9696',
            size: 20,
            ...cfg
        });
        nodeOut.type = 'out';
        const pos2 = pos.sum([0, (nodeOut.cfg.size * 2) + 20]);
        const nodeIn = createNode(pos2, {
            color: '#96b0ff',
            size: 20,
            ...cfg
        });
        nodeIn.type = 'in';
        const role = new Source(current);
        nodeIn.setRole(role);
        nodeOut.setRole(role);
        groups.add('sources', nodeOut);
        groups.add('update', nodeOut);
        return nodeOut;
    }
    
    function createButton(pos, hitbox, cfg={}) {
        const button = new Button(pos, hitbox, cfg);
        mouse.addElement(button);
        groups.add('button', button);
        return button;
    }


    return {
        state,
        modes,

        setMode,
        nextRole,
                
        // factory methods
        createMouseElement,
        createNode,
        createTransmitter,
        createSource,
        createButton,
        
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        add: groups.add,
        remove: groups.remove,
        init,
        start,
        stop,
        tick
    };
}
