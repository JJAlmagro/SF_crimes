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
        .interpolate("basis");

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
        svg.append("text")
            .attr("class", "xlabel")
            .attr("x", width - 10)
            .attr("y", height - 6)
            .style("text-anchor", "end")
            .text("Hours");


    // Add the Y Axis
    svg.append("g")
        .attr("class", "y_axis")
        .call(yAxis);
        svg.append("text")
            .attr("class", "ylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", 2)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");
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
function year_plot(svg, data,index, trans){
    var margin = {top: 30, right: 50, bottom: 30, left: 50},
        width = 780 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    var data1 = data.rows[index];

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;

    };

    var keys = d3.keys(data1)

    var kx = [];
    var data =[];

    for (var i = Object.size(data1) - 1; i >= 0; i--) {
        kx.push(keys[i].substring(1,5))
        data.push(data1[keys[i]])

    };




    index1 = kx.splice(0,6).reverse();
    values = data.splice(0,6).reverse();


// Set the ranges
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1).domain(index1)
// var x = d3.scale.linear().range([0,width]). domain([0,index1.length]);
    var y = d3.scale.linear().range([height, 0]).domain([d3.min(values)-0.1, d3.max(values)]);

// Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(6);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

// Define the line
    var valueline = d3.svg.line()
        .x(function(d, index) { return (index)*(width/6) + 38; })
        .y(function(d) { return y(d); })
        .interpolate("basis");

    console.log(values)
    if (trans == "trans") {
        d3.selectAll(".line1")
            .transition()
            .duration(1250)
            .attr("d", valueline(values));
        d3.selectAll(".y2_axis")
            .transition()
            .duration(1250)
            .call(yAxis);
    } else {
// Add the valueline path.
    svg.append("path")
        .attr("class", "line1")
        .attr("d", valueline(values));

    /*    // Add the scatterplot
     svg.selectAll("dot")
     .data(values)
     .enter().append("circle")
     .attr("r", 3.5)
     .attr("cx", function(d, index) { return (index)*(width/6) + 38; })
     .attr("cy", function(d) { return y(d); });*/

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
        svg.append("text")
            .attr("class", "xlabel")
            .attr("x", width - 40)
            .attr("y", height - 6)
            .attr("id", function(d, i) { return i} )
            .style("text-anchor", "end")
            .text("Years")
            .on("click", function(d){
                console.log(this.id)
            });

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y2_axis")
        .call(yAxis);
        svg.append("text")
            .attr("class", "ylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", 2)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Norm. arrest percentage");

    }
}
function createSelector(layer, layer1, layer2) {
    var sql = new cartodb.SQL({ user: 'jjalmagro' });
    var $options = $('#layer_selector li');
    $options.click(function(e) {
        layer1.hide();
        layer2.hide();
        layer.show();
        // get the area of the selected layer
        var $li = $(e.target);
        var area = $li.attr('data');
        // deselect all and select the clicked one
        $options.removeClass('selected');
        $li.addClass('selected');
        // create query based on data from the layer
        query = "SELECT * FROM aperrest_merge WHERE year = " + area;
        // change the query in the layer to update the map
        layer.setSQL(query);
        if( area == 'clear') {
            layer.toggle();
            layer1.toggle();
            layer2.toggle();
        }
    });
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
    var svg3 = d3.select("#year")
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
    cartodb.createVis('map', 'https://jjalmagro.cartodb.com/api/v2/viz/e495ae0a-a1df-11e5-8663-0ecfd53eb7d3/viz.json', {
            tiles_loader: true,
            center_lat: 37.766667,
            center_lon: -122.433333,
            zoom: 12
        })
        .done(function(vis, layers) {
            // layer 0 is the base layer, layer 1 is cartodb layer
            var subLayer = layers[1].getSubLayer(1);
            var subLayer3 = layers[1].getSubLayer(0);
            var subLayer2 = layers[1].getSubLayer(2);
            subLayer2.toggle();
            createSelector(subLayer2, subLayer3, subLayer);

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
            var sql2 = new cartodb.SQL({ user: 'jjalmagro' });
            sql2.execute("SELECT * FROM arrest")
                .done(function(data) {
                    // console.log(data.rows[0]);
                    year_plot(svg3, data, 0);
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

                    });
                sql2.execute("SELECT * FROM arrest")
                    .done(function(data5) {
                        // console.log(data.rows[0]);
                        year_plot(svg3, data5, data2.index-1, "trans");
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
