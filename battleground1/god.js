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

var startGame = function () {
    // Create players.
    var algorithm1 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell) {
        // 1. Parse message.
        var found_food = false;
        for (var i = 0; i < messages.length; i++) {
            try {
                var data = JSON.parse(messages[i].text);
                if (data.type == 'food') {
                    // Go to this food.
                    microbe_move(data.x - my_x, data.y - my_y);
                    found_food = true;
                    break;
                }
            } catch (e) {}
        }
        if (!found_food) {
            var move_x = randomNumberFromRange(-1, 2);
            var move_y = randomNumberFromRange(-1, 2);
            microbe_move(move_x, move_y);
            microbe_move(move_x, move_y);
        }
        var birthProbability = BIRTH_PROBABILITY;
        var modifier = Math.round(my_hitpoints / MICROBE_STARTING_HITPOINTS);
        var modifier = Math.min(modifier, 1);
        birthProbability *= modifier;
        if (Math.random() <= birthProbability) {
            microbe_reproduce();
        }
        // That's how microbe can give message to teammate microbes in radius=2 in any text format.
        // microbe_yell('asd');
    };
    var algorithm2 = function (messages, my_x, my_y, my_hitpoints, microbe_move, microbe_reproduce, microbe_yell) {
        var move_x = randomNumberFromRange(-1, 2);
        var move_y = randomNumberFromRange(-1, 2);
        microbe_move(move_x, move_y);
        var birthProbability = BIRTH_PROBABILITY;
        var modifier = Math.round(my_hitpoints / MICROBE_STARTING_HITPOINTS);
        var modifier = Math.min(modifier, 1);
        birthProbability *= modifier;
        if (Math.random() <= birthProbability) {
            microbe_reproduce();
        }
    };

    algorithm1 = new Function("messages", "my_x", "my_y", "my_hitpoints", "microbe_move", "microbe_reproduce", "microbe_yell", $('#player1 *[name="algorithm"]').val());
    algorithm2 = new Function("messages", "my_x", "my_y", "my_hitpoints", "microbe_move", "microbe_reproduce", "microbe_yell", $('#player2 *[name="algorithm"]').val());
    var player1 = new Player($('#player1 *[name="nickname"]').val(), $('#player1 *[name="color"]').val(), algorithm1);
    var player2 = new Player($('#player2 *[name="nickname"]').val(), $('#player2 *[name="color"]').val(), algorithm2);
    var players = [player1, player2];

    var mainEnv = new Environment(200, 200, 500);
    var game = new Game(mainEnv, players);
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
    // HIGHCHARTS.
    var chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'spline'
        },
        title: {
            text: 'Count of microbes'
        },
        //xAxis: {
        //    categories: x..time
        //},
        //yAxis: {
        //    title: {
        //        text: 'Pizdyuki'
        //    }
        //},
        series: [{
            name: 'count',
            data: [mainEnv.microbes.length]
        }]
    });
};