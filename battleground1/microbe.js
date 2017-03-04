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
            if (!Array.isArray(this.env.microbes)) {
                this.env.microbes = [];
            }
            this.env.microbes.push(this);
            if (!Array.isArray(this.env.env[this.x])) {
                this.env.env[this.x] = [];
            }
            if (!Array.isArray(this.env.env[this.x][this.y])) {
                this.env.env[this.x][this.y] = [];
            }
            this.env.env[this.x][this.y].push(this);
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
        var microbe_eat = function () {
            that.eat();
        };
        var microbe_reproduce = function () {
            that.reproduce();
        };
        var microbe_die = function () {
            that.die();
        };
        var microbe_yell = function (text) {
            that.yell(text);
        };
        // Get messages.
        var messages = this.env.getMessages(this.x, this.y);
        // TODO: Get environment.
        this.player.algorithm.call(null, messages, microbe_move, microbe_eat, microbe_reproduce, microbe_die, microbe_yell);
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
    // Do not allow to move if step > 1.
    if (Math.abs(move_x) > 1 || Math.abs(move_y) > 1) {
        return;
    }
    // Pop the microbe from its environment cell.
    var index = this.env.env[this.x][this.y].indexOf(this);
    this.env.env[this.x][this.y].splice(index, 1);
    // Clean up env array.
    this.env.cleanupEnv(this.x, this.y);

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
    // @TODO: create method in environment to put smthng to [x,y]
    if (!Array.isArray(this.env.env[this.x])) {
        this.env.env[this.x] = [];
    }
    if (!Array.isArray(this.env.env[this.x][this.y])) {
        this.env.env[this.x][this.y] = [];
    }
    this.env.env[this.x][this.y].push(this);
};

Microbe.prototype.eat = function() {
  if(Array.isArray(this.env.foodLayer))
    if (Array.isArray(this.env.foodLayer[this.x]))
      if (Array.isArray(this.env.foodLayer[this.x][this.y]))
       for(var index in this.env.foodLayer[this.x][this.y]){
        if (this.env.foodLayer[this.x][this.y][index] instanceof Food){
          this.hitpoints += Math.round(MICROBE_STARTING_HITPOINTS / 2.5);
          this.env.foodLayer[this.x][this.y][index].height --;
        }
      }
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
        this.env.env[this.x][this.y].push(microbe);
        this.env.microbes.push(microbe);
    }
};

/**
 * Microbe dies and removed from the environment.
 */
Microbe.prototype.die = function() {
    this.hitpoints -= 41;
    if(this.hitpoints <= 0){
      var index = this.env.microbes.indexOf(this);
          this.env.microbes.splice(index, 1);
          index = this.env.env[this.x][this.y].indexOf(this);
          this.env.env[this.x][this.y].splice(index, 1);
          // Clean up env array.
          this.env.cleanupEnv(this.x, this.y);
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
    this.env.messageLayer[this.x][this.y].push(message);
};
