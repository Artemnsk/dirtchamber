/**
 * Created by getUp on 15.03.2016.
 */
$(document).ready(function() {
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
});
