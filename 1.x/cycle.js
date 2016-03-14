var bazjens = new Array();
var areaX = 1001;
var areaY = 801;
var startingPopulation = 10000;
for (var m = 0; m < startingPopulation; m++){
    bazjens.push({ x:randomNumberFromRange(0,areaX-1), y:randomNumberFromRange(0,areaY-1) });
};
var population = new Array();
population.push(startingPopulation);
var chartUpdateRate = 48;
var chartUpdateCounter = 0;
var chartDotCount = 20;
var chartDotCountActual = 0;
$(document).ready(function() {
    setInterval(
    function (){
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.clearRect(0, 0, areaX, areaY);
        $.each(bazjens, function( index, Microb ) {
            if(typeof Microb != 'undefined') {
                // movement
                var minX = -1;
                var maxX = 1;
                var minY = -1;
                var maxY = 1;

                if (Microb.x == 0)
                    minX = 0;
                if (Microb.x == areaX - 1)
                    maxX = 0;

                if (Microb.y == 0)
                    minY = 0;
                if (Microb.y == areaY - 1)
                    maxY = 0;

                Microb.x = Microb.x + randomNumberFromRange(minX, maxX);
                Microb.y = Microb.y + randomNumberFromRange(minY, maxY);

                // live / death
                var dice = Math.random();
                var drawMe = true;
                if (dice <= 0.005) {
                    bazjens.splice(index, 1);
                    drawMe = false;
                }
                dice = Math.random();
                if (dice <= 0.005) {
                    bazjens.push({x: Microb.x, y: Microb.y})
                }


                // drawing
                if (drawMe) {
                    var c = document.getElementById("myCanvas");
                    var ctx = c.getContext("2d");
                    ctx.fillStyle = "#FF0000";
                    ctx.fillRect(Microb.x, Microb.y, 2, 2);
                }
            }
        });

        population.push(bazjens.length);
        chartUpdateCounter++;
        if(chartUpdateCounter == chartUpdateRate) {
            var chart = $('#container').highcharts();
            if(chartDotCountActual < chartDotCount) {
                chart.series[0].addPoint(bazjens.length);
                chartDotCountActual++;
            }
            else
                chart.series[0].addPoint(bazjens.length, true, true);
            chartUpdateCounter = 0;
        }
    }, 41);
});

function randomNumberFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}