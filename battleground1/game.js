/**
 * Game constructor.
 * @param env
 * @constructor
 */
var Game = function (env, max_steps) {
    // Set env.
    this.env = env;
    this.status = 'prepare';
    if (max_steps == undefined) {
        this.max_steps = Math.POSITIVE_INFINITY;
    }
    this.winner = null;
};

/**
 * Initialize game.
 */
Game.prototype.settle = function() {
    // Create players.
    var algorithm1 = function (messages, my_x, my_y, microbe_move, microbe_reproduce, microbe_yell) {
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
            microbe_move(move_x, move_y);
        }
        // FIXME: move once per step!!!
        microbe_reproduce();
        //microbe_yell('asd');
    };
    var algorithm2 = function (messages, my_x, my_y, microbe_move, microbe_reproduce, microbe_yell) {
        var move_x = randomNumberFromRange(-1, 2);
        var move_y = randomNumberFromRange(-1, 2);
        microbe_move(move_x, move_y);
        // FIXME: move once per step!!!
        microbe_reproduce();
    };
    var player1 = new Player('player 1', 'red', algorithm1);
    var player2 = new Player('player 2', 'blue', algorithm2);
    // Create microbes for these players.
    for (var i = 0; i < MICROBS_STARTING_POPULATION; i++) {
        var current_player = (i % 2 == 0) ? player1 : player2;
        new Microbe(null, null, this.env, {type: 'random'}, null, current_player);
    }
    for (var i = 0; i < FOOD_STARTING_POPULATION; i++) {
        new Food(null, null, this.env, {type: 'random'});
    }
};

/**
 * If game should be ended or not.
 * Returns true if game ends.
 */
Game.prototype.processEnd = function() {
    if (this.status == 'results') {
        return true;
    }
    if (this.status == 'ended') {
        this.endGame();
        this.status = 'results';
        return true;
    }
    // 0. Nobody wins.
    if (this.env.microbes.length == 0) {
        this.winner = null;
        this.status = 'ended';
        return true;
    }
    // 1. Only one player left.
    var only_one_player_left = true;
    var current_player = null;
    for (var i = 0; i < this.env.microbes.length; i++) {
        // First step - just set player.
        if (current_player === null) {
            current_player = this.env.microbes[i].player;

        }
        // Proceed until different player detected.
        if (current_player !== this.env.microbes[i].player) {
            only_one_player_left = false;
            break;
        }
    }
    if (only_one_player_left) {
        this.winner = this.env.microbes[0].player;
        this.status = 'ended';
        return true;
    }
    // 2. Maximum steps.
    if (this.env.current_step >= this.max_steps) {
        // Collect different players.
        var players_and_hitpoints = this.getOverallHitpointsByPlayer(this.env.microbes);
        var players = players_and_hitpoints.players;
        var hitpoints = players_and_hitpoints.hitpoints;
        // Players microbe battle.
        if (players.length > 1) {
            // Get index of max element in hitpoints;
            var max_hitpoints_index = 0;
            for (var i = 1; i < hitpoints.length; i++) {
                if (hitpoints[i] > hitpoints[max_hitpoints_index]) {
                    max_hitpoints_index = i;
                }
            }
            this.winner = players[max_hitpoints_index];
            this.status = 'ended';
            return true;
        }
    }
};

/**
 * Emd game action.
 */
Game.prototype.endGame = function() {
    var text = "";
    if (this.winner != null) {
        text = this.winner.nickname + " wins!";
    } else {
        text = "Game ended in a draw.";
    }
    $("#result").html(text);
};