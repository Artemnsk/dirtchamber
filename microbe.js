var Microbe = function(x, y, env) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.env = env;
};

Microbe.prototype.live = function() {
    this.move();
    this.eat();
    this.reproduce();
    this.die();
};

Microbe.prototype.move = function() {
    // Pop the microbe from environment cell.
    for (var index in this.env.env[this.x][this.y]) {
        if (this === this.env.env[this.x][this.y][index]) {
            this.env.env[this.x][this.y].splice(index, 1);
        }
    }
    // Move microbe.
    var direction = {
        x : randomNumberFromRange(-1, 2),
        y : randomNumberFromRange(-1, 2)
    };
    this.x += this.speed * direction.x;
    this.y += this.speed * direction.y;
    // Check out of bounds scenario.
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
    // Put the microbe into environment cell.
    this.env.env[this.x][this.y].push(this);
};

Microbe.prototype.eat = function() {

};


Microbe.prototype.reproduce = function() {

};

Microbe.prototype.die = function() {

};
