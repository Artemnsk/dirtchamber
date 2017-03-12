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