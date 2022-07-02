console.log('[Main] Initializing...');

function sum(...terms) {
    return terms.reduce((prev, curr) => prev + curr);
}

function product(...terms) {
    return terms.reduce((prev, curr) => prev * curr);
}


function mean(...terms) {
    return sum(...terms) / terms.length;
}

function weightedMean(...terms) {
    let dividendSum = 0;
    let weightSum = 0;
    for (let term of terms) {
        dividendSum += term[0] * term[1];
        weightSum += term[1];
    }
    return dividendSum / weightSum;
}

function harmonicMean(...terms) {
    const sum = terms.reduce(
        (prev, curr) => prev + (1/curr), 0
    );
    return terms.length / sum;
}

function variance(...terms) {
    const m = mean(...terms);
    const sum = terms.reduce(
        (prev, curr) => prev + (curr - m)**2, 0
    );
    return sum / terms.length;
}

function standardDeviation(...terms) {
    return Math.sqrt(variance(...terms));
}


function QuadraticFormula(a, b, c) {
    function calc(x) {
        return (a * x**2) + (b * x) + c;
    }
    return calc;
}

function LinearFormula(a, b) {
    function calc(x) {
        return (a * x) + b;
    }
    return calc;
}

function ExponentialFormula(a) {
    function calc(x) {
        return a ** x;
    }
    return calc;
}

function LogarithmicFormula(base) {
    function calc(x) {
        return log(x, base);
    }
    return calc;
}


function log(x, base=null) {
    if (base) return Math.log10(x) / Math.log10(base);
    return Math.log10(x);
}