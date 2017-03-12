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
