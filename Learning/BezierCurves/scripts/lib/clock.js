
export default Clock;

export function Clock(maxInterval) {
    let lastTick = null;
    let deltaTime = null;

    function tick() {
        let now = Date.now();
        if (!lastTick) lastTick = now;
        let deltaTime = now - lastTick;
        deltaTime = Math.min(deltaTime, maxInterval);
        lastTick = now;
        return deltaTime;
    }

    return {
        lastTick,
        deltaTime,
        tick
    }
}
