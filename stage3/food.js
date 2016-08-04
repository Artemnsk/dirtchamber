/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Food = function(x, y, env, strategy) {
    this.x = x;
    this.y = y;
    this.env = env;
    this.height = 10;

    if (typeof strategy == 'undefined') {
        strategy = {
            type: 'random',
            data: {
                startingPopulation: FOOD_STARTING_POPULATION
            }
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
            if (!Array.isArray(this.env.food)) {
                this.env.food = [];
            }
            this.env.food.push(this);
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
 * Main food method which calculates a step of Food's life.
 */
Food.prototype.live = function() {
    this.move();
    this.eat();
    this.reproduce();
    this.die();
};

/**
 * Move Food in environment.
 */
Food.prototype.move = function() {

};

Food.prototype.eat = function() {

};

/**
 * Food creates a new one near itself.
 */
Food.prototype.reproduce = function() {
    if (Math.random() <= 0.0005) {
        var x = this.x,
            y = this.y;
        var food = new Food(x, y, this.env, {
            type: 'direct'
        });
        this.env.env[x][y].push(food);
        this.env.food.push(food);
    }
};

/**
 * Microbe dies and removed from the environment.
 */
Food.prototype.die = function() {
    if (this.height <= 0) {
        var index = this.env.food.indexOf(this);
        this.env.food.splice(index, 1);
        index = this.env.env[this.x][this.y].indexOf(this);
        this.env.env[this.x][this.y].splice(index, 1);
        // Clean up env array.
        this.env.cleanupEnv(this.x, this.y);
    }
};
