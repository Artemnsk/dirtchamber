/**
 * Helper function which returns random number from range.
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

var mainEnv = new Environment();
mainEnv.settle();
setInterval(function() {
    mainEnv.step();
    mainEnv.draw();
}, 41);

//console.log(mainEnv.microbes);
//console.log(mainEnv.env);