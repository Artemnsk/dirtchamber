const MICROBS_STARTING_POPULATION = 1000;
const DEATH_PROBABILITY = 0.005;
const BIRTH_PROBABILITY = 0.005;
const MICROBE_STARTING_HITPOINTS = 2000;
const MESSAGE_RADIUS = 2;

const FOOD_STARTING_POPULATION = 200;
const FOOD_REPRODUCTION_PROBABILITY = 0.005

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
    // TODO: where is env.microbes array?? It seems it being used somewhere to store all active microbes but there is no such array in this constructor.
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
                'food': [],
            };
        }
    }
};

/**
 * Populate environment with microbes.
 * @param strategy
 */
Environment.prototype.settle = function (strategy) {
    // Create players.
    var player1 = new Player('player 1', 'red', function (microbe) {});
    var player2 = new Player('player 2', 'blue', function (microbe) {});
    // Create microbes for these players.
    for (var i = 0; i < MICROBS_STARTING_POPULATION; i++) {
        var current_player = (i % 2 == 0) ? player1 : player2;
        new Microbe(null, null, this, {type: 'random'}, null, current_player);
    }
    for (var i = 0; i < FOOD_STARTING_POPULATION; i++) {
        new Food(null, null, this, {type: 'random'});
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
    for (var x in this.foodLayer)
        for (var y in this.foodLayer[x]) {
            // TODO: maybe all layer elements should implement interface 'drawable'?
            ctx.fillStyle = "#08685E";
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    for (var x in this.env) {
        for (var y in this.env[x]) {
            for (var k = 0; k < this.env[x][y].microbes.length; k++) {
                ctx.fillStyle = this.env[x][y].microbes[k].player.color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
                break;
            }
            for (var k = 0; k < this.env[x][y].food.length; k++) {
                ctx.fillStyle = 'green';
                ctx.fillRect(x * scale, y * scale, scale, scale);
                break;
            }
        }
    }
};

/**
 * Process a step in environment.
 */
Environment.prototype.step = function() {
    // Generate env messages. Each object on env layer should "introduce" itself.
    //this.prepareEnvironmentInfo();
    // .. and only now increase step.
    this.current_step++;
    for (var index in this.microbes) {
        this.microbes[index].live();
    }
    for (var index in this.food) {
        this.food[index].live();
    }
    // "Process" environment.

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
            for (var k = 0; k < this.env[i][j].microbes.length; k++) {
                // TODO: check if giveEnvironmentInfo exists.
                var message = new Message(this.env[i][j].microbes[k].giveEnvironmentInfo(), i, j, this, null);
                this.messages.push(message);
                this.env[i][j].messages.push(message);
            }
        }
    }
};