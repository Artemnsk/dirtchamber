const MICROBS_STARTING_POPULATION = 2000;
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
    // TODO: where is env.microbes array?? It seems it being used somewhere to store all active microbes but there is no such array in this constructor.
    this.env = [];
    this.foodLayer = [];

    this.messages = [];
    this.messageLayer = [];
};

/**
 * Populate environment with microbes.
 * @param strategy
 */
Environment.prototype.settle = function (strategy) {
    // Create players.
    var player1 = new Player('player 1', 'red', function (microbe) {});
    var player2 = new Player('player 2', 'blue', function (microbe) {});
    // Create microbes for these players.
    for (var i = 0; i < MICROBS_STARTING_POPULATION; i++) {
        var current_player = (i % 2 == 0) ? player1 : player2;
        new Microbe(null, null, this, {type: 'random'}, null, current_player);
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
            // TODO: maybe all layer elements should implement interface 'drawable'?
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
    // TODO: seems like here we should make full environment snapshot and provide microbes with it to force them make decisions
    // TODO: basing on old position. Such way they always act "simultaneously".
    for (var index in this.microbes) {
        this.microbes[index].live();
    }
    for (var index in this.food) {
        this.food[index].live();
    }
    // TODO: Then we should "process" environment: like 'did somebody being eat?' and so on.
    // TODO: when we clear messageLayer that's simply enough to delete each message obj in env.messages array. Check it.
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
