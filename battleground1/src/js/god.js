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
    if (typeof game != 'undefined') {
        stopGame();
    }
    $("#result").html('');

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
    game = new Game(players, game_configs, env_configs);
    game.settle();
    setInterval(function() {
        if (!game.processEnd()) {
            // TODO: do it without env middleware?
            game.env.step();
            game.env.draw();
        }
    }, 41);
};


var stopGame = function () {
    game.status = 'ended';
    game.processEnd();
    delete game;
    //not sure if we must clear the canvas or not
    var canvas = document.getElementById("Area");
    canvas.width = canvas.width;
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

var algorithm3 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell, microbe_set_inner_info) {
    var on_food = false;
    for (var i = 0; i < messages.length; i++) {
        try {
            var data = JSON.parse(messages[i].text);
            if (data.type == 'food') {
                if(data.x == my_x && data.y == my_y) {
                    on_food = true;
                }
                break;
            }
        } catch (e) {}
    }
    if (!on_food) {
        // We can proceed with our tactic.
        // First step.
        if (my_inner_info == '') {
            // Initial inner_info.
            my_inner_info = 'init';
        }
        switch (my_inner_info) {
            case 'init':
                // We will move top.
                microbe_set_inner_info('move_top');
                // Reproduce new microbe.
                microbe_reproduce({'inner_info': 'move_bottom'});
                break;
            case 'move_top':
                // TODO: provide with map size somehow?
                if (my_y == 200 - 1) {
                    microbe_set_inner_info('move_right');
                } else {
                    microbe_reproduce({'inner_info': 'move_right', 'hitpoints': 42*200*2});
                    microbe_move(0, 1);
                }
                break;
            case 'move_bottom':
                if (my_y == 0) {
                    microbe_set_inner_info('move_right');
                } else {
                    microbe_reproduce({'inner_info': 'move_right', 'hitpoints': 42*200*2});
                    microbe_move(0, -1);
                }
                break;
            case 'move_right':
                if (my_x == 200 - 1) {
                    if (my_y < 90 || my_y > 110) {
                        microbe_set_inner_info('diagonal');
                    } else {
                        microbe_set_inner_info('random');
                    }
                } else {
                    microbe_move(1, 0);
                }
                break;
            case 'diagonal':
                if (my_x > 100 && Math.abs(100 - my_y) != 0) {
                    microbe_move(-1, 1*Math.sign(100 - my_y));
                } else {
                    microbe_set_inner_info('move_right');
                }
            case 'random':
            default:
                var move_x = randomNumberFromRange(-1, 2);
                var move_y = randomNumberFromRange(-1, 2);
                microbe_move(move_x, move_y);
                microbe_move(move_x, move_y);
                break;
        }
    }
};