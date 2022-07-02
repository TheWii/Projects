
export default function Groups() {
    const groups = {};

    function add(tag, ...components) {
        groups[tag] = groups[tag] || [];
        for (let component of components) {
            const i = groups[tag].indexOf(component);
            if (i >= 0) continue;  
            groups[tag].push(component);
            component.groups.push(tag);
        }
    }
    function remove(tag, ...components) {
        if (!groups[tag]) return;
        for (let component of components) {
            const i = groups[tag].indexOf(component);
            if (i < 0) continue;  
            groups[tag].splice(i, 1);
            component.groups.splice(component.groups.indexOf(tag), 1);
        }
    }

    function get(tag) {
        if (!groups[tag]) return [];
        return groups[tag];
    }

    function removeAll(component) {
        while (component.groups.length) {
            remove(component.groups[0], component);
        }
    }

    return {
        groups,
        add,
        remove,
        get,
        removeAll
    }
}

