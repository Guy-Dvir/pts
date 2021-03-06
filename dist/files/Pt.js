"use strict";
// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
const Num_1 = require("./Num");
const LinearAlgebra_1 = require("./LinearAlgebra");
exports.PtBaseArray = Float32Array;
/**
 * Pt is a subclass of Float32Array with additional properties and functions to support vector and geometric calculations.
 * See [Pt guide](../../guide/Pt-0200.html) for details
 */
class Pt extends exports.PtBaseArray {
    /**
     * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
     *
     * Note that `new Pt(3)` will only instantiate Pt with length of 3 (ie, same as `new Float32Array(3)` ). If you need a Pt with 1 dimension of value 3, use `new Pt([3])`.
     * @example `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    constructor(...args) {
        if (args.length === 1 && typeof args[0] == "number") {
            super(args[0]); // init with the TypedArray's length. Needed this in order to make ".map", ".slice" etc work.
        }
        else {
            super((args.length > 0) ? Util_1.Util.getArgs(args) : [0, 0]);
        }
    }
    static make(dimensions, defaultValue = 0, randomize = false) {
        let p = new exports.PtBaseArray(dimensions);
        if (defaultValue)
            p.fill(defaultValue);
        if (randomize) {
            for (let i = 0, len = p.length; i < len; i++) {
                p[i] = p[i] * Math.random();
            }
        }
        return new Pt(p);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    get x() { return this[0]; }
    get y() { return this[1]; }
    get z() { return this[2]; }
    get w() { return this[3]; }
    set x(n) { this[0] = n; }
    set y(n) { this[1] = n; }
    set z(n) { this[2] = n; }
    set w(n) { this[3] = n; }
    /**
     * Clone this Pt
     */
    clone() {
        return new Pt(this);
    }
    /**
     * Check if another Pt is equal to this Pt, within a threshold
     * @param p another Pt to compare with
     * @param threshold a threshold value within which the two Pts are considered equal. Default is 0.000001.
     */
    equals(p, threshold = 0.000001) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (Math.abs(this[i] - p[i]) > threshold)
                return false;
        }
        return true;
    }
    /**
     * Update the values of this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    to(...args) {
        let p = Util_1.Util.getArgs(args);
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            this[i] = p[i];
        }
        return this;
    }
    /**
     * Like `to()` but returns a new Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $to(...args) {
        return this.clone().to(...args);
    }
    /**
     * Update the values of this Pt to point at a specific angle
     * @param radian target angle in radian
     * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
     * @param anchorFromPt If `true`, translate to new position from current position. Default is `false` which update the position from origin (0,0);
     */
    toAngle(radian, magnitude, anchorFromPt = false) {
        let m = (magnitude != undefined) ? magnitude : this.magnitude();
        let change = [Math.cos(radian) * m, Math.sin(radian) * m];
        return (anchorFromPt) ? this.add(change) : this.to(change);
    }
    /**
     * Create an operation using this Pt, passing this Pt into a custom function's first parameter. See the [Op guide](../../guide/Op-0400.html) for details.
     * For example: `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Pt as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    /**
     * Take specific dimensional values from this Pt and create a new Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    $take(axis) {
        let p = [];
        for (let i = 0, len = axis.length; i < len; i++) {
            p.push(this[axis[i]] || 0);
        }
        return new Pt(p);
    }
    /**
     * Concatenate this Pt with addition dimensional values and return as a new Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $concat(...args) {
        return new Pt(this.toArray().concat(Util_1.Util.getArgs(args)));
    }
    /**
     * Add scalar or vector values to this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    add(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.add(this, args[0]) : LinearAlgebra_1.Vec.add(this, Util_1.Util.getArgs(args));
        return this;
    }
    /**
     * Like `add`, but returns result as a new Pt
     */
    $add(...args) { return this.clone().add(...args); }
    /**
     * Subtract scalar or vector values from this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    subtract(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.subtract(this, args[0]) : LinearAlgebra_1.Vec.subtract(this, Util_1.Util.getArgs(args));
        return this;
    }
    /**
     * Like `subtract`, but returns result as a new Pt
     */
    $subtract(...args) { return this.clone().subtract(...args); }
    /**
     * Multiply scalar or vector values (as element-wise) with this Pt.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    multiply(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.multiply(this, args[0]) : LinearAlgebra_1.Vec.multiply(this, Util_1.Util.getArgs(args));
        return this;
    }
    /**
     * Like `multiply`, but returns result as a new Pt
     */
    $multiply(...args) { return this.clone().multiply(...args); }
    /**
     * Divide this Pt over scalar or vector values (as element-wise)
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    divide(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.divide(this, args[0]) : LinearAlgebra_1.Vec.divide(this, Util_1.Util.getArgs(args));
        return this;
    }
    /**
     * Like `divide`, but returns result as a new Pt
     */
    $divide(...args) { return this.clone().divide(...args); }
    /**
     * Get the sqaured distance (magnitude) of this Pt from origin
     */
    magnitudeSq() { return LinearAlgebra_1.Vec.dot(this, this); }
    /**
     * Get the distance (magnitude) of this Pt from origin
     */
    magnitude() { return LinearAlgebra_1.Vec.magnitude(this); }
    /**
     * Convert to a unit vector, which is a normalized vector whose magnitude equals 1.
     * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
     */
    unit(magnitude = undefined) {
        LinearAlgebra_1.Vec.unit(this, magnitude);
        return this;
    }
    /**
     * Get a unit vector from this Pt
     */
    $unit(magnitude = undefined) { return this.clone().unit(magnitude); }
    /**
     * Dot product of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    dot(...args) { return LinearAlgebra_1.Vec.dot(this, Util_1.Util.getArgs(args)); }
    /**
     * 3D Cross product of this Pt and another Pt. Return results as a new Pt.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $cross(...args) { return LinearAlgebra_1.Vec.cross(this, Util_1.Util.getArgs(args)); }
    /**
     * Calculate vector projection of this Pt on another Pt. Returns result as a new Pt.
     * @param p a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $project(p) {
        let m = p.magnitude();
        let a = this.$unit();
        let b = p.$divide(m);
        let dot = a.dot(b);
        return a.multiply(m * dot);
    }
    /**
     * Absolute values for all values in this pt
     */
    abs() {
        LinearAlgebra_1.Vec.abs(this);
        return this;
    }
    /**
     * Get a new Pt with absolute values of this Pt
     */
    $abs() {
        return this.clone().abs();
    }
    /**
     * Floor values for all values in this pt
     */
    floor() {
        LinearAlgebra_1.Vec.floor(this);
        return this;
    }
    /**
     * Get a new Pt with floor values of this Pt
     */
    $floor() {
        return this.clone().floor();
    }
    /**
     * Ceil values for all values in this pt
     */
    ceil() {
        LinearAlgebra_1.Vec.ceil(this);
        return this;
    }
    /**
     * Get a new Pt with ceil values of this Pt
     */
    $ceil() {
        return this.clone().ceil();
    }
    /**
     * Round values for all values in this pt
     */
    round() {
        LinearAlgebra_1.Vec.round(this);
        return this;
    }
    /**
     * Get a new Pt with round values of this Pt
     */
    $round() {
        return this.clone().round();
    }
    /**
     * Find the minimum value across all dimensions in this Pt
     * @returns an object with `value` and `index` which returns the minimum value and its dimensional index
     */
    minValue() {
        return LinearAlgebra_1.Vec.min(this);
    }
    /**
     * Find the maximum value across all dimensions in this Pt
     * @returns an object with `value` and `index` which returns the maximum value and its dimensional index
     */
    maxValue() {
        return LinearAlgebra_1.Vec.max(this);
    }
    /**
     * Get a new Pt that has the minimum dimensional values of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $min(...args) {
        let p = Util_1.Util.getArgs(args);
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.min(this[i], p[i]);
        }
        return m;
    }
    /**
     * Get a new Pt that has the maximum dimensional values of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $max(...args) {
        let p = Util_1.Util.getArgs(args);
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.max(this[i], p[i]);
        }
        return m;
    }
    /**
     * Get angle of this vector from origin
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angle(axis = Util_1.Const.xy) {
        return Math.atan2(this[axis[1]], this[axis[0]]);
    }
    /**
     * Get the angle between this and another Pt
     * @param p the other Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angleBetween(p, axis = Util_1.Const.xy) {
        return Num_1.Geom.boundRadian(this.angle(axis)) - Num_1.Geom.boundRadian(p.angle(axis));
    }
    /**
     * Scale this Pt from origin or from an anchor point
     * @param scale scale ratio
     * @param anchor optional anchor point to scale from
     */
    scale(scale, anchor) {
        Num_1.Geom.scale(this, scale, anchor || Pt.make(this.length, 0));
        return this;
    }
    /**
     * Rotate this Pt from origin or from an anchor point in 2D
     * @param angle rotate angle
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    rotate2D(angle, anchor, axis) {
        Num_1.Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    /**
     * Shear this Pt from origin or from an anchor point in 2D
     * @param shear shearing value which can be a number or an array of 2 numbers
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    shear2D(scale, anchor, axis) {
        Num_1.Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    /**
     * Reflect this Pt along a 2D line
     * @param line a Group of 2 Pts that defines a line for reflection
     * @param axis optional axis such as "yz" to define a 2D plane of reflection
     */
    reflect2D(line, axis) {
        Num_1.Geom.reflect2D(this, line, axis);
        return this;
    }
    /**
     * A string representation of this Pt: "Pt(1, 2, 3)"
     */
    toString() {
        return `Pt(${this.join(", ")})`;
    }
    /**
     * Convert this Pt to a javascript Array
     */
    toArray() {
        return [].slice.call(this);
    }
}
exports.Pt = Pt;
/**
 * A Group is a subclass of Array. It should onnly contain Pt instances. You can think of it as an array of arrays (Float32Arrays to be specific).
 * See [Group guide](../../guide/Group-0300.html) for details
 */
class Group extends Array {
    constructor(...args) {
        super(...args);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    /** The first Pt in this group */
    get p1() { return this[0]; }
    /** The second Pt in this group */
    get p2() { return this[1]; }
    /** The third Pt in this group */
    get p3() { return this[2]; }
    /** The forth Pt in this group */
    get p4() { return this[3]; }
    /** The last Pt in this group */
    get q1() { return this[this.length - 1]; }
    /** The second-last Pt in this group */
    get q2() { return this[this.length - 2]; }
    /** The third-last Pt in this group */
    get q3() { return this[this.length - 3]; }
    /** The forth-last Pt in this group */
    get q4() { return this[this.length - 4]; }
    /**
     * Depp clone this group and its Pts
     */
    clone() {
        let group = new Group();
        for (let i = 0, len = this.length; i < len; i++) {
            group.push(this[i].clone());
        }
        return group;
    }
    /**
     * Convert an array of numeric arrays into a Group of Pts
     * @param list an array of numeric arrays
     * @example `Group.fromArray( [[1,2], [3,4], [5,6]] )`
     */
    static fromArray(list) {
        let g = new Group();
        for (let i = 0, len = list.length; i < len; i++) {
            let p = (list[i] instanceof Pt) ? list[i] : new Pt(list[i]);
            g.push(p);
        }
        return g;
    }
    /**
     * Convert an array of Pts into a Group.
     * @param list an array of Pts
     */
    static fromPtArray(list) {
        return Group.from(list);
    }
    /**
     * Split this Group into an array of sub-groups
     * @param chunkSize number of items per sub-group
     * @param stride forward-steps after each sub-group
     * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
     */
    split(chunkSize, stride, loopBack = false) {
        let sp = Util_1.Util.split(this, chunkSize, stride, loopBack);
        return sp;
    }
    /**
     * Insert a Pt into this group
     * @param pts Another group of Pts
     * @param index the index position to insert into
     */
    insert(pts, index = 0) {
        Group.prototype.splice.apply(this, [index, 0, ...pts]);
        return this;
    }
    /**
     * Like Array's splice function, with support for negative index and a friendlier name.
     * @param index start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
     * @param count number of items to remove
     * @returns The items that are removed.
     */
    remove(index = 0, count = 1) {
        let param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        return Group.prototype.splice.apply(this, param);
    }
    /**
     * Split this group into an array of sub-group segments
     * @param pts_per_segment number of Pts in each segment
     * @param stride forward-step to take
     * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
     */
    segments(pts_per_segment = 2, stride = 1, loopBack = false) {
        return this.split(pts_per_segment, stride, loopBack);
    }
    /**
     * Get all the line segments (ie, edges in a graph) of this group
     */
    lines() { return this.segments(2, 1); }
    /**
     * Find the centroid of this group's Pts, which is the average middle point.
     */
    centroid() {
        return Num_1.Geom.centroid(this);
    }
    /**
     * Find the rectangular bounding box of this group's Pts.
     * @returns a Group of 2 Pts representing the top-left and bottom-right of the rectangle
     */
    boundingBox() {
        return Num_1.Geom.boundingBox(this);
    }
    /**
     * Anchor all the Pts in this Group using a target Pt as origin. (ie, subtract all Pt with the target anchor to get a relative position). All the Pts' values will be updated.
     * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
     */
    anchorTo(ptOrIndex = 0) { Num_1.Geom.anchor(this, ptOrIndex, "to"); }
    /**
     * Anchor all the Pts in this Group by its absolute position from a target Pt. (ie, add all Pt with the target anchor to get an absolute position).  All the Pts' values will be updated.
     * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
     */
    anchorFrom(ptOrIndex = 0) { Num_1.Geom.anchor(this, ptOrIndex, "from"); }
    /**
     * Create an operation using this Group, passing this Group into a custom function's first parameter.  See the [Op guide](../../guide/Op-0400.html) for details.
     * For example: `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Group as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    /**
     * Get an interpolated point on the line segments defined by this Group
     * @param t a value between 0 to 1 usually
     */
    interpolate(t) {
        t = Num_1.Num.clamp(t, 0, 1);
        let chunk = this.length - 1;
        let tc = 1 / (this.length - 1);
        let idx = Math.floor(t / tc);
        return Num_1.Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
    }
    /**
     * Move every Pt's position by a specific amount. Same as `add`.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    moveBy(...args) {
        return this.add(...args);
    }
    /**
     * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    moveTo(...args) {
        let d = new Pt(Util_1.Util.getArgs(args)).subtract(this[0]);
        this.moveBy(d);
        return this;
    }
    /**
     * Scale this group's Pts from an anchor point. Default anchor point is the first Pt in this group.
     * @param scale scale ratio
     * @param anchor optional anchor point to scale from
     */
    scale(scale, anchor) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.scale(this[i], scale, anchor || this[0]);
        }
        return this;
    }
    /**
     * Rotate this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
     * @param angle rotate angle
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    rotate2D(angle, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.rotate2D(this[i], angle, anchor || this[0], axis);
        }
        return this;
    }
    /**
     * Shear this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
     * @param shear shearing value which can be a number or an array of 2 numbers
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    shear2D(scale, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.shear2D(this[i], scale, anchor || this[0], axis);
        }
        return this;
    }
    /**
     * Reflect this group's Pts along a 2D line. Default anchor point is the first Pt in this group.
     * @param line a Group of 2 Pts that defines a line for reflection
     * @param axis optional axis such as "yz" to define a 2D plane of reflection
     */
    reflect2D(line, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.reflect2D(this[i], line, axis);
        }
        return this;
    }
    /**
     * Sort this group's Pts by values in a specific dimension
     * @param dim dimensional index
     * @param desc if true, sort descending. Default is false (ascending)
     */
    sortByDimension(dim, desc = false) {
        return this.sort((a, b) => (desc) ? b[dim] - a[dim] : a[dim] - b[dim]);
    }
    /**
     * Update each Pt in this Group with a Pt function
     * @param ptFn string name of an existing Pt function. Note that the function must return Pt.
     * @param args arguments for the function specified in ptFn
     */
    forEachPt(ptFn, ...args) {
        if (!this[0][ptFn]) {
            Util_1.Util.warn(`${ptFn} is not a function of Pt`);
            return this;
        }
        for (let i = 0, len = this.length; i < len; i++) {
            this[i] = this[i][ptFn](...args);
        }
        return this;
    }
    /**
     * Add scalar or vector values to this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    add(...args) {
        return this.forEachPt("add", ...args);
    }
    /**
     * Subtract scalar or vector values from this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    subtract(...args) {
        return this.forEachPt("subtract", ...args);
    }
    /**
     * Multiply scalar or vector values (as element-wise) with this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    multiply(...args) {
        return this.forEachPt("multiply", ...args);
    }
    /**
     * Divide this group's Pts over scalar or vector values (as element-wise)
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    divide(...args) {
        return this.forEachPt("divide", ...args);
    }
    /**
     * Apply this group as a matrix and calculate matrix addition
     * @param g a scalar number, an array of numeric arrays, or a group of Pt
     * @returns a new Group
     */
    $matrixAdd(g) {
        return LinearAlgebra_1.Mat.add(this, g);
    }
    /**
     * Apply this group as a matrix and calculate matrix multiplication
     * @param g a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
     * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
     * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
     * @returns If not elementwise, this will return a new  Group with M Pt, each with N dimensions (M-rows, N-columns).
     */
    $matrixMultiply(g, transposed = false, elementwise = false) {
        return LinearAlgebra_1.Mat.multiply(this, g, transposed, elementwise);
    }
    /**
     * Zip one slice of an array of Pt. Imagine the Pts are organized in rows, then this function will take the values in a specific column.
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    zipSlice(index, defaultValue = false) {
        return LinearAlgebra_1.Mat.zipSlice(this, index, defaultValue);
    }
    /**
     * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    $zip(defaultValue = undefined, useLongest = false) {
        return LinearAlgebra_1.Mat.zip(this, defaultValue, useLongest);
    }
    /**
     * Get a string representation of this group
     */
    toString() {
        return "Group[ " + this.reduce((p, c) => p + c.toString() + " ", "") + " ]";
    }
}
exports.Group = Group;
//# sourceMappingURL=Pt.js.map