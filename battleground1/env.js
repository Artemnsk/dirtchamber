const MICROBS_STARTING_POPULATION = 1000;
const DEATH_PROBABILITY = 0.005;
const BIRTH_PROBABILITY = 0.005;
const MICROBE_STARTING_HITPOINTS = 2000;
const MESSAGE_RADIUS = 2;

const FOOD_STARTING_POPULATION = 200;
const FOOD_REPRODUCTION_PROBABILITY = 0.005;

/**
 * Environment constructor.
 * @param x
 * @param y
 * @constructor
 */
var Environment = function (x, y) {
    this.current_step = 0;
    // Initialize world boundaries.
    this.minX = 0;
    this.minY = 0;
    if (typeof x == 'undefined') {
        x = 200;
    }
    this.maxX = x;
    if (typeof y == 'undefined') {
        y = 200;
    }
    this.maxY = y;

    // Initialize environment array.
    this.microbes = [];
    this.messages = [];
    this.food = [];
    this.env = {};
    for (i = this.minX; i <= this.maxX; i++) {
        this.env[i] = {};
        for (j = this.minY; j <= this.maxY; j++) {
            this.env[i][j] = {
                'microbes': [],
                'messages': [],
                'food': []
            };
        }
    }
};

/**
 * Draw environment.
 */
Environment.prototype.draw = function() {
    var c = document.getElementById("Area");
    var ctx = c.getContext("2d");

    var scale = 2;
    ctx.clearRect(0, 0, this.maxX * scale, this.maxY * scale);
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
    // "Process" environment.
    for (i in this.env) {
        for (j in this.env[i]) {
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
                if (item.microbes[i].player != winner) {
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
            index = this.microbes.indexOf(item.microbes[i]);
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
        // Each microbe eats the first avaikabke food.
        for (var i = 0; i < item.microbes.length; i++) {
            for (var j = 0; j < item.food.length; j++) {
                if (item.food[j].height <= 0) {
                    // Do not feed from empty food.
                    continue;
                } else {
                    // Feed. We will delete eaten food later.
                    item.food[j].height--;
                    item.microbes[i].hitpoints += Math.round(MICROBE_STARTING_HITPOINTS / 2.5);
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
    for (var i = x - MESSAGE_RADIUS; i <= x + MESSAGE_RADIUS; i++) {
        if ((this.minX <= i) && (i <= this.maxX)) {
            for (var j = y - MESSAGE_RADIUS; j <= y + MESSAGE_RADIUS; j++) {
                if ((this.minY <= j) && (j <= this.maxY)) {
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
    for (var i = this.minX; i <= this.maxX; i++) {
        for (var j = this.minY; j <= this.maxY; j++) {
            // Microbes general info.
            for (var k = 0; k < this.env[i][j].microbes.length; k++) {
                if (this.env[i][j].microbes[k].hasOwnProperty('giveEnvironmentInfo')) {
                    var message = new Message(this.env[i][j].microbes[k].giveEnvironmentInfo(), i, j, this, null);
                    this.messages.push(message);
                    this.env[i][j].messages.push(message);
                }
            }
            // Food general info.
            for (var k = 0; k < this.env[i][j].food.length; k++) {
                if (this.env[i][j].food[k].hasOwnProperty('giveEnvironmentInfo')) {
                    var message = new Message(this.env[i][j].food[k].giveEnvironmentInfo(), i, j, this, null);
                    this.messages.push(message);
                    this.env[i][j].messages.push(message);
                }
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
    }
};