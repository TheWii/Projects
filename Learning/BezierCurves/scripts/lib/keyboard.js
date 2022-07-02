
export default KeyboardListener;

export function KeyboardListener(document) {
    const events = {};

    function subscribe(observer, type, key) {
        events[type] = events[type] || {};
        const keys = events[type];
        keys[key] = keys[key] || [];
        const observers = keys[key];
        observers.push(observer);
    }

    function unsubscribe(observer, type, key) {
        const keys = events[type];
        if (!keys) return;
        const observers = keys[key];
        if (!observers) return;
        const index = observers.indexOf(observer);
        if (index < 0) return;
        observers.splice(index, 1);
    }

    function notify(type, key, ...args) {
        const keys = events[type];
        if (!keys) return;
        const observers = keys[key];
        if (!observers) return;
        for (let observer of observers) {
            observer(...args);
        }
    }

    document.addEventListener('keydown', handleEvent);
    document.addEventListener('keyup', handleEvent);
    document.addEventListener('keypress', handleEvent);
    function handleEvent(event) {
        notify(event.type, event.key, event);
    }

    return {
        subscribe,
        unsubscribe
    }
}