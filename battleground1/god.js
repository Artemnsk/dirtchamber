/**
 * Helper function which returns random number from range.
 * @param min
 * @param max
 * @returns {number}
 */
function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min)+min);
}

var chartUpdateRate = 12;
var chartUpdateCounter = 0;
var chartDotCount = 20;
var chartDotCountActual = 0;

var mainEnv = new Environment();
var game = new Game(mainEnv, 100);
game.settle();
setInterval(function() {
    if (!game.processEnd()) {
        mainEnv.step();
        mainEnv.draw();
        // Draw chart.
        chartUpdateCounter++;
        if(chartUpdateCounter == chartUpdateRate) {
            var chart = $('#container').highcharts();
            if(chartDotCountActual < chartDotCount) {
                chart.series[0].addPoint(mainEnv.microbes.length);
                chartDotCountActual++;
            }
            else
                chart.series[0].addPoint(mainEnv.microbes.length, true, true);
            chartUpdateCounter = 0;
        }
    }
}, 41);