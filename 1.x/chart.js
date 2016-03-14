/**
 * Created by getUp on 02.03.2016.
 */
$(document).ready(function() {
    var chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'spline'
        },
        title: {
            text: 'kolichestvo pizdyukov'
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
            data: [startingPopulation]
        }]
    });
});