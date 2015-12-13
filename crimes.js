function time_plot(svg, data, index, trans){
    var margin = {top: 30, right: 20, bottom: 30, left: 100},
        width = 750 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    var data1 = data.rows[index];

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;

    };

    var keys = d3.keys(data1);

    var kx = [];
    var data =[];

    for (var i = Object.size(data1) - 1; i >= 0; i--) {
        kx.push(keys[i].substring(1,3))
        data.push(data1[keys[i]])

    };

    index1 = kx.splice(0,24).reverse();
    values = data.splice(0,24).reverse();

// Set the ranges
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width],.1).domain(index1);
    var y = d3.scale.linear().range([height, 0]).domain([0, d3.max(values)]);

// Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(24);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

// Define the line
    var valueline = d3.svg.line()
        .x(function(d, index) { return (index)*(width/24) + 15; })
        .y(function(d) { return y(d); })
        .interpolate("monotone");

    if (trans == "trans") {
        d3.selectAll(".line")
            .transition()
            .duration(1250)
            .attr("d", valueline(values));
        d3.selectAll(".x_axis")
            .transition()
            .duration(1250)
            .call(xAxis);
        d3.selectAll(".y_axis")
            .transition()
            .duration(1250)
            .call(yAxis);
        d3.select(".title")
            .text(data[0]);
    } else {
// Add the valueline path.
  var timeline = svg.append("g")
        .append("path")
        .attr("class", "line")
        .attr("d", valueline(values));

    // Add the scatterplot

    // Add the X Axis
    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y_axis")
        .call(yAxis);
        svg.append("text")
            .attr("class", "title")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(data[0]);
    }

}

function categories (chart, data, ii, subLayer, trans) {
    var hist = data.rows[ii];

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;

    };

    var keys = d3.keys(hist);
    var dist = hist["var2"];
    console.log(dist);
    var keyX = ["the_geom", "cartodb_id", "field_1", "var2", "the_geom_webmercator"] ;

    for (var i = keyX.length - 1; i >= 0; i--) {
        delete hist[keyX[i]]
    };

    var kx = [];
    var dataT =[];

    for (var i = Object.size(hist) + 2; i >= 0; i--) {
        if ((isNaN(hist[keys[i]]) == false )) {

            kx.push(keys[i]);
            dataT.push(hist[keys[i]])};};


    var margin = {top: 50, right: 50, bottom: 150, left: 50},
        barWidth = 20,
        width = ((barWidth + 18)* 36) - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    padding = 50;

    var x = d3.scale.ordinal()
        .domain(kx)
        .rangeRoundBands([0, width], 0.1);

    var y = d3.scale.linear()
        .domain([d3.max(dataT), 0])
        .range([0, height]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    if (trans == "trans") {
        console.log(dataT);
        d3.selectAll(".bars")
            .on("click", function () {
                var sql = new cartodb.SQL({ user: 'jjalmagro' });
                d3.select(".selected").classed("selected", false);
                d3.select(this).classed("selected", true);
                // deselect all and select the clicked one
                // create query based on data from the layer
                var categor = kx[this.id].toUpperCase();
                if(categor.indexOf('_') > -1)
                {
                    var categor = categor.replace('_',' ');
                }
                console.log(dist);
                var query = "select * from sf_crime where category = '" + categor + "' AND pddistrict = '" + dist + "'";
                console.log(query);
                // change the query in the layer to update the map
                subLayer.setSQL(query);
                subLayer.set({'cartocss': '#sf_crime {' +
                'marker-fill-opacity: 0.9;' +
                'marker-line-color: #FFF;' +
                'marker-line-width: 0.5;' +
                'marker-line-opacity: 1;' +
                'marker-placement: point;' +
                'marker-type: ellipse;' +
                'marker-width: 6;' +
                'marker-fill: #136400;' +
                'marker-allow-overlap: true;}' });
            })
    .data(dataT)
            .transition()
            .duration(1250)
            .attr("x", function(d, i) {return i * (width / dataT.length)+ margin.right;})
            .attr("y", function(d) {
                return y(d);
            })
            .attr("height", function(d) {
                return (y(0) - y(d));
            });
        d3.selectAll(".y1_axis")
            .transition()
            .duration(1250)
            .call(yAxis);
    } else {
    chart.selectAll("rect")
        .data(dataT)
        .enter()
        .append("svg:rect")
        .attr("x", function(d, i) {return i * (width / dataT.length)+ margin.right;})
        .attr("y", function(d) {
            return y(d);
        })
        .attr("height", function(d) {
            return (y(0) - y(d));
        })
        .attr("id", function(d, i) {return i;})
        .attr("class", "bars")
        .attr("width", x.rangeBand())
        .attr("fill", "#2d578b")
        .on("click", function () {
            var sql = new cartodb.SQL({ user: 'jjalmagro' });
            d3.select(".selected").classed("selected", false);
            d3.select(this).classed("selected", true);
            // deselect all and select the clicked one
            // create query based on data from the layer
            var categor = kx[this.id].toUpperCase();
            if(categor.indexOf('_') > -1)
            {
                var categor = categor.replace('_',' ');
            }
            console.log(dist);
            var query = "select * from sf_crime where category = '" + categor + "' AND pddistrict = '" + dist + "'";
            console.log(query);
            // change the query in the layer to update the map
            subLayer.setSQL(query);
            subLayer.set({'cartocss': '#sf_crime {' +
            'marker-fill-opacity: 0.9;' +
            'marker-line-color: #FFF;' +
            'marker-line-width: 0.5;' +
            'marker-line-opacity: 1;' +
            'marker-placement: point;' +
            'marker-type: ellipse;' +
            'marker-width: 6;' +
            'marker-fill: #136400;' +
            'marker-allow-overlap: true;}' });
        });


    chart.append("g")
        .attr("class", "x1_axis")
        .attr("transform", "translate(" + margin.left + "," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );

    chart.append("g")
        .attr("class", "y1_axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    }
}

function main() {
    var margin = {top: 30, right: 20, bottom: 30, left: 100},
        width = 750 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    // Adds the svg canvas
    var svg1 = d3.select("#time")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var margin = {top: 50, right: 50, bottom:150, left: 50},
        barWidth = 20,
        width = ((barWidth + 18)* 39) - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    var svg2 = d3.select("#cat")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    cartodb.createVis('map', 'https://jjalmagro.cartodb.com/api/v2/viz/b2aadd9e-a0df-11e5-ba3e-0ecd1babdde5/viz.json', {
            tiles_loader: true,
            center_lat: 37.766667,
            center_lon: -122.433333,
            zoom: 12
        })
        .done(function(vis, layers) {
            // layer 0 is the base layer, layer 1 is cartodb layer
            var subLayer = layers[1].getSubLayer(1);
            var sql = new cartodb.SQL({ user: 'juansv23' });
            sql.execute("SELECT * FROM timeline3")
                .done(function(data) {
                    // console.log(dat,a.rows[0]);
                    time_plot(svg1, data, 0);
                });
            var sql1 = new cartodb.SQL({ user: 'josephpmblair' });
            sql1.execute("SELECT * FROM crimes3")
                .done(function(data4) {
                    categories(svg2, data4, 0, subLayer);

                });
            layers[1].on('featureClick', function(e, latlng, pos, data2, layerNumber) {
                sql.execute("SELECT * FROM timeline3")
                    .done(function(data) {
                        console.log(data2.index);
                        time_plot(svg1, data, data2.index-1, "trans");
                    });
                sql1.execute("SELECT * FROM crimes3")
                    .done(function(data4) {
                        categories(svg2, data4, data2.index-1, subLayer, "trans");

                    })
                    .error(function(errors) {
                        // errors contains a list of errors
                        console.log("errors:" + errors);
                    });
            });
        })
        .error(function(err) {
            console.log(err);
        });

}
window.onload = main;