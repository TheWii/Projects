
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Transmitter {
    constructor(resistance) {
        this.resistance = resistance;
    }

    link(node) {
        this.node = node;
    }

    update(time) {}
}

export class Source {
    constructor(current) {
        this.current = current;
    }

    link(node) {
        const type = node.type;
        if (type !== 'in' && type !== 'out') return;
        this[type] = node;
    }

    async update(time) {

        function walk(origin) {
            console.log(`Walking from origin at ${origin.pos}`);
            let nodes = [];
            for (let node of origin.connections) {
                if (node === origin) continue;
                console.log(`Node ${node.pos}`);
                nodes.push(node);
            }
            return nodes;
        }

        console.log('Updating source.');
        let origin = this.out;
        let jobs = [
            { origin }
        ];
        while (jobs.length) {
            for (let job of jobs) {
                next = walk(jobs.origin);
            }
        }
        
    }
}

window.sleep = sleep;