
function getComponents(arg) {
    if (arg instanceof Vector) return [ arg.x, arg.y ];
    if (arg instanceof Array) return [ arg[0], arg[1] ];
    return [ arg, arg ];
}


export default function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype = {
    ...Vector.prototype,

    /* IN PLACE OPERATIONS */
    /**
     * ```
     * vec = new Vector(0, 0)
     * 
     * vec.set(1) // Vector(1, 1)
     * vec.set(3, 4) // Vector(3, 4)
     * vec.set([9, 8]) // Vector(9, 8)
     * 
     * vec2 = new Vector(5, 4)
     * vec.set(vec2) // Vector(5, 4)
     * ```
     */
    set(x, y=null) {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
            return;
        }
        if (x instanceof Array) {
            this.x = x[0];
            this.y = x[1];
            return;
        }
        if (y === null) y = x;
        this.x = x;
        this.y = y;
    },

    add(val) {
        const [x, y] = getComponents(val);
        this.x += x;
        this.y += y;
        return this;
    },
    
    subtract(val) {
        const [x, y] = getComponents(val);
        this.x -= x;
        this.y -= y;
        return this;
    },
    
    multiply(val) {
        const [x, y] = getComponents(val);
        this.x *= x;
        this.y *= y;
        return this;
    },

    divide(val) {
        const [x, y] = getComponents(val);        
        this.x /= x;
        this.y /= y;
        return this;
    },


    /* RETURN NEW VECTOR */

    sum(vec) {
        vec = Vector.convert(vec);
        return new Vector (
            this.x + vec.x,
            this.y + vec.y
        );
    },

    diff(vec) {
        vec = Vector.convert(vec);
        return new Vector (
            this.x - vec.x,
            this.y - vec.y
        );
    },

    prod(val) {
        return new Vector (
            this.x * val,
            this.y * val
        );
    },

    quot(val) {
        return new Vector (
            this.x / val,
            this.y / val
        );
    },

    abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    },

    /* RETURN SCALAR */

    dist(vec) {
        return Math.sqrt( (this.x - vec.x)**2 + (this.y - vec.y)**2 );
    },

    dot(vec) {
        return (this.x * vec.x) + (this.y * vec.y);
    },

    length() {
        return Math.sqrt( this.x**2 + this.y**2 );
    },

    normalize() {
        const length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    },

    toString() {
        return `(${this.x}, ${this.y})`
    }

};

/* STATIC METHODS */

Vector.fromAngle = function(angle) {
    return new Vector(
        Math.cos(angle),
        Math.sin(angle)
    );
}
2
Vector.convert = function(vectorLike) {
    if (vectorLike instanceof Vector) return vectorLike;
    return new Vector(
        vectorLike[0],
        vectorLike[1]
    );
}

Vector.copy = function(vec) {
    return new Vector(vec.x, vec.y);
}