
export default MouseListener;

export function MouseListener(element) {
    const events = {};

    function subscribe(observer, type, subtype=null) {
        if (subtype) {
            events[type] = events[type] || {};
            const subtypes = events[type];
            subtypes[subtype] = subtypes[subtype] || [];
            const observers = subtypes[subtype];
            observers.push(observer);
        } else {
            events[type] = events[type] || [];
            const observers = events[type];
            observers.push(observer);
        }
    }

    function unsubscribe(observer, type, subtype=null) {
        let observers = events[type];
        if (!observers) return;
        if (subtype) {
            // unwrap subtype layer
            observers = observers[subtype];
            if (!observers) return;
        }
        const index = observers.indexOf(observer);
        if (index < 0) return;
        observers.splice(index, 1);
    }
    
    function notify(type, subtype=null, ...args) {
        let observers = events[type];
        if (!observers) return;
        if (subtype) {
            // unwrap subtype layer
            observers = observers[subtype];
            if (!observers) return;
        }
        for (let observer of observers) {
            observer(...args);
        }
    }

    element.addEventListener('mouseup', handleClick);
    element.addEventListener('mousedown', handleClick);
    function handleClick(event) {
        const buttons = [ 'left', 'middle', 'right' ];
        notify(event.type, buttons[event.button], event);
    }

    element.addEventListener('wheel', handleWheel);
    function handleWheel(event) {
        //const direction = event.wheelDelta > 0 ? 'up' : 'down';
        notify(event.type, null, event);
    }

    element.addEventListener('mousemove', handleMovement);
    function handleMovement(event) {
        notify(event.type, null, event);
    }

    return {
        subscribe,
        unsubscribe
    }
}