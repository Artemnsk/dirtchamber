/**
 * Helper function which returns random number from range.
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

var startGame = function () {
    algorithm1 = new Function("messages", "my_x", "my_y", "my_hitpoints", "my_inner_info", "microbe_move", "microbe_reproduce", "microbe_yell", "microbe_set_inner_info", $('#player1 *[name="algorithm"]').val());
    algorithm2 = new Function("messages", "my_x", "my_y", "my_hitpoints", "my_inner_info", "microbe_move", "microbe_reproduce", "microbe_yell", "microbe_set_inner_info", $('#player2 *[name="algorithm"]').val());
    var player1 = new Player($('#player1 *[name="nickname"]').val(), $('#player1 *[name="color"]').val(), algorithm1);
    var player2 = new Player($('#player2 *[name="nickname"]').val(), $('#player2 *[name="color"]').val(), algorithm2);
    var players = [player1, player2];
    var game_configs = {
        'max_steps': 9999999999,
        'microbes_starting_population': 1,
        'food_starting_population': 200,
    };
    var env_configs = {
        'maxX': 200,
        'maxY': 200,
        'minX': 0,
        'minY': 0,
        'population_limit': 500,
        'draw_scale': 3,
        'hitpoints_per_food': 1000,
        'message_radius': 2,
    };
    var game = new Game(players, game_configs, env_configs);
    game.settle();
    setInterval(function() {
        if (!game.processEnd()) {
            // TODO: do it without env middleware?
            game.env.step();
            game.env.draw();
        }
    }, 41);
};





// Create players.
var algorithm1 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell, microbe_set_inner_info) {
    // 1. Parse message.
    var found_food = false;
    for (var i = 0; i < messages.length; i++) {
        try {
            var data = JSON.parse(messages[i].text);
            if (data.type === 'food') {
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
        microbe_move(move_x, move_y);
    }
    if (Math.random() <= 0.005) {
        microbe_reproduce();
    }
    // That's how microbe can give message to teammate microbes in radius=2 in any text format.
    // microbe_yell('asd');
};
var algorithm2 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell, microbe_set_inner_info) {
    var move_x = randomNumberFromRange(-1, 2);
    var move_y = randomNumberFromRange(-1, 2);
    microbe_move(move_x, move_y);
    if (Math.random() <= 0.005) {
        microbe_reproduce();
    }
};