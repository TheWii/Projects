
export default function Clock(maxInterval=null) {
    if (maxInterval === null) maxInterval = Infinity;
    let lastTick = null;
    let deltaTime = null;

    function tick() {
        const now = Date.now();
        if (!lastTick) lastTick = now;
        const deltaTime = Math.min((now - lastTick), maxInterval);
        lastTick = now;
        return deltaTime;
    }

    function getDelta() { return deltaTime };
    function getLastTick() { return lastTick };

    return {
        getDelta,
        getLastTick,
        tick
    }
}
