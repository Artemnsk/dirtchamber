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
    this.algorithm = algorithm || function (messages, my_x, my_y, microbe_move, microbe_reproduce, microbe_yell) {
        // 1. Parse message.
        var found_food = false;
        for (var i = 0; i < messages.length; i++) {
            try {
                var data = JSON.parse(messages[i].text);
                if (data.type == 'food') {
                    // Go to this food.
                    microbe_move(data.x - my_x, data.y - my_y);
                    found_food = true;
                    break;
                }
            } catch (e) {}
        }
        if (!found_food) {
            var move_x = randomNumberFromRange(-1, 2);
            var move_y = randomNumberFromRange(-1, 2);
            microbe_move(move_x, move_y);
        }
        // FIXME: move once per step!!!
        microbe_reproduce();
        microbe_yell(that.nickname);
    };
};