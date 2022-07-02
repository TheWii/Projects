
import { lerp, dist, factorial, bernstein, round } from './lib/math.js';
import Clock from './lib/clock.js';


export default App;

export function App(canvasElement) {
    const clock = Clock(50);
    let state = {
        mouse: [],
        vertices: [],
        weights: [],
        levels: [],
        path: [],
        pathPos: null,
        targetVertex: null,
        status: 'idle',
        detailedMode: false,
    };
    
    let runtime = 0;
    let lerpRate = 5;
    let defaultWeight = 1.0;
    
    function canvasPos(e) {
        return [
            Math.round(e.offsetX * canvasElement.width / canvasElement.clientWidth),
            Math.round(e.offsetY * canvasElement.height / canvasElement.clientHeight)
        ];
    }
    
    function mouseMove(event) {
        const pos = canvasPos(event);
        state.mouse = pos;
        checkCursor();
    };
    
    
    function mouseLeftClick(event) {
        event.preventDefault();
        const pos = canvasPos(event);
        if (state.status === 'paused') {
            state.status = 'drawing';
            return;
        }
        state.status = 'drawing';
        state.vertices.push(pos);
        state.weights.push(defaultWeight);
    }
    
    function mouseRightClick(event) {
        event.preventDefault();
        state.status = 'paused';
    }
    
    
    function mouseScroll(event) {
        const delta = event.wheelDelta / 150;
        if (state.targetVertex !== null) {
            state.weights[state.targetVertex] += (0.1 * delta);
            state.detailedMode = false; // disable detailed mode
            state.levels = [];
        }
    };
    
    
    function undoVertex(event) {
        if (!event.ctrlKey) return;
        if (!state.vertices.length) return;
        state.vertices.pop();
        state.weights.pop();
        if (!state.vertices.length) {
            state.levels = [];
            state.path = [];
            state.pathPos = null;
            state.status = 'idle';
        }
    }
    
    function switchMode(event) {
        // if any of the vertices have a weight that is not
        // 1.0 the detailed mode must not work.
        if (state.weights.find(v => v !== 1.0)) return;
        state.detailedMode = !state.detailedMode;
        state.levels = [];
        console.log(`Set detailedMode to ${state.detailedMode}.`);
    }
    
    
    function checkCursor() {
        // Check targeted vertex;
        state.targetVertex = null;
        for (let [i, vertex] of state.vertices.entries()) {
            if (dist(state.mouse, vertex) > 13) continue;
            state.targetVertex = i;
            break;
        }
    }
    
    
    
    function computeWeightedCurve(input, t, w=state.weights) {
        let n = input.length - 1;
        let num = [0, 0];
        const denom = input.reduce((denom, point, i) => {
            const formula = bernstein(i, n, t) * (w[i] || defaultWeight);
            //console.log(i, formula);
            denom += formula;
            num[0] += point[0] * formula;
            num[1] += point[1] * formula;
            return denom;
        }, 0);
        //console.log(num, denom);
        num[0] /= denom;
        num[1] /= denom;
        return num;
    }
    
    function computeCurve(input, t) {
        let n = input.length - 1;
        return input.reduce((sum, point, i) => {
            const formula = bernstein(i, n, t);
            sum[0] += formula * point[0];
            sum[1] += formula * point[1];
            return sum;
        }, [0, 0]);
    }
    
    function computeDerivative(input, t) {
        let n = input.length - 1;
        let result = [0, 0];
        for (let i=0; i < n; i++) {
            const current = input[i];
            const next = input[i+1];
            const formula = bernstein(i, n-1, t);
            result[0] += formula * (next[0] - current[0]);
            result[1] += formula * (next[1] - current[1]);
        }
        result[0] *= n;
        result[1] *= n;
        return result;
    }
    
    function detailedCurve(input, t) {
        const result = [];
        function interpolate(points) {
            const level = [];
            for (let i = 0; (i+1) < points.length; i++) {
                level.push(lerp(points[i], points[i+1], t));
            }
            return level;
        }
        let level = input;
        while(level.length > 1) {
            level = interpolate(level);
            result.push(level);
        }
        return result;
    }
    
    function computePath(input, n=100) {
        const path = [];
        const rate = 1 / n;
        for (let i=0; i < n; i++) {
            path.push(computeWeightedCurve(input, i*rate));
        }
        return path;
    }
    
    
    function update(time) {
        runtime += time;
        if (state.vertices.length) {
            const t = (runtime % lerpRate) / lerpRate;
            const preview = (state.status === 'drawing') ? Array.of(...state.vertices, state.mouse) : state.vertices;
            if (state.detailedMode) state.levels = detailedCurve(preview, t);
            state.pathPos = computeWeightedCurve(preview, t);
            state.path = computePath(preview, 1000);
        }
    }

    let tickTimer = null;
    function init() {
        tickTimer = setInterval(tick, 20);

    }
    
    function tick() {
        // get delta time in seconds.
        const time = clock.tick() / 1000;
        update(time);
    }

    return {
        state,
        init,
        mouseMove,
        mouseLeftClick,
        mouseRightClick,
        mouseScroll,
        undoVertex,
        switchMode
    }
}
