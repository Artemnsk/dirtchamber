/**
 * Game constructor.
 * @param env
 * @constructor
 */
var Game = function (env, players, max_steps) {
    // TODO: configs.
    // TODO: bypass these settings into env?
    // TODO: initialize env here?
    this.microbes_starting_population = 1;
    this.population_limit = 2000;
    this.food_starting_population = 200;
    this.env = env;
    this.players = players;
    this.status = 'prepare';
    if (max_steps == undefined) {
        this.max_steps = 999999999999;
    }
    this.winner = null;
};

/**
 * Initialize game.
 */
Game.prototype.settle = function() {
    randomSettle.call(this);
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



/*************************************************************
 * Help functions.
 *************************************************************/
/**
 * Randomly places player microbes.
 */
var randomSettle = function () {
    // Start coords depends on player quantity.
    // TODO: depends on map size.
    var coords = [];
    switch (this.players.length) {
        default:
        case 2:
            coords = [
                {
                    'x': this.env.minX,
                    'y': Math.round(this.env.maxY/2)
                }, {
                    'x': this.env.maxX,
                    'y': Math.round(this.env.maxY/2)
                }
            ];
            break;
    }
    for (var p = 0; p < this.players.length; p++) {
        new Microbe(coords[p].x, coords[p].y, this.env, {type: 'direct'}, 9999999, this.players[p]);
    }
    for (var i = 0; i < this.food_starting_population; i++) {
        new Food(null, null, this.env, {type: 'random'});
    }
};