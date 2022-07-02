
import Vector from './lib/math/vector.js';

export default function Renderer(canvas) {

    function getContext(state) {
        return {
            canvas,
            positioned(pos, condition=undefined) {
                if (condition) return state.camera.getPos(Vector.convert(pos));
                return Vector.convert(pos);
            },
            scaled(num, condition=undefined) {
                if (condition) return state.camera.getScaled(num);
                return num;
            },
            text(cfg) {
                canvas.text(
                    this.positioned(cfg.pos, !cfg.fixedPos),
                    cfg.text,
                    this.scaled(cfg.size, !cfg.fixedSize),
                    cfg.textAlign,
                    cfg.color,
                    cfg.family
                );
            },
            line(cfg) {
                canvas.line(
                    this.positioned(cfg.pos1, !cfg.fixedPos),
                    this.positioned(cfg.pos2, !cfg.fixedPos),
                    this.scaled(cfg.width, !cfg.fixedWidth),
                    cfg.color,
                    cfg.alpha
                );
            },
            rect(cfg) {
                canvas.rect(
                    this.positioned(cfg.pos1, !cfg.fixedPos),
                    this.positioned(cfg.pos2, !cfg.fixedPos),
                    this.scaled(cfg.width, !cfg.fixedWidth),
                    cfg.color,
                    cfg.alpha
                );
            },
            circle(cfg) {
                canvas.circle(
                    this.positioned(cfg.pos, !cfg.fixedPos),
                    this.scaled(cfg.radius, !cfg.fixedRadius),
                    this.scaled(cfg.width, !cfg.fixedWidth),
                    cfg.color,
                    cfg.alpha
                );
            },
            disk(cfg) {
                canvas.disk(
                    this.positioned(cfg.pos, !cfg.fixedPos),
                    this.scaled(cfg.radius, !cfg.fixedRadius),
                    cfg.color,
                    cfg.alpha
                );
            }
        };
    }
    
    function render(state) {
        const ctx = getContext(state);
        canvas.fill();
        for (let orbiter of state.groups.orbiters) {
            orbiter.render(ctx);
        }
        for (let speaker of state.groups.speakers) {
            speaker.render(ctx);
        }
        for (let listener of state.groups.listener) {
            listener.render(ctx);
        }
        for (let mouseElement of state.groups['mouse-elements']) {
            mouseElement.render(ctx);
        }
        canvas.circle(state.camera.getPos(state.mousePos), 10, 2, '#ffffff', 0.5);
        const years = state.runtime / 10;
        const txt = `${state.runtime.toFixed(1)}s - ${years.toFixed(0)} years`;
        canvas.text(new Vector(10, 40), txt, 40);
    }

    return {
        render
    }
}