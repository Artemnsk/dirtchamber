/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Food = function(x, y, env) {
    this.x = x;
    this.y = y;
    this.env = env;
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

};

/**
 * Microbe dies and removed from the environment.
 */
Food.prototype.die = function() {

};