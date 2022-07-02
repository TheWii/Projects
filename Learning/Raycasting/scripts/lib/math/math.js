

export function round(number, precision) {
    const m = 10 ** precision;
    if (number < 0) return Math.ceil(number * m) / m;
    return Math.floor(number * m) / m;
}

export function lerp(p1, p2, t) {
    return [
        (p1[0] * (1 - t)) + (p2[0] * t),
        (p1[1] * (1 - t)) + (p2[1] * t)
    ];
}

export function dist(p1, p2) {
    return Math.sqrt( (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 );
}

export function factorial(i) {
    if (i < 2) return 1;
    if (factorial.cache[i] > 0) return factorial.cache[i];
    let result = 1;
    for (let n = 2; n <= i; n++) result *= n;
    return factorial.cache[i] = result;
}
factorial.cache = [];


export function binomialCoefficient(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

export function bernstein(i, n, t) {
    return binomialCoefficient(n, i) * t**i * (1 - t)**(n - i);
}

