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
mainEnv.settle();
setInterval(function() {
    mainEnv.step();
    mainEnv.draw();
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
}, 41);

//console.log(mainEnv.microbes);
//console.log(mainEnv.env);