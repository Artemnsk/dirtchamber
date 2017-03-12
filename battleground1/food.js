/**
 * Food constructor.
 * @param x
 * @param y
 * @param env
 * @param strategy
 * @constructor
 */
var Food = function(x, y, env, strategy) {
    this.x = x;
    this.y = y;
    this.env = env;
    this.height = 10;
    this.x = x;
    this.y = y;
    this.env.env[this.x][this.y].food.push(this);
    this.env.food.push(this);
};

/**
 * Main food method which calculates a step of Food's life.
 */
Food.prototype.live = function() {
    this.reproduce();
};

/**
 * Provide environment with info about this object.
 */
Food.prototype.giveEnvironmentInfo = function() {
    var text = {
        'x': this.x,
        'y': this.y,
        'type': 'food',
        'height': this.height
    };
    return JSON.stringify(text);
};

Food.prototype.reproduce = noReproduction;

//======== Reproduction strateges =========

/**
 * No reproduction.
 */
function noReproduction() {

}

/**
 * Food creates a new one near itself.
 */
function reproduceAndPlaceNearRandomly() {
    if (Math.random() <= 0.005/*FOOD_REPRODUCTION_PROBABILITY*/) {
        var possiblePlacements = [];
        var vars = [-1, 0, 1];
        for (var x in vars) {
            for (var y in vars) {
                if (!(x === 1 && y === 1)) {
                    //if ( x != 1 && y != 1) - try it - it's funny!
                    // checking if that cell is null (or undefined). Should we check if it is empty?
                    if (this.env.env[this.x][this.y].microbes.length === 0) {
                        if ((this.x + vars[x] >= 0 && this.x + vars[x] < this.env.configs.maxX) &&
                            (this.y + vars[y] >= 0 && this.y + vars[y] < this.env.configs.maxY)) {
                            possiblePlacements.push({
                                x: this.x + vars[x],
                                y: this.y + vars[y]
                            });
                        }
                    }
                }
            }
        }

        if (possiblePlacements.length > 0) {
            var choosenPlacement = possiblePlacements[randomNumberFromRange(0, possiblePlacements.length - 1)];

            var food = new Food(choosenPlacement.x, choosenPlacement.y, this.env, {
                type: 'direct'
            });
            this.env.env[choosenPlacement.x][choosenPlacement.y].food.push(food);
            this.env.food.push(food);
        }
    }
}

function reproduceUderYouself () {
    if (Math.random() <= 0.005/*FOOD_REPRODUCTION_PROBABILITY*/) {
        var x = this.x,
            y = this.y;

        var food = new Food(x, y, this.env, {
            type: 'direct'
        });
        this.env.env[x][y].food.push(food);
        this.env.food.push(food);
    }
}
