const MICROBS_STARTING_POPULATION = 100;
const DEATH_PROBABILITY = 0.005;
const BIRTH_PROBABILITY = 0.005;
const MICROBE_STARTING_HITPOINTS = 2000;

const FOOD_STARTING_POPULATION = 200;
const FOOD_REPRODUCTION_PROBABILITY = 0.005

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
        x = 400;
    }
    this.maxX = x;
    if (typeof y == 'undefined') {
        y = 400;
    }
    this.maxY = y;

    // Initialize environment array.
    this.env = [];
    this.foodLayer = [];
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

    var scale = 2;
    ctx.clearRect(0, 0, this.maxX * scale, this.maxY * scale);
    for (var x in this.foodLayer)
        for (var y in this.foodLayer[x]) {
            ctx.fillStyle = "#08685E";
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    for (var x in this.env) {
        for (var y in this.env[x]) {
            ctx.fillStyle = "#FF0000";
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
    for (var index in this.food) {
        this.food[index].live();
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

Environment.prototype.cleanupFoodLayer = function(x, y) {
    if (!this.foodLayer[x][y].length) {
        delete this.foodLayer[x][y];
        if (!this.foodLayer[x].length) {
            delete this.foodLayer[x];
        }
    }
};
