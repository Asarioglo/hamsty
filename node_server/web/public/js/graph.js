/**
 * Created by Alexandr on 11/21/2015.
 */
// Set the dimensions of the canvas / graph

define(['js/d3.min'], function(d3) {

    var drawGraph = function() {

    };

    drawGraph.prototype.draw = function(data) {
        var container = $('.graph-container');
        container.empty();
        var width = container.width();
        var height = container.height();
        var margin = {top: 30, right: 20, bottom: 30, left: 50};
        width -= (margin.left + margin.right);
        height -= (margin.top + margin.bottom);
        // Parse the date / time
        var parseDate = d3.time.format("%H:%M:%S").parse;

// Set the ranges
        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

// Define the axes
        var xAxis = d3.svg.axis().scale(x)
            .orient("bottom").ticks(5);

        var yAxis = d3.svg.axis().scale(y)
            .orient("left").ticks(5);

// Define the line
        var valueline = d3.svg.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.speed); });

// Adds the svg canvas
        var svg = d3.select(".graph-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        data.forEach(function(d) {
            d.time = parseDate(d.time);
            d.speed = +d.speed;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.time; }));
        y.domain([0, d3.max(data, function(d) { return d.speed; })]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    };
    return drawGraph;
});

