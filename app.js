
// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  // .append("g");
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


var chosenXAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
 
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup,) {

  if (chosenXAxis ==="income") {
    var label = "Income:";
  } 
  else {
    var label = "Healthcare:";
  }


var toolTip = d3.tip()
.attr("class", "tooltip")
.offset([80, -60])
.html(function(d) {
  return (`${d.obesity}<br>${label} ${d[chosenXAxis]}`);
});

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function(data) {
  toolTip.show(data);
})
  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

return circlesGroup;
}

d3.csv("data.csv", function(error, data) {
  if (error) throw error;
  console.log(data);


// parse data
data.forEach(data => {
  data.income = +data.income;
  data.healthcare = +data.healthcare;
  data.obesity = +data.obesity;
  data.poverty = +data.poverty;
  data.abbr = data.abbr
});
// xLinearScale function above csv import
var xLinearScale = xScale(data, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.obesity+30)])
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// append y axis
chartGroup.append("g")
.call(leftAxis);

 // append initial circles
 var circlesGroup = chartGroup.selectAll("circle")
 .data(data)
 .enter()
 .append("circle")
 .attr("cx", d => xLinearScale(d[chosenXAxis]))
 .attr("cy", d => yLinearScale(d.obesity))
 .attr("r", 20)
 .attr("fill", "Lightblue")
 .attr("opacity", ".5");

 var text = svg.selectAll("text")
 .data(circlesGroup)
 .enter()
 .append("text");

 var textLabels = text
 .attr("x", d => xLinearScale(d[chosenXAxis]))
 .attr("y", d => yLinearScale(d.obesity))
 .attr("text-anchor", "middle")
 .text(function (d) {return d.abbr})
 .attr('font-family', "sans-serif")
 .attr("font-size", "5px")
 .attr("fill", "black");
      
 
//  circlesGroup.append("text")
//  .attr("dx", function(data){return data.income;})
//  .attr("dy", function(data){data.obesity;})
//  .attr("text-anchor", "middle")
//  .text(function(data){return data.abbr;})     
//  .attr("font-size", 12)  
//  .attr('fill', 'white');

 // Create group for  2 x- axis labels
 var labelsGroup = chartGroup.append("g")
 .attr("transform", `translate(${width / 2}, ${height + 20})`);

var incomeLabel = labelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 20)
 .attr("value", "income") // value to grab for event listener
 .classed("active", true)
 .text("Total Income $(Dollars)");

var healthcareRating = labelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 40)
 .attr("value", "healthcare") // value to grab for event listener
 .classed("inactive", true)
 .text("Healthcare Rating");

   // append y axis
   chartGroup.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y",  0 - 50)
   .attr("x", 0 - (height / 2))
   .classed("axis-text", true)
   .classed("active", true)
   .classed("inactive", false)
   .text("Obesity");

   // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup,textLabels);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup,labelsGroup,);

        // changes classes to change bold text
        if (chosenXAxis === "healthcare") {
          healthcareRating
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareRating
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  });
