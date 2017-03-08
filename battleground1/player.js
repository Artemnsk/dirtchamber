/**
 * Player constructor.
 * @param x
 * @param y
 * @constructor
 */
var Player = function (nickname, color, algorithm) {
    this.nickname = nickname;
    this.color = color;
    var that = this;
    // TODO:
    this.algorithm = function (messages, my_x, my_y, microbe_move, microbe_eat, microbe_reproduce, microbe_yell) {
        // TODO:
        var move_x = randomNumberFromRange(-1, 2);
        var move_y = randomNumberFromRange(-1, 2);
        microbe_move(move_x, move_y);
        microbe_eat();
        microbe_reproduce();
        microbe_yell(that.nickname);
    };
};