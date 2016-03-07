/**
 * Environment constructor.
 * @param x
 * @param y
 * @constructor
 */
var Environment = function (x, y) {
    // Initialize world boundaries.
    this.minX = 0;
    this.minY = 0;
    if (typeof x == 'undefined') {
        x = 500;
    }
    this.maxX = x;
    if (typeof y == 'undefined') {
        y = 400;
    }
    this.maxY = y;
    // Initialize environment array.
    this.env = [];
    //for (var _x = 0; _x < x; _x++) {
    //    this.env[_x] = [];
    //    for (var _y = 0; _y < y; _y++) {
    //        this.env[_x][_y] = null;
    //    }
    //}
};

/**
 * Populate environment with microbes.
 * @param strategy
 */
Environment.prototype.settle = function (strategy) {
    if (typeof strategy == 'undefined') {
        strategy = {
            type: 'random',
            data: {startingPopulation: 10000}
        }
    }

    switch (strategy.type) {
        case 'random':
        default:
            this.microbes = new Array();
            for (var i = 0; i < strategy.data.startingPopulation; i++) {
                var x = randomNumberFromRange(this.minX, this.maxX);
                var y = randomNumberFromRange(this.minY, this.maxY);
                var microbe = new Microbe(x, y, this);
                this.microbes.push(microbe);
                if (!Array.isArray(this.env[microbe.x])) {
                    this.env[microbe.x] = [];
                }
                if (!Array.isArray(this.env[microbe.x][microbe.y])) {
                    this.env[microbe.x][microbe.y] = [];
                }
                this.env[microbe.x][microbe.y].push(microbe);
            }
            break;
    }
};

/**
 * Draw environment.
 */
Environment.prototype.draw = function() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    var scale = 2;
    ctx.clearRect(0, 0, this.maxX * scale, this.maxY * scale);
    for (var x in this.env) {
        for (var y in this.env[x]) {
            for (var index in this.env[x][y]) {
                ctx.fillRect(x * scale, y * scale, scale, scale);
                break;
            }
        }
    }
};

/**
 * Process a step in environment.
 */
Environment.prototype.step = function() {
    for (var index in this.microbes) {
        this.microbes[index].live();
    }
};
