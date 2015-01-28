// Initialization of Settings //

// Margins for the SVG - height/width defined in terms of margin.
var margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 50
};
var width = (0.7 * window.innerWidth) - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

// Function that parses a date formatted as "YYYY-MM-DD HH:MM:SS".
var parseDate = d3.time.format("%Y-%m-%d %X").parse;

var rangeOptions = {
	xRange: d3.time
		.scale()
		.range([0, width]),
	yRange: d3.scale
		.linear()
		.range([height, 0])
};

// These are defined in terms of rangeOptions so must be defined separately.
var axisOptions = {
	xAxis: d3.svg.axis()
		.scale(rangeOptions.xRange)
		.orient("bottom"),
	yAxis: d3.svg.axis()
		.scale(rangeOptions.yRange)
		.orient("left")
};

// stores a d3 line that is bound to scaled data - it's called below (after data is loaded)
var line = d3.svg.line()
    .defined(function(d) { return d.rank != null; })
	    .x(function(d) { return rangeOptions.xRange(d.date); })
	    .y(function(d) { return rangeOptions.yRange(d.rank); });

// svg is stored and appended to the body of the html
var svg = d3.select("#graph")
	.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// CHARTING FUNCTION //

var drawFullChart = function(data, nest, svg, clickedMovies, line, rangeOptions, axisOptions) {
    // regardless of what was there, get rid of it and start over
    svg.selectAll("*").remove();

    rangeOptions.xRange.domain(d3.extent(data, function(d) { return d.date; }));
    rangeOptions.yRange.domain([
    	d3.max(data, function(d) { return d.rank; }),
        d3.min(data, function(d) { return d.rank; })
    ]);

    // adding the x axis and all of its attributes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(axisOptions.xAxis);

    // adding the y axis and all of its attributes
    svg.append("g")
        .attr("class", "y axis")
        .call(axisOptions.yAxis)
        .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 6)
	        .attr("dy", ".71em")
	        .style("text-anchor", "end")
	        .text("Top 250 Rank");

    // loop through the nested data and make a line for every movie
    nest.forEach(function(d) {
        svg.append("path")
            .datum(d.values)
            .attr("class", "line " + d.key)
            .attr("d", line);
    });

    d3.selectAll(".line")
        .on("mousemove", function(d) {
            var point = d3.mouse(this);
            var p = {
                    x: point[0],
                    y: point[1]
                };
            var movie = d3.select(this)
            	.attr("class")
            	.split(" ")[1];
            d3.select("#tooltip")
                .text(keyData[movie]["standardTitle"])
                .style("left", p.x + 375 + "px")
                .style("top", p.y - 25 + "px")
                .style("opacity", "1");
            d3.select(this)
                .style("stroke-width", "2px")
                .style("stroke", "red")
                .style("opacity", "1");
        })

	    .on("mouseout", function(d) {
	        d3.select("#tooltip")
	            .style("opacity", "0")
	        d3.select(this)
	            .style("stroke-width", ".5px")
	            .style("stroke", "grey")
	            .style("opacity", "0.5")
	    });
};

// DATA LOADING

// loads data, makes it available to functions below as a set of objects
// coerces the data types correctly
movieData.forEach(function(d) {
    d.rank = +d.rank;
    // Keep consistent variable case.
    d.imdbId = d.imdb_id
    d.standardTitle = d.standard_title
    d.date = parseDate(d.date);
});

// nest the data - make the movies the keys in an array of movie objects
var nest = d3.nest()
    .key(function(d) { return d.imdbId; })
    .entries(movieData);

// add the combo of key and title to an array of arrays - this could definitely be done better
var dataTable = []
nest.forEach(function(d) {
    dataTable.push([d.key, d.values[0].standardTitle])
})

// add the combo of title and imdbId to an object - could be done better
var titleData = {}
nest.forEach(function(d) {
    titleData[d.values[0]["standardTitle"]] = d.values[0]["imdbId"]
});

// add the combo of title and key to an object - could be done better
var keyData = {}
nest.forEach(function(d) {
    keyData[d.values[0]["imdbId"]] = d.values[0]
});

// for each movie title, add a row to the table
dataTable.forEach(function(d) {
    d3.select("#movieSelection")
        .append("tr")
        	.attr("class", d[0])
    for (i = 1; i < d.length; i++) {
        d3.select("." + d[0])
            .append("td")
	            .text(d[i])
	            .style("width", "200px")
	            .style("overflow", "hidden")
    }
});

// call this on opening the page
drawFullChart(movieData, nest, svg, clickedMovies, line, rangeOptions, axisOptions);

// allow the full chart button to draw it again after being filtered
var fullChartButton = d3.select("#fullChart")

fullChartButton
		.on("click", function(d) {
		    drawFullChart(movieData, nest, svg, clickedMovies, line, rangeOptions, axisOptions);
		});

// store all of the rows
var tr = d3.selectAll("tr");

// store anything that's been clicked in an array
var clickedMovies = [];

// if you hover over a row, it highlights the line for the movie in the row
tr
    .on("mousemove", function(d) {
        var movie = d3.select(this).attr("class");
        svg.select("." + movie)
            .style("stroke", "red")
            .style("stroke-width", "2px")
            .style("opacity", "1");
    })

	.on("mouseout", function(d) {
	    var movie = d3.select(this).attr("class")
	    svg.select("." + movie)
	        .style("stroke", "grey")
	        .style("stroke-width", ".5px")
	        .style("opacity", "0.5");
	})

	// if you click on a row, it adds it to the selected movies table
	.on("click", function(d) {
	    var movie = d3.select(this).attr("class");
	    var movieText = d3.select(this).text();
	    var movieEl = svg.select("." + movie);
	    var clicked = d3.select(this).attr("class").split(" ")[1];

	    // if it's already been clicked, get rid of it
	    if (clicked == "clicked") {
	        d3.select(this).classed("clicked", false)
	        movieEl.classed("lineClicked", false)
	        clickedMovies.splice(clickedMovies.indexOf(movieText), 1)
	            // otherwise keep it in there
	    } else {
	        d3.select(this).classed("clicked", true)
	        movieEl.classed("lineClicked", true)
	        clickedMovies.push(movieText)
	    };

	    // every time one is clicked, rebuild the selected movies
	    d3.selectAll("#clickedMovies > tr").remove()
	    clickedMovies.forEach(function(d) {
	        d3.select("#clickedMovies")
	            .append("tr")
		            .text(d)
		            .attr("class", titleData[d]);
	    });

	    // highlight lines even more clearly if selected movie is hovered over
	    var clickedTr = d3.selectAll("#clickedMovies > tr");

	    clickedTr
    		.on("mousemove", function(d) {
	            var movie = d3.select(this).attr("class");
	            svg.select("." + movie)
	                .style("stroke", "red");
	        })
	        .on("mouseout", function(d) {
	            var movie = d3.select(this).attr("class");
	            svg.select("." + movie)
	                .style("stroke", "grey");
	        });

	    var filterButton = d3.select("#filter");

	    filterButton
    		.on("click", function(d) {

		        var filteredMovies = [];
		        clickedMovies.forEach(function(d) {
		            filteredMovies.push(titleData[d]);
		        })
		        var filteredData = nest.filter(function(d) {
		            return filteredMovies.indexOf(d.key) > -1;
		        });

		        svg.selectAll("*").remove();

		        var dates = [];
		        var ranks = [];

		        filteredData.forEach(function(d) {
		            d.values.forEach(function(i) {
		                dates.push(i["date"]);
		                ranks.push(i["rank"]);
		            });
		        });

		        rangeOptions.xRange.domain(d3.extent(dates));
		        rangeOptions.yRange.domain([d3.max(ranks), d3.min(ranks)]);

		        // adding the x axis and all of its attributes
		        svg.append("g")
		            .attr("class", "x axis")
		            .attr("transform", "translate(0," + height + ")")
		            .call(axisOptions.xAxis);

		        // adding the y axis and all of its attributes
		        svg.append("g")
		            .attr("class", "y axis")
		            .call(axisOptions.yAxis)
		            .append("text")
			            .attr("transform", "rotate(-90)")
			            .attr("y", 6)
			            .attr("dy", ".71em")
			            .style("text-anchor", "end")
			            .text("Top 250 Rank");

		        // better interpolation for lines when filtered - too slow for the whole graph
		        var lineFiltered = d3.svg.line()
		            .defined(function(d) { return d.rank != null; })
		            .interpolate("basis")
		            .x(function(d) { return rangeOptions.xRange(d.date); })
		            .y(function(d) { return rangeOptions.yRange(d.rank); });

		        filteredData.forEach(function(d) {
		            svg.append("path")
		                .datum(d.values)
		                .attr("class", "line " + d.key + " lineFiltered")
		                .attr("d", lineFiltered);
		        });

		        var lines = d3.selectAll(".line");

		        lines
	        		.on("mousemove", function(d) {
			            var point = d3.mouse(this),
			                p = {
			                    x: point[0],
			                    y: point[1]
			                };
			            var movie = d3.select(this)
			            	.attr("class")
			            	.split(" ")[1];
			            d3.select("#tooltip")
			                .text(keyData[movie]["standardTitle"])
			                .style("left", p.x + 375 + "px")
			                .style("top", p.y - 25 + "px")
			                .style("opacity", "1");
			            d3.select(this)
			                .style("stroke", "red");
			        })

			        .on("mouseout", function(d) {
			            d3.select("#tooltip")
			                .style("opacity", "0");
			            d3.select(this)
			                .style("stroke", "grey");
			        });
    		});
	});