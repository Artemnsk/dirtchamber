/**
 * Player constructor.
 * @param x
 * @param y
 * @constructor
 */
var Player = function (nickname, color, algorithm) {
    this.nickname = nickname;
    this.color = color;
    // TODO:
    this.algorithm = function (microbe) {
        // TODO:
        microbe.move();
        microbe.eat();
        microbe.reproduce();
        microbe.die();
    };
};