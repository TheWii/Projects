
export function hex(len) {
    return Array.from(Array(len), (v, i) => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function profile(func, repeat, ...params) {
    let start = Date.now();
    for (let i=0; i<repeat; i++) {
        func(...params);
    }
    const delta = (Date.now() - start);
    const avg = delta / repeat;
    console.log(`Profile session completed.\nDURATION: ${delta/1000}s\nNUMBER OF CALLS: ${repeat} times\nFUNCTION SPEED: ${avg}ms\nRATE: ${(1000/avg).toFixed(6)} calls per second`);
}