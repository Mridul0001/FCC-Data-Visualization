//variables for width, height and padding
var width;
var height;
const padding = 90;
const colors = ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"];

//function to render data to screen
function render(dataset){
  //setting width and heigth values
  width = 5*Math.ceil(dataset.monthlyVariance.length/12);
  height = 500;
  
  //creating tooltip variable
  var tooltip = d3.select('#main')
              .append('div')
              .attr("id", "tooltip")
              .style("opacity", 0);
              
  
  //creating svg element
  const svg = d3.select('#main')
              .append('svg')
              .attr('width', width)
              .attr('height', height);
  
  //adding description
  document.getElementById('description').innerHTML = `Base temprature : ${dataset.baseTemperature} </br> 1753-2015`;
  
  //min and max for x axis
  var xmin = d3.min(dataset.monthlyVariance, function(d){
    return d.year;
  });
  
  var xmax = d3.max(dataset.monthlyVariance, function(d){
    return d.year;
  })
  //x and y scales
  var xScale = d3.scaleBand().domain(dataset.monthlyVariance.map(function(val){return val.year})).range([padding, width-padding]);
  var yScale = d3.scaleBand().domain([1,2,3,4,5,6,7,8,9,10,11,12]).range([height-padding, padding]);
  
  //x and y axis
  var xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year=> year%10 === 0)).tickFormat(function(year){
    var date = new Date(0);
    date.setUTCFullYear(year);
    return d3.timeFormat("%Y")(date);
  });
  
  var yAxis = d3.axisLeft(yScale)
      .tickFormat(function(month){
        var date = new Date(0);
        date.setUTCMonth(month-1);
        return d3.timeFormat("%B")(date);
      })
  
  // draw x and y axis
  svg.append('g').attr('id', 'x-axis')
     .attr('transform', "translate(0," + (height-padding) + ")")
       .call(xAxis);
  
  svg.append("g").attr("id", "y-axis")
       .attr("transform", "translate(" + (padding) + ", 0)")
       .call(yAxis);
  
  //text for y and x axis
  svg.append('text').attr('id', 'text')
     .attr('transform', 'rotate(-90)')
     .attr('x', -270).attr('y', 30).text("Months")
  
  svg.append('text').attr('id', 'text')
     .attr('x', width/2).attr('y', 450).text("Years");
  
  //legend
  var legendColors = colors.reverse();
  var legendheight = 30;
  var legendwidth = 400;
  var variance = dataset.monthlyVariance.map(function(va){
    return va.variance;
  });
  var tempmin = dataset.baseTemperature + Math.min.apply(null, variance);
  var tempmax = dataset.baseTemperature + Math.max.apply(null, variance);
  
  //array to store domain values of threshold scale
  var arr = [];
  var step = (tempmax-tempmin)/legendColors.length;
  var base = tempmin;
  for(var i=1; i<legendColors.length; i++){
      arr.push(base + i*step)
  }
  //console.log(arr);
  var threshold = d3.scaleThreshold().domain(arr).range(legendColors);
  
  var x_legend = d3.scaleLinear().domain([tempmin, tempmax]).range([0, legendwidth]);
  
  var legendAxis = d3.axisBottom(x_legend).tickValues(threshold.domain())
                     .tickFormat(d3.format(".1f"));
  
  var legend = svg.append('g').attr('id', 'legend')
                  .attr('transform', "translate(" + padding + "," + (height-padding+legendheight+10) + ")");
  
  legend.append('g').selectAll('rect').data(threshold.range().map(function(color){
          var d = threshold.invertExtent(color);
          if(d[0] == null) d[0] = x_legend.domain()[0];
          if(d[1] == null) d[1] = x_legend.domain()[1];
          //console.log(d);
          return d;
        }))
      .enter().append('rect')
        .style("fill", function(d, i){return threshold(d[0])})
        .attr('x', function(d,i){
            return x_legend(d[0])})
        .attr('y', 0).attr('width', function(d,i){
            return x_legend(d[1]) - x_legend(d[0])})
        .attr('height', legendheight);
  
  legend.append("g")
        .attr("transform", "translate(" + 0 + "," + legendheight + ")")
        .call(legendAxis); //legend completed
  
  //building heat map
  svg.append('g').attr('class', 'map')
     .attr('transform', "translate(" + 0 + "," + 0 + ")")
     .selectAll('rect').data(dataset.monthlyVariance)
     .enter().append('rect')
     .attr('class', 'cell').attr('data-year', function(d){
        return d.year;
  }).attr('data-month', function(d){
        return d.month-1;
  }).attr('data-temp', function(d){
        return dataset.baseTemperature + d.variance;
  }).attr('x', function(d,i){return xScale(d.year)}).attr('y', function(d,i){return yScale(d.month)})
    .attr('width', function(d,i){return xScale.bandwidth(d.year)})
    .attr('height', function(d,i){return yScale.bandwidth(d.month)})
    .attr('fill', function(d,i){
        return threshold(dataset.baseTemperature + d.variance);
  }) .on("mouseover", function(d){
      tooltip.style('opacity', .9)
             .attr('data-year', d.year)
             .html("<span class='date'>" + d3.timeFormat("%Y - %B")(new Date(d.year, d.month)) + "</span>" + "<br />"
              + "<span class='temperature'>" + d3.format(".1f")(dataset.baseTemperature + d.variance) + "&#8451;" + "</span>" + "<br />"
              + "<span class='variance'>" + d3.format("+.1f")(d.variance) + "&#8451;" + "</span>").style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d){tooltip.style('opacity', 0)});
}

//fetch data
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').then(response => response.json()).then(data => {
  render(data);
})