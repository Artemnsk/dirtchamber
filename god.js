/**
 * Helper function which returns random number from range.
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

var totalTime = 0;
var steps = 0;

var mainEnv = new Environment();
mainEnv.settle();
setInterval(function() {
    var time = Date.now();

    // Main program.
    mainEnv.step();
    mainEnv.draw();

    // Output time performance.
    time = Date.now() - time;
    steps++;
    totalTime += time;
    var averageTime = totalTime / steps;
    console.log("Average time: " + averageTime);
}, 41);

// Don't clog console with time performance outputs.
setInterval(function() {
    console.clear();
}, 5000);
