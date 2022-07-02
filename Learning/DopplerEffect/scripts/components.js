
import Vector from './lib/math/vector.js';
import { hex } from './lib/utils.js';

export class Component {
    constructor(pos) {
        this.groups = [];
        this.pos = Vector.convert(pos);
        this.lastPos = Vector.copy(this.pos);
        this.deltaPos = new Vector(0, 0);
        this.id = hex(6);
    }

    update(time) {
        this.deltaPos.set(this.pos.diff(this.lastPos));
        this.lastPos.set(this.pos);
    }
}

export class Orbiter extends Component {
    constructor(origin, radius, speed, configs={}) {
        const pos = new Vector(null, null);
        super(pos);
        this.origin = Vector.convert(origin);
        this.radius = radius;
        this.speed = speed;
        this.angle = configs.initialAngle || 0;
        this.deltaPos = new Vector(0, 0);
        this.configs = {
            showPath: false,
            showOrigin: false,
            showRadiusLine: false,
            showDirection: false,
            showName: false,
            nameColor: '#ffffff',
            nameSize: 40,
            radius: 6,
            color: '#ffff99',
            ...configs
        };
    }

    getDirection() {
        return new Vector(
            Math.cos(this.angle) * this.radius,
            Math.sin(this.angle) * this.radius
        );
    }

    getTangent() {
        const direction = this.getDirection();
        if (this.angle > 0) return new Vector(-direction.y, direction.x).normalize();
        else return new Vector(direction.y, -direction.x).normalize();
    }

    update(time) {
        this.angle += this.speed * time;
        this.pos.set(this.origin.sum(this.getDirection()));
        super.update(time);
    }

    render(ctx) {
        if (this.configs.showPath)
            ctx.circle({ pos: this.origin, radius: this.radius,
                width: 3, color: '#ffffff', alpha: 0.2, fixedWidth: true
            });
        if (this.configs.showRadiusLine)
            ctx.line({pos1: this.origin, pos2: this.pos, width: 4,
                color: '#ffffff', alpha: 0.2
            });
        if (this.configs.showOrigin)
            ctx.disk({pos: this.origin, width: 6, color: '#ffffff',
                alpha: 0.2
            });
        if (this.configs.showDirection)
            ctx.line({
                pos1: this.pos, pos2: this.pos.sum(this.deltaPos.prod(10)),
                width: 4, color: '#ffaaaa', alpha: 0.5
            });
        ctx.disk({pos: this.pos, radius: this.configs.radius,
                  color: this.configs.color});
        if (this.configs.showName) {
            const pos = Vector.copy(this.pos);
            pos.y -= this.configs.radius + this.configs.nameSize;
            ctx.text({ pos,  text: this.configs.displayName,
                size: this.configs.nameSize, color: this.configs.nameColor,
                textAlign: true, fixedSize: true
            });
        }
    }
}

export class Speaker extends Component {
    constructor(context, pos, frequency, volume=null) {
        super(pos);
        this.context = context;
        this.frequency = frequency;
        this.volume = volume || 1;
        this.distance = 0;
        this.lastDistance = 0;
    }
    
    setFrequency(value) {
        this.frequency = value;
        this.oscillator.frequency.value = value;
    }
    setVolume(value) {
        this.volume = value;
        this.gain.gain.value = value;
    }
    setListener(listener) {
        this.listener = listener;
    }
    
    play() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.frequency.value = this.frequency;
        gain.gain.value = this.volume;
        osc.start(0);
        this.oscillator = osc;
        this.gain = gain;
    }

    ramp(volume=0.00001, time=0.05) {
        this.gain.gain.exponentialRampToValueAtTime(
            volume, this.context.currentTime + time
        );
    }

    getVolumeByDistance(distance) {
        const min = 0.00001;
        const attenuation = 0.032;
        const decrease = Math.log2(distance) * attenuation;
        return Math.max( (this.volume - decrease), min);
    }

    getDistorted(time) {
        const waveSpeed = 12000;
        const deltaDist = this.distance - this.lastDistance;
        const relativeSpeed = deltaDist / time;
        const min = Math.max(this.frequency * 0.25, 0);
        const max = Math.min(this.frequency * 1.75, 20000);

        let distorted = (this.frequency * waveSpeed) / (waveSpeed + relativeSpeed);
        distorted = Math.min(Math.max(distorted, min), max);
        return distorted;
    }

    update(time) {
        super.update(time);
        this.lastDistance = this.distance;
        this.distance = this.pos.dist(this.listener.pos);

        const distorted = this.getDistorted(time);
        this.oscillator.frequency.value = distorted;
        
        const volume = this.getVolumeByDistance(this.distance);
        this.ramp(volume, 0.1);
    }

    render(ctx) {
        ctx.disk({pos: this.pos, radius: 10, color: '#ffaaaa'});
    }
}

export class Listener extends Component {
    constructor(pos) {
        super(pos);
    }

    render(ctx) {
        ctx.disk({pos: this.pos, radius: 10, color: '#aaffaa'});
    }
}