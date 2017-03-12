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
        }
        // FIXME: move once per step!!!
        microbe_reproduce();
        microbe_yell(that.nickname);
    };
};
/**
 * Message constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Message = function (text, x, y, env, player) {
    // Message source. Could be null.
    this.x = x;
    this.y = y;
    // Message could belong to some player.
    this.player = player;
    this.step = env.current_step;
    this.text = text;
};

/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Microbe = function (x, y, env, hitpoints, player) {
    this.player = player;
    this.env = env;
    this.speed = 1;
    this.hitpoints = hitpoints;
    this.x = x;
    this.y = y;
    this.env.microbes.push(this);
    this.env.env[this.x][this.y].microbes.push(this);
};

/**
 * Main microbe method which calculates a step of microbe's life.
 */
Microbe.prototype.live = function() {
    if (this.player && this.player instanceof Player) {
        var that = this;
        // Secure operation to not allow player use the entire microbe object in algorithm.
        var already_moved = false;
        var microbe_move = function (move_x, move_y) {
            if (already_moved === false) {
                already_moved = true;
                that.move(move_x, move_y);
            } else {
                //console.log(that.player.nickname + ': Move already being used on this step.')
            }
        };
        var already_reproduce_requested = false;
        var microbe_reproduce_request = function () {
            if (already_reproduce_requested === false) {
                already_reproduce_requested = true;
                that.reproduce_request();
            } else {
                //console.log(that.player.nickname + ': Reproduce request already being used on this step.')
            }
        };
        var already_yelled = false;
        var microbe_yell = function (text) {
            if (already_yelled === false) {
                already_yelled = true;
                that.yell(text);
            } else {
                //console.log(that.player.nickname + ': Yell already being used on this step.')
            }
        };
        // Get messages.
        var messages = this.env.getMessages(this.x, this.y);
        this.player.algorithm.call(null, messages, this.x, this.y, this.hitpoints, microbe_move, microbe_reproduce_request, microbe_yell);
    }
};

/**
 * Move microbe in environment.
 */
Microbe.prototype.move = function(move_x, move_y) {
    // Convert non-number values into zero.
    if (!$.isNumeric(move_x)) {
        move_x = 0;
    }
    if (!$.isNumeric(move_y)) {
        move_y = 0;
    }
    // Round values if non-integers being provided.
    move_x = Math.round(move_x);
    move_y = Math.round(move_y);
    // Check if are going to move.
    if (move_x === 0 && move_y === 0) {
        return;
    }
    // Normalisation.
    if (Math.abs(move_x) > 1) {
        move_x = Math.sign(move_x);
    }
    if (Math.abs(move_y) > 1) {
        move_y = Math.sign(move_y);
    }
    // Pop the microbe from its environment cell.
    var index = this.env.env[this.x][this.y].microbes.indexOf(this);
    this.env.env[this.x][this.y].microbes.splice(index, 1);

    // Move microbe.
    this.x += this.speed * move_x;
    this.y += this.speed * move_y;
    // Check for out of bounds scenario.
    if (this.x < this.env.configs.minX) {
        this.x = this.env.configs.minX;
    }
    else if (this.x >= this.env.configs.maxX) {
        this.x = this.env.configs.maxX - 1;
    }
    if (this.y < this.env.configs.minY) {
        this.y = this.env.configs.minY;
    }
    else if (this.y >= this.env.configs.maxY) {
        this.y = this.env.configs.maxY - 1;
    }

    // Put the microbe into the environment cell.
    this.env.env[this.x][this.y].microbes.push(this);
};

/**
 * Microbe 'asks' environment to reproduce himself.
 * In fact that happens after all microbes 'live' to not let players abuse continuous microbes creation.
 */
Microbe.prototype.reproduce_request = function() {
    if (this.env.microbes_to_reproduce.indexOf(this) === -1) {
        this.env.microbes_to_reproduce.push(this);
    }
};

/**
 * Microbe creates a new one at the same position as itself.
 */
Microbe.prototype.reproduce = function() {
    if (this.env.getMicrobesQuantityByPlayer(this.player, this.env.microbes) <= this.env.configs.population_limit) {
        this.hitpoints = Math.round(this.hitpoints / 2);
        new Microbe(this.x, this.y, this.env, this.hitpoints, this.player);
    }
};

/**
 * Microbe yells some message.
 */
Microbe.prototype.yell = function(text) {
    // Create message.
    var message = new Message(text, this.x, this.y, this.env, this.player);
    this.env.messages.push(message);
    this.env.env[this.x][this.y].messages.push(message);
};

/**
 * Provide environment with info about this object.
 */
Microbe.prototype.giveEnvironmentInfo = function() {
    var text = {
        'x': this.x,
        'y': this.y,
        'player': this.player.nickname,
        'type': 'microbe',
        'hitpoints': this.hitpoints
    };
    return JSON.stringify(text);
};

/**
 * Food constructor.
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
        if(possiblePlacements.length > 0){
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

/**
 * Game constructor.
 * @param players
 * @param game_configs
 *  {
        'max_steps': 9999999999,
        'microbes_starting_population': 1,
        'food_starting_population': 200,
    };
 @param env_configs
    see Environment configs.
 */
var Game = function (players, game_configs, env_configs) {
    this.configs = game_configs;
    this.env = new Environment(env_configs);
    this.players = players;
    this.status = 'prepare';
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
    if (this.status === 'results') {
        return true;
    }
    if (this.status === 'ended') {
        this.endGame();
        this.status = 'results';
        return true;
    }
    // 0. Nobody wins.
    if (this.env.microbes.length === 0) {
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
    if (this.env.current_step >= this.configs.max_steps) {
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
    if (this.winner !== null) {
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
                    'x': this.env.configs.minX,
                    'y': Math.round(this.env.configs.maxY/2)
                }, {
                    'x': this.env.configs.maxX,
                    'y': Math.round(this.env.configs.maxY/2)
                }
            ];
            break;
    }
    for (var i = 0; i < this.configs.microbes_starting_population; i++) {
        for (var p = 0; p < this.players.length; p++) {
            new Microbe(coords[p].x, coords[p].y, this.env, 9999999, this.players[p]);
        }
        for (var f = 0; f < this.configs.food_starting_population; f++) {
            var x = randomNumberFromRange(this.env.configs.minX, this.env.configs.maxX);
            var y = randomNumberFromRange(this.env.configs.minY, this.env.configs.maxY);
            new Food(x, y, this.env);
        }
    }
};
/**
 * Environment constructor.
 * @param configs
 *  {
        'maxX': 200,
        'maxY': 200,
        'minX': 0,
        'minY': 0,
        'population_limit': 500,
        'draw_scale': 3,
        'hitpoints_per_food': 1000,
        'message_radius': 2,
    };
 * @constructor
 */
var Environment = function (configs) {
    this.configs = configs;
    this.current_step = 0;
    // Reproduce query.
    this.microbes_to_reproduce = [];
    // Initialize environment array.
    this.microbes = [];
    this.messages = [];
    this.food = [];
    this.env = {};
    for (i = this.configs.minX; i <= this.configs.maxX; i++) {
        this.env[i] = {};
        for (j = this.configs.minY; j <= this.configs.maxY; j++) {
            this.env[i][j] = {
                'microbes': [],
                'messages': [],
                'food': []
            };
        }
    }
    // Initialize canvas size.
    var c = document.getElementById("Area");
    var ctx = c.getContext("2d");
    ctx.canvas.height = (this.configs.maxY - this.configs.minY)*this.configs.draw_scale;
    ctx.canvas.width = (this.configs.maxX - this.configs.minX)*this.configs.draw_scale;
};

/**
 * Draw environment.
 */
Environment.prototype.draw = function() {
    var c = document.getElementById("Area");
    var ctx = c.getContext("2d");

    var scale = this.configs.draw_scale;
    ctx.clearRect(0, 0, this.configs.maxX * scale, this.configs.maxY * scale);
    for (var x in this.env) {
        for (var y in this.env[x]) {
            if (this.env[x][y].microbes.length > 0) {
                ctx.fillStyle = this.env[x][y].microbes[0].player.color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
            if (this.env[x][y].food.length > 0) {
                ctx.fillStyle = 'green';
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
};

/**
 * Process a step in environment.
 */
Environment.prototype.step = function() {
    // Generate env messages. Each object on env layer should "introduce" itself.
    this.prepareEnvironmentInfo();
    // .. and only now increase step.
    this.current_step++;
    for (var index in this.microbes) {
        this.microbes[index].live();
    }
    for (var index in this.food) {
        this.food[index].live();
    }
    // Reproduce microbes.
    while (this.microbes_to_reproduce.length > 0) {
        var microbe = this.microbes_to_reproduce[0];
        var index = this.microbes.indexOf(microbe);
        this.microbes_to_reproduce.splice(0, 1);
        // If this microbe found we can proceed.
        // As we processLayerItem later (e.g. kill microbes) we should not have index = -1. But anyway.
        if (index !== -1) {
            this.microbes[index].reproduce();
        } else {
            console.log('Trying to reproduce microbe which doesnt exist any more.');
        }
    }
    // "Process" environment.
    for (var i in this.env) {
        for (var j in this.env[i]) {
            // Process layer item.
            this.processLayerItem(this.env[i][j]);
        }
    }
    // Remove old messages.
    var i = 0;
    while (i < this.messages.length) {
        if (this.messages[i].step < this.current_step) {
            var index = this.env[this.messages[i].x][this.messages[i].y].messages.indexOf(this.messages[i]);
            this.env[this.messages[i].x][this.messages[i].y].messages.splice(index, 1);
            this.messages.splice(i, 1);
        } else {
            // Nothing was deleted, we can proceed to next array element.
            i++;
        }
    }
};

/**
 * Process layer item.
 */
Environment.prototype.processLayerItem = function(item) {
    // Microbe 'battle'.
    if (item.microbes.length > 1) {
        var players_and_hitpoints = this.getOverallHitpointsByPlayer(item.microbes);
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
            var winner = players[max_hitpoints_index];
            // Even if value is the same the winner will be pseudo-random - you never know which microbe goes first in the layer.
            for (var i = 0; i < item.microbes.length; i++) {
                if (item.microbes[i].player !== winner) {
                    // Dying will be calculated further.
                    item.microbes[i].hitpoints = 0;
                }
            }
        }
    }
    // Kill microbes with no hitpoints.
    var i = 0;
    while (i < item.microbes.length) {
        // Decrease hitpoints at first.
        item.microbes[i].hitpoints -= 41;
        if (item.microbes[i].hitpoints <= 0) {
            var index = this.microbes.indexOf(item.microbes[i]);
            this.microbes.splice(index, 1);
            item.microbes.splice(i, 1);
        } else {
            // We can proceed to the next element in array.
            i++;
        }
    }
    // Eat. That's better to do it after battle and dying to not resurrect dead microbe.
    // That's easy. Each microbe which stays on food can eat it.
    if (item.food.length > 0 && item.microbes.length > 0) {
        // Each microbe eats the first available food.
        for (var i = 0; i < item.microbes.length; i++) {
            for (var j = 0; j < item.food.length; j++) {
                if (item.food[j].height <= 0) {
                    // Do not feed from empty food.
                    continue;
                } else {
                    // Feed. We will delete eaten food later.
                    item.food[j].height--;
                    item.microbes[i].hitpoints += Math.round(this.configs.hitpoints_per_food);
                }
            }
        }
    }
    // Food dies.
    var i = 0;
    while (i < item.food.length) {
        if (item.food[i].height <= 0) {
            var index = this.food.indexOf(item.food[i]);
            this.food.splice(index, 1);
            item.food.splice(i, 1);
        } else {
            // Proceed to next food element in array.
            i++;
        }
    }
};

/**
 * Returns messages array which available in (x, y) position.
 * @param x
 * @param y
 */
Environment.prototype.getMessages = function (x, y) {
    var response = [];
    for (var i = x - this.configs.message_radius; i <= x + this.configs.message_radius; i++) {
        if ((this.configs.minX <= i) && (i <= this.configs.maxX)) {
            for (var j = y - this.configs.message_radius; j <= y + this.configs.message_radius; j++) {
                if ((this.configs.minY <= j) && (j <= this.configs.maxY)) {
                    for (var index = 0; index < this.env[i][j].messages.length; index++) {
                        // If message was not created on current step.
                        if (this.env[i][j].messages[index].step < this.current_step) {
                            if (response.indexOf(this.env[i][j].messages[index]) === -1) {
                                response.push(this.env[i][j].messages[index]);
                            }
                        }
                    }
                }
            }
        }
    }
    return response;
};

/**
 * Asks for each object in environment and puts it's info message into appropriate place.
 */
Environment.prototype.prepareEnvironmentInfo = function () {
    for (var i = this.configs.minX; i <= this.configs.maxX; i++) {
        for (var j = this.configs.minY; j <= this.configs.maxY; j++) {
            // Microbes general info.
            for (var k = 0; k < this.env[i][j].microbes.length; k++) {
                var message = new Message(this.env[i][j].microbes[k].giveEnvironmentInfo(), i, j, this, null);
                this.messages.push(message);
                this.env[i][j].messages.push(message);
            }
            // Food general info.
            for (var k = 0; k < this.env[i][j].food.length; k++) {
                var message = new Message(this.env[i][j].food[k].giveEnvironmentInfo(), i, j, this, null);
                this.messages.push(message);
                this.env[i][j].messages.push(message);
            }
        }
    }
};



/*************************************************************
 * Help functions.
 *************************************************************/
/**
 * Get overall microbes hitpoints by player from some obj.
 * Respond with {'players': [], 'hitpoints': []};
 * @param microbes - microbes array.
 */
Environment.prototype.getOverallHitpointsByPlayer = function (microbes) {
    var players = [];
    var hitpoints_by_player = [];
    for (var i = 0; i < microbes.length; i++) {
        var player_index = players.indexOf(microbes[i].player);
        // If that was new player we should push it into array and set it's index manually.
        if (player_index === -1) {
            players.push(microbes[i].player);
            player_index = players.length - 1;
            // Set new index to 0.
            hitpoints_by_player[player_index] = 0;
        }
        hitpoints_by_player[player_index] += microbes[i].hitpoints;
    }
    return {
        'players': players,
        'hitpoints': hitpoints_by_player
    };
};

/**
 * Get microbes quantity by player.
 */
Environment.prototype.getMicrobesQuantityByPlayer = function (player, microbes) {
    var q = 0;
    for (var i = 0; i < microbes.length; i++) {
        if (microbes[i].player === player) {
            q++;
        }
    }
    return q;
};
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
    algorithm1 = new Function("messages", "my_x", "my_y", "my_hitpoints", "microbe_move", "microbe_reproduce", "microbe_yell", $('#player1 *[name="algorithm"]').val());
    algorithm2 = new Function("messages", "my_x", "my_y", "my_hitpoints", "microbe_move", "microbe_reproduce", "microbe_yell", $('#player2 *[name="algorithm"]').val());
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
            game.env.step();
            game.env.draw();
        }
    }, 41);
};





// Create players.
var algorithm1 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell) {
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
var algorithm2 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell) {
    var move_x = randomNumberFromRange(-1, 2);
    var move_y = randomNumberFromRange(-1, 2);
    microbe_move(move_x, move_y);
    if (Math.random() <= 0.005) {
        microbe_reproduce();
    }
};