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
            break;
    }
    if (!Array.isArray(this.env.food)) {
        this.env.food = [];
    }
    this.env.food.push(this);
    if (!Array.isArray(this.env.foodLayer[this.x])) {
        this.env.foodLayer[this.x] = [];
    }
    if (!Array.isArray(this.env.foodLayer[this.x][this.y])) {
        this.env.foodLayer[this.x][this.y] = [];
    }
    this.env.foodLayer[this.x][this.y].push(this);
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
Food.prototype.reproduce = reproduceAndPlaceNearRandomly;

function reproduceAndUderYouself () {
    if (Math.random() <= 0.005) {
        var x = this.x,
            y = this.y;

        var food = new Food(x, y, this.env, {
            type: 'direct'
        });
        this.env.foodLayer[x][y].push(food);
        this.env.food.push(food);
    }
};

/**
 * Food dies and removed from the environment.
 */
Food.prototype.die = function() {
    if (this.height <= 0) {
        var index = this.env.food.indexOf(this);
        this.env.food.splice(index, 1);
        index = this.env.foodLayer[this.x][this.y].indexOf(this);
        this.env.foodLayer[this.x][this.y].splice(index, 1);
        // Clean up env array.
        this.env.cleanupFoodLayer(this.x, this.y);
    }
};

//======== strateges =========
function reproduceAndPlaceNearRandomly() {
    if (Math.random() <= 0.0005) {
        //@TODO Check for map boundaries
        var possiblePlacements = [];
        var variants = [-1, 0, 1];
        for (var x in variants)
            for (var y in variants)
            if(x != 1 && y != 1)
            // holy Indian cows!
                if (typeof this.env.foodLayer[this.x + variants[x]][this.y + variants[y]] === 'undefined'
                 && this.env.foodLayer[this.x + variants[x]][this.y + variants[y]].length <= 0)
                    possiblePlacements.push({
                        x: this.x + variants[x],
                        y: this.y + variants[y]
                    });
        var choosenPlacementID = randomNumberFromRange(0, possiblePlacements.length - 1);

        var food = new Food(possiblePlacements[choosenPlacementID].x, possiblePlacements[choosenPlacementID].y, this.env, {
            type: 'direct'
        });
        this.env.foodLayer[choosenPlacement.x][choosenPlacement.y].push(food);
        this.env.food.push(food);
    }
}
