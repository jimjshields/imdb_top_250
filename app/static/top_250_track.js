// Initialization of Settings //

// Margins for the SVG - height/width are defined in terms of margin.
var margin = {
	top: 20,
	right: 20,
	bottom: 30,
	left: 50
};
var width = (0.7 * window.innerWidth) - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

// Returns function that parses a date formatted as "YYYY-MM-DD HH:MM:SS".
var parseDate = d3.time.format("%Y-%m-%d %X").parse;

// Stores the options for the x and y range.
var rangeOptions = {
	xRange: d3.time
		.scale()
		.range([0, width]),
	yRange: d3.scale
		.linear()
		.range([height, 0])
};

// Stores the options for the x and y axis.
// These are defined in terms of rangeOptions so must be defined separately.
var axisOptions = {
	xAxis: d3.svg.axis()
		.scale(rangeOptions.xRange)
		.orient("bottom"),
	yAxis: d3.svg.axis()
		.scale(rangeOptions.yRange)
		.orient("left")
};

// Stores a d3 line that can be bound to data and will automatically scale it.
var line = d3.svg.line()
    .defined(function(d) { return d.rank != null; })
	    .x(function(d) { return rangeOptions.xRange(d.date); })
	    .y(function(d) { return rangeOptions.yRange(d.rank); });

// Stores the SVG and appends it to the body of the HTML.
var svg = d3.select("#graph")
	.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Charting Function //

var drawFullChart = function(data, nest, svg, clickedMovies, line, rangeOptions, axisOptions) {

    // Removes what is on the SVG and redraw the chart.
    svg.selectAll("*").remove();

    // Sets the x domain to the date range.
    rangeOptions.xRange.domain(d3.extent(data, function(d) { return d.date; }));

    // Sets the y domain to the reversed rank range (so 1 is on top).
    rangeOptions.yRange.domain([
    	d3.max(data, function(d) { return d.rank; }),
        d3.min(data, function(d) { return d.rank; })
    ]);

    // Adds the x axis and all of its attributes.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(axisOptions.xAxis);

    // Adds the y axis and all of its attributes.
    svg.append("g")
        .attr("class", "y axis")
        .call(axisOptions.yAxis)
        .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 6)
	        .attr("dy", ".71em")
	        .style("text-anchor", "end")
	        .text("Top 250 Rank");

    // Loops through the nested data and make a line for every movie.
    nest.forEach(function(d) {
        svg.append("path")
            .datum(d.values)
            .attr("class", "line " + d.key)
            .attr("d", line);
    });

    // Defines events for all lines.
    d3.selectAll(".line")

    	// Binds each line to a mousemove event that displays an associated tooltip.
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

        // Binds each line to a mouseout event that removes the tooltip.
	    .on("mouseout", function(d) {
	        d3.select("#tooltip")
	            .style("opacity", "0")
	        d3.select(this)
	            .style("stroke-width", ".5px")
	            .style("stroke", "grey")
	            .style("opacity", "0.5")
	    });
};

// Data Loading //

// Loads data from a JSON object.
movieData.forEach(function(d) {
	// Coerces the data types and forces consistent variable case.
    d.rank = +d.rank;
    d.imdbId = d.imdb_id
    d.standardTitle = d.standard_title
    d.date = parseDate(d.date);
});

// FIXME: Shouldn't create multiple data structures for this.
// Nests the data from the JSON object.
var nest = d3.nest()
    .key(function(d) { return d.imdbId; })
    .entries(movieData);

// FIXME: Shouldn't create multiple data structures for this.
// Creates a mapping table between id and title.
var dataTable = []
nest.forEach(function(d) {
    dataTable.push([d.key, d.values[0].standardTitle])
})

// FIXME: Shouldn't create multiple data structures for this.
// FIXME: This seems to be the same as above.
// Creates a mapping table between title and id.
var titleData = {}
nest.forEach(function(d) {
    titleData[d.values[0]["standardTitle"]] = d.values[0]["imdbId"]
});

// FIXME: Shouldn't create multiple data structures for this.
// FIXME: Unclear what this does.
var keyData = {}
nest.forEach(function(d) {
    keyData[d.values[0]["imdbId"]] = d.values[0]
});

// Adds a row to the HTML table for each movie.
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

// Calls the drawing function upon first visiting the page.
drawFullChart(movieData, nest, svg, clickedMovies, line, rangeOptions, axisOptions);

// HTML Interaction //

// Stores the HTML button.
var fullChartButton = d3.select("#fullChart")

// On a click, allows the HTML button to draw the chart again after being filtered.
fullChartButton
		.on("click", function(d) {
		    drawFullChart(movieData, nest, svg, clickedMovies, line, rangeOptions, axisOptions);
		});

// Stores all of the HTML rows.
var tr = d3.selectAll("tr");

// Stores any currently-clicked movies.
var clickedMovies = [];

// Filtering Functions //

// Defines events bound to the HTML rows.
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

	// Adds a row's associated movie to the clickedMovies array.
	.on("click", function(d) {
	    var movie = d3.select(this).attr("class");
	    var movieText = d3.select(this).text();
	    var movieEl = svg.select("." + movie);
	    var clicked = d3.select(this).attr("class").split(" ")[1];

	    // Removes from clickedMovies array if movie has already been clicked.
	    if (clicked == "clicked") {
	        d3.select(this).classed("clicked", false)
	        movieEl.classed("lineClicked", false)
	        clickedMovies.splice(clickedMovies.indexOf(movieText), 1)
	    // Adds to clickedMovies array if movie has not been clicked.
	    } else {
	        d3.select(this).classed("clicked", true)
	        movieEl.classed("lineClicked", true)
	        clickedMovies.push(movieText)
	    };

	    // Rebuilds the clickedMovies HTML table each time a movie is clicked.
	    d3.selectAll("#clickedMovies > tr").remove()
	    clickedMovies.forEach(function(d) {
	        d3.select("#clickedMovies")
	            .append("tr")
		            .text(d)
		            .attr("class", titleData[d]);
	    });

	    // Stores the HTML rows of all clicked movies.
	    var clickedTr = d3.selectAll("#clickedMovies > tr");

	    // Defines events bound to the clicked movie rows.
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

	    // Stores the HTML filter button.
	    var filterButton = d3.select("#filter");

	    // Defines events bound to the HTML filter button.
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

		        // Adds the x axis and all of its attributes.
		        svg.append("g")
		            .attr("class", "x axis")
		            .attr("transform", "translate(0," + height + ")")
		            .call(axisOptions.xAxis);

		        // Adds the y axis and all of its attributes.
		        svg.append("g")
		            .attr("class", "y axis")
		            .call(axisOptions.yAxis)
		            .append("text")
			            .attr("transform", "rotate(-90)")
			            .attr("y", 6)
			            .attr("dy", ".71em")
			            .style("text-anchor", "end")
			            .text("Top 250 Rank");

		        // Stores the options for the filtered lines.
		        var lineFiltered = d3.svg.line()
		            .defined(function(d) { return d.rank != null; })
		            // Forces cleaner interpolation of filtered lines.
		            .interpolate("basis")
		            .x(function(d) { return rangeOptions.xRange(d.date); })
		            .y(function(d) { return rangeOptions.yRange(d.rank); });

		        // Loops through the filtered data and make a line for every movie.
		        filteredData.forEach(function(d) {
		            svg.append("path")
		                .datum(d.values)
		                .attr("class", "line " + d.key + " lineFiltered")
		                .attr("d", lineFiltered);
		        });

		        // Stores the filtered lines.
		        var lines = d3.selectAll(".line");

		        // Defines events bound to the filtered lines.
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