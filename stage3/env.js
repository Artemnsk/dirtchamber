const MICROBS_STARTING_POPULATION = 10000;
const FOOD_STARTING_POPULATION = 1000;

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
};

/**
 * Populate environment with microbes.
 * @param strategy
 */
Environment.prototype.settle = function (strategy) {
    for (var i = 0; i < MICROBS_STARTING_POPULATION; i++) {
        new Microbe(null, null, this, {type: 'random'});
    }
    for (var i = 0; i < FOOD_STARTING_POPULATION; i++) {
        new Food(null, null, this, {type: 'random'});
    }
};

/**
 * Draw environment.
 */
Environment.prototype.draw = function() {
    var c = document.getElementById("Area");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    var scale = 2;
    ctx.clearRect(0, 0, this.maxX * scale, this.maxY * scale);
    for (var x in this.env) {
        for (var y in this.env[x]) {
            // Since we delete any empty array in env we can safely assume that we've got at this x and y a microbe.
            ctx.fillRect(x * scale, y * scale, scale, scale);
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

/**
 * Clean up env array at position (x,y).
 * @param x
 * @param y
 */
Environment.prototype.cleanupEnv = function(x, y) {
    if (!this.env[x][y].length) {
        delete this.env[x][y];
        if (!this.env[x].length) {
            delete this.env[x];
        }
    }
};