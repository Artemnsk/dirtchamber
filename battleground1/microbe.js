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
