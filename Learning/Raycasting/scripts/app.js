
import Vector from './lib/math/vector.js';
import { Ray, Boundary} from './components.js';


export default function App(elCanvas, cfg={}) {
    const defaultConfigs = {
        maxReflections: 32
    }
    cfg = { ...defaultConfigs, ...cfg };

    let state = {
        groups: {},
        mouseTarget: new Vector(900, 400),
    }
    let ticking = null;
    let initiated = false;

    function add(tag, ...lines) {
        state.groups[tag] = state.groups[tag] || [];
        for (let line of lines) {
            const i = state.groups[tag].indexOf(line);
            if (i >= 0) continue;  
            state.groups[tag].push(line);
        }
    }
    function remove(tag, ...lines) {
        if (!state.groups[tag]) return;
        for (let line of lines) {
            const i = state.groups[tag].indexOf(line);
            if (i < 0) continue;  
            state.groups[tag].splice(i, 1);
        }
    }
    
    function mouseMove(event) {
        state.mouseTarget.set(event.pos);
    }


    function init(autoStart=true) {
        if (initiated) return;
        setScreenBoundaries();
        add('render');
        add('rays');
        add('boundaries');
        add('intersected');
        initiated = true;
        if (autoStart) start();
    }

    function setScreenBoundaries() {
        const topLeft = new Vector(-1, -1);
        const topRight = new Vector(elCanvas.width + 1, -1);
        const bottomLeft = new Vector(-1, elCanvas.height + 1);
        const bottomRight = new Vector(elCanvas.width + 1, elCanvas.height + 1);
        add('boundaries', new Boundary(topLeft, topRight));
        add('boundaries', new Boundary(bottomLeft, bottomRight));
        add('boundaries', new Boundary(topLeft, bottomLeft));
        add('boundaries', new Boundary(topRight, bottomRight));
    }

    
    function start() {
        if (ticking) return;
        ticking = setInterval(tick, 20);
    }
    function stop() {
        if (!ticking) return;
        window.clearInterval(ticking);
        ticking = null;
    }

    function computeIntersections() {
        const rays = state.groups.rays;
        const boundaries = state.groups.boundaries;
        remove('intersected', ...rays);
        for (let ray of rays) {
            ray.clear();
            trace(ray);
        }
    }

    function trace(ray, boundaries=null) {
        boundaries = boundaries || state.groups.boundaries;
        ray.intersected = null;
        let nearest = { dist: Infinity };
        for (let boundary of boundaries) {
            const result = ray.intersection(boundary);
            if (!result) continue;
            if (result.dist < nearest.dist) nearest = {
                boundary,
                ...result
            };
        }
        if (!nearest.boundary) return;
        ray.intersected = nearest;
        add('intersected', ray);
        add('illuminated', nearest.boundary);
        const context = {
            ray,
            pos: nearest.pos,
            retrace: function(boundaries=null) {
                if (this.ray.reflections.length > cfg.maxReflections) return;
                trace(this.ray, boundaries);
            }
        };
        nearest.boundary.intersected(context);
    }
    
    function update() {
        computeIntersections();
    }

    return {
        state,
        configs: cfg,
        update,
        init,
        start,
        stop,
        mouseMove,
        add,
        remove
    }
}