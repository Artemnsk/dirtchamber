const DEATH_PROBABILITY = 0.005;
const BIRTH_PROBABILITY = 0.005;

/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Microbe = function (x, y, env, strategy) {
    this.env = env;
    this.speed = 1;

    if (typeof strategy == 'undefined') {
        strategy = {
            type: 'random',
            data: {startingPopulation: STARTING_POPULATION}
        }
    }

    switch (strategy.type) {
        case 'direct':
            this.x = x;
            this.y = y;
            break;
        case 'random':
        default:
            this.x = randomNumberFromRange(this.env.minX, this.env.maxX);
            this.y = randomNumberFromRange(this.env.minY, this.env.maxY);
            if (!Array.isArray(this.env.microbes)) {
                this.env.microbes = [];
            }
            this.env.microbes.push(this);
            if (!Array.isArray(this.env.env[this.x])) {
                this.env.env[this.x] = [];
            }
            if (!Array.isArray(this.env.env[this.x][this.y])) {
                this.env.env[this.x][this.y] = [];
            }
            this.env.env[this.x][this.y].push(this);
            break;
    }
};

/**
 * Main microbe method which calculates a step of microbe's life.
 */
Microbe.prototype.live = function() {
    this.move();
    this.eat();
    this.reproduce();
    this.die();
};

/**
 * Move microbe in environment.
 */
Microbe.prototype.move = function() {
    // Pop the microbe from its environment cell.
    var index = this.env.env[this.x][this.y].indexOf(this);
    this.env.env[this.x][this.y].splice(index, 1);
    // Clean up env array.
    this.env.cleanupEnv(this.x, this.y);

    // Move microbe.
    var direction = {
        x : randomNumberFromRange(-1, 2), // -1, 0 or 1.
        y : randomNumberFromRange(-1, 2) // -1, 0 or 1.
    };
    this.x += this.speed * direction.x;
    this.y += this.speed * direction.y;
    // Check for out of bounds scenario.
    if (this.x < this.env.minX) {
        this.x = this.env.minX;
    }
    else if (this.x >= this.env.maxX) {
        this.x = this.env.maxX - 1;
    }
    if (this.y < this.env.minY) {
        this.y = this.env.minY;
    }
    else if (this.y >= this.env.maxY) {
        this.y = this.env.maxY - 1;
    }

    // Put the microbe into the environment cell.
    if (!Array.isArray(this.env.env[this.x])) {
        this.env.env[this.x] = [];
    }
    if (!Array.isArray(this.env.env[this.x][this.y])) {
        this.env.env[this.x][this.y] = [];
    }
    this.env.env[this.x][this.y].push(this);
};

Microbe.prototype.eat = function() {

};

/**
 * Microbe creates a new one at the same position as itself.
 */
Microbe.prototype.reproduce = function() {
    if (Math.random() <= BIRTH_PROBABILITY) {
        var microbe = new Microbe(this.x, this.y, this.env, {type:'direct'});
        this.env.env[this.x][this.y].push(microbe);
        this.env.microbes.push(microbe);
    }
};

/**
 * Microbe dies and removed from the environment.
 */
Microbe.prototype.die = function() {
    if (Math.random() <= DEATH_PROBABILITY) {
        var index = this.env.microbes.indexOf(this);
        this.env.microbes.splice(index, 1);
        index = this.env.env[this.x][this.y].indexOf(this);
        this.env.env[this.x][this.y].splice(index, 1);
        // Clean up env array.
        this.env.cleanupEnv(this.x, this.y);
    }
};
