
console.log('Init.');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class ProgressCircle {
    constructor(selector, angle=null) {
        this.element = document.querySelector(selector);
        this.label = this.element.querySelector('.label');
        this.angle = angle || 0;
        this.prevAngle = 0;
        this.animationDuration = 0.5;
        this.update();
    }

    setAngle(angle) {
        this.prevAngle = this.angle;
        this.angle = angle;
        this.update();
    }

    update() {
        const prevQuad = this.getQuadrant(this.prevAngle);
        const currentQuad = this.getQuadrant(this.angle);

        const segments = this.element.querySelectorAll('.segment');
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const rotate = 90 * i - 90;
            const prevSkew = this.getSkew(this.prevAngle, i);
            const skew = this.getSkew(this.angle, i);

            const duration = Math.abs(skew - prevSkew) / 90 * this.animationDuration;

            //if (i === currentQuad && i === prevQuad) {
            //    segment.style.transitionTimingFunction = 'ease-in-out';
            //}
            //else if (i === currentQuad) {
            //    segment.style.transitionTimingFunction = 'ease-out';
            //}
            //else if (i === prevQuad) {
            //    segment.style.transitionTimingFunction = 'ease-in';
            //}
            //else {
            //    segment.style.transitionTimingFunction = 'linear';
            //}

            const delay = Math.abs((i - prevQuad) * this.animationDuration);
            segment.style.transitionDuration = `${duration}s`;
            segment.style.transitionDelay = `${delay}s`;
            segment.style.transform = `rotate(${rotate}deg) skew(${skew}deg)`;
        }
    }

    getSkew(angle, quadrant) {
        return 90 - Math.max(Math.min(angle - (90 * quadrant), 90), 0);
    }

    getQuadrant(angle) {
        // 0  <= angle <= 90  = 0
        // 90  < angle <= 180 = 1
        // 180 < angle <= 270 = 2
        // 270 < angle <= 360 = 3
        return Math.max(Math.ceil(angle / 90) - 1, 0);
    }
}

const circle1 = new ProgressCircle('#circle-1');
const circle2 = new ProgressCircle('#circle-2');
const circle3 = new ProgressCircle('#circle-3');

function update() {
    circle1.setAngle(Math.random() * 360);
    circle2.setAngle(Math.random() * 360);
    circle3.setAngle(Math.random() * 360);
}
update();
//setInterval(update, 2000);
