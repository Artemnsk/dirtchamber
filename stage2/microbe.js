/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Microbe = function(x, y, env) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.env = env;
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
    for (var index in this.env.env[this.x][this.y]) {
        if (this === this.env.env[this.x][this.y][index]) {
            this.env.env[this.x][this.y].splice(index, 1);
            if (this.env.env[this.x][this.y].length === 0) {
                delete this.env.env[this.x][this.y];
                if (this.env.env[this.x].length === 0) {
                    delete this.env.env[this.x];
                }
            }
            break;
        }
    }

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


Microbe.prototype.reproduce = function() {
    var probability_of_death = Math.random();
    if (probability_of_death <= 0.005) {
        var microbe = new Microbe(this.x, this.y, this.env);
        this.env.env[this.x][this.y].push(microbe);
        this.env.microbes.push(microbe);
    }
};

Microbe.prototype.die = function() {
    var probability_of_death = Math.random();
    if (probability_of_death <= 0.005) {
        for (var index in this.env.env[this.x][this.y]) {
            if (this === this.env.env[this.x][this.y][index]) {
                this.env.env[this.x][this.y].splice(index, 1);

            }
        }
        for (index in this.env.microbes) {
            if (this === this.env.microbes[index]) {
                this.env.microbes.splice(index, 1);
            }
        }
    }
};
