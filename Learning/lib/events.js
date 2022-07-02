
export default EventBus;

export function EventBus(configs) {
    configs = {
        log: false,
        name: '',
        ...configs
    };
    const topics = {};
    
    function subscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (!subscribers.includes(callback))
            subscribers.push(callback);
        topics[topic] = subscribers;
    }

    function unsubscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (subscribers.includes(callback)) {
            const i = subscribers.indexOf(callback);
            subscribers.splice(i, 1);
        }
        topics[topic] = subscribers;
    }
    
    function publish(topic, ...data) {
        const subscribers = topics[topic];
        if (!subscribers) return;
        if (configs.log) console.log(`EventBus<${configs.name || ''}> -> Notifying ${topic} to ${subscribers.length} listeners.`);
        for (const callback of subscribers) {
            callback(...data);
        }
    }
    
    return {
        topics,
        subscribe,
        unsubscribe,
        publish
    }
}