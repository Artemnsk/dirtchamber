/**
 * Microbe constructor.
 * @param x
 * @param y
 * @param env
 * @constructor
 */
var Microbe = function (x, y, env, strategy, hitpoints, player) {
    if (!hitpoints) {
        hitpoints = MICROBE_STARTING_HITPOINTS;
    }
    this.player = player;
    this.env = env;
    this.speed = 1;
    this.hitpoints = hitpoints;
    if (typeof strategy == 'undefined') {
        strategy = {
            type: 'random',
            data: {startingPopulation: MICROBS_STARTING_POPULATION}
        }
    }

    switch (strategy.type) {
        case 'direct':
            this.x = x;
            this.y = y;
            break;
        case 'random':
        default:
            this.x = randomNumberFromRange(this.env.minX, this.env.maxX);
            this.y = randomNumberFromRange(this.env.minY, this.env.maxY);
            this.env.microbes.push(this);
            this.env.env[this.x][this.y].microbes.push(this);
            break;
    }
};

/**
 * Main microbe method which calculates a step of microbe's life.
 */
Microbe.prototype.live = function() {
    if (this.player && this.player instanceof Player) {
        var that = this;
        // Secure operation to not allow player use the entire microbe object in algorithm.
        var microbe_move = function (move_x, move_y) {
            that.move(move_x, move_y);
        };
        var microbe_reproduce = function () {
            that.reproduce();
        };
        var microbe_yell = function (text) {
            that.yell(text);
        };
        // Get messages.
        var messages = this.env.getMessages(this.x, this.y);
        // TODO: Get environment.
        this.player.algorithm.call(null, messages, this.x, this.y, microbe_move, microbe_reproduce, microbe_yell);
    }
};

/**
 * Move microbe in environment.
 */
Microbe.prototype.move = function(move_x, move_y) {
    // FIXME: use isNumeric() of jQuery. Hope that's OK?
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
    if (move_x == 0 && move_y == 0) {
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
    if (this.x < this.env.minX) {
        this.x = this.env.minX;
    }
    else if (this.x >= this.env.maxX) {
        this.x = this.env.maxX - 1;
    }
    if (this.y < this.env.minY) {
        this.y = this.env.minY;
    }
    else if (this.y >= this.env.maxY) {
        this.y = this.env.maxY - 1;
    }

    // Put the microbe into the environment cell.
    this.env.env[this.x][this.y].microbes.push(this);
};

/**
 * Microbe creates a new one at the same position as itself.
 */
Microbe.prototype.reproduce = function() {
    var birthProbability = BIRTH_PROBABILITY;
    var modifier = Math.round(this.hitpoints / MICROBE_STARTING_HITPOINTS);
    var modifier = Math.min(modifier, 1);
    birthProbability *= modifier;
    if (Math.random() <= birthProbability) {
        this.hitpoints = Math.round(this.hitpoints / 2);
        var microbe = new Microbe(this.x, this.y, this.env, {type:'direct'}, this.hitpoints, this.player);
        this.env.env[this.x][this.y].microbes.push(microbe);
        this.env.microbes.push(microbe);
    }
};

/**
 * Microbe yells some message.
 */
Microbe.prototype.yell = function(text) {
    // Create message.
    var message = new Message(text, this.x, this.y, this.env, this.player);
    // TODO: put this message by reference into appropriate cells in env.messageLayer.
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
