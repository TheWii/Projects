const date = new Date();

const body = document.body;
const btnStart = document.querySelector('.buttons .run');
const btnStop = document.querySelector('.buttons .stop');
const txtMin = document.querySelector('.clock .min');
const txtSec = document.querySelector('.clock .sec');
const txtLabel = document.querySelector('.label');
btnStop.style.display = 'none';

btnStart.addEventListener('click', e => {
    e.preventDefault();
    manager.runButton();
})

btnStop.addEventListener('click', e => {
    e.preventDefault();
    manager.stopButton();
})


let manager = {
    runButton() {
        switch(timer.state) {
            case 'beginning':
                timer.session = 1;
                timer.run();
                break;
            case 'running':
                timer.pause();
                break;
            case 'paused':
                timer.run();
                break;
        }
    },

    stopButton() {
        switch(timer.state) {
            case 'paused':
                timer.reset();
                break;
        }
    }
}


let timer = {
    state: 'beginning',
    sessionDuration: 3000,
    breakDuration: 600,
    session: 0,
    elapsed: 0,
    pauseTime: 0,
    start: null,
    interval: null,
    onBreak: false, 
    audio: new Howl({
        src: ["alarm.mp3"],
        volume: 0.3,
    }),

    run() {
        this.state = 'running';
        this.pauseTime = 0;
        btnStart.innerHTML = 'Pause';
        txtLabel.innerHTML = this.onBreak ? `Break ${this.session}` : `Session ${this.session}`;
        btnStop.style.display = 'none';
        window.clearInterval(this.interval);
        this.start = getTime();
        this.interval = window.setInterval(this.runInterval(), 100);
    },
    
    pause() {
        this.state = 'paused';
        this.pauseTime = -1;
        btnStop.innerHTML = 'Reset';
        btnStart.innerHTML = 'Continue';
        txtLabel.innerHTML = `Paused`;
        btnStop.style.display = 'inline';
        window.clearInterval(this.interval);
    },
    
    reset() {
        this.state = 'beginning';
        this.onBreak = false;
        this.pauseTime = 0;
        this.elapsed = 0;
        this.session = 0;
        btnStart.innerHTML = 'Start';
        txtLabel.innerHTML = `Start session`;
        btnStop.style.display = 'none';
        window.clearInterval(this.interval);
        blink.stop();
        this.updateClock();
    },
    
    runout() {
        this.state = 'runout';
        this.elapsed = this.duration;
        this.pauseTime = 5.0;
        window.clearInterval(this.interval);
        this.start = getTime();
        this.interval = window.setInterval(this.runoutInterval(), 100);
        blink.start();
        this.audio.play();
    },

    endRunout() {
        this.onBreak = !this.onBreak;
        this.session++;
        this.elapsed = 0.001;
        blink.stop();
        this.run();
    },


    runInterval() {
        let obj = this;
        return function() {
            let now = getTime();
            obj.elapsed += now - obj.start;
            obj.start = now;
            if (obj.remaining < 0) {
                obj.runout();
            }
            obj.updateClock();
        }
    },
    
    runoutInterval() {
        let obj = this;
        return function() {
            let now = getTime();
            obj.pauseTime -= now - obj.start;
            obj.start = now;
            if (obj.pauseTime <= 0) {
                obj.endRunout();
                return;
            }
        }
    },


    updateClock() {
        let remaining = this.remaining;
        if (remaining > 0) remaining += 1;
        txtMin.innerHTML = getDigit(remaining / 60);
        txtSec.innerHTML = getDigit(remaining % 60);
    },

    get duration() {
        return this.onBreak ? this.breakDuration : this.sessionDuration;
    },
    
    get remaining() {
        return this.duration - this.elapsed;
    }
}





let blink = {
    frameAmount: 2,
    frameDuration: 0.5,
    interval: null,
    timeStart: 0,
    time: 0,

    start() {
        window.clearInterval(this.interval);
        this.interval = window.setInterval(this.run(), 100);
        this.timeStart = getTime();
        this.time = 0;
    },
    
    stop() {
        window.clearInterval(this.interval);
        document.querySelector('.blinks')
            .classList.remove('blinking');
    },
    
    run() {
        let obj = this;
        return function() {
            let now = getTime();
            obj.time += now - obj.timeStart;
            obj.timeStart = now;
            let animationTime = obj.frameAmount * obj.frameDuration;
            let frame = Math.floor((obj.time % animationTime) / obj.frameDuration);
            let selected = document.querySelectorAll('.blinks');
            if (frame) {
                selected.forEach(
                    (x) => x.classList.remove('blinking'));
                return;
            }
            selected.forEach(
                (x) => x.classList.add('blinking'));
        }
    }
}

function getDigit(n) {
    return (n < 10 ? '0' : '') + Math.floor(n);
}

function getTime() {
    return Date.now() / 1000;
}