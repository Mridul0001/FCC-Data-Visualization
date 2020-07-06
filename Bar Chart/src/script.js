//heigth width and padding
const width = 800;
const height = 500;
const padding = 50;
const barWidth = width/275;
//svg container and tooltip
const svg = d3.select('#main')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

var tooltip = d3.select("#main").append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

//function to render data
const render = dataset => {
  
  //domain bounds for x and y axis
  var yearsDate = dataset.map(function(item) {
    return new Date(item[0]);
  });
  const xmin = new Date(d3.min(yearsDate));
  const xmax = new Date(d3.max(yearsDate));
  const ymin = d3.min(dataset, function(d){
    return d[1];
  });
  const ymax = d3.max(dataset, function(d){
    return d[1];
  });
  
  //xScale and yScale
  const xScale = d3.scaleTime()
                   .domain([xmin, xmax]).range([padding, width-padding]);
  const yScale = d3.scaleLinear().domain([0, ymax]).range([height-padding, 0]);
  
  //drawing xAxis and yAxis lines
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  //scaled GDP
   var GDP = dataset.map(function(item) {
    return item[1]
  });
  
  var scaledGDP = [];
  
  var gdpMin = d3.min(GDP);
  var gdpMax = d3.max(GDP);
  
  var linearScale = d3.scaleLinear()
    .domain([0, gdpMax])
    .range([0, height-padding]);
  
  scaledGDP = GDP.map(function(item) {
    return linearScale(item);
  });
  
   //drawing x and y axis  
   svg.append("g").attr("id", "x-axis")
       .attr("transform", "translate(0," + (height-padding) + ")")
       .call(xAxis);
  
  svg.append("g").attr("id", "y-axis")
       .attr("transform", "translate(" + (padding) + ", 0)")
       .call(yAxis);
  
  //appending text in left
  svg.append('text').attr("id", "text")
    .attr('transform', 'rotate(-90)')
    .attr('x', -320)
    .attr('y', 80)
    .text('Gross Domestic Product(Billion $)');
  
  //creating bars
  svg.selectAll("rect").data(scaledGDP)
      .enter().append("rect")
      .attr('data-date', function(d, i) {
      return dataset[i][0]
    })
     .attr('data-gdp', function(d, i) {
      return dataset[i][1]
    })
      .attr("class", "bar")
      .attr("x", function(d, i) { return xScale(yearsDate[i]) })
      .attr("y", function(d) { return height-padding-d; })
      .attr("width", width/dataset.length)       
      .attr("height", function(d){
          return d;
  }) .on('mouseover', function(d, i) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(dataset[i][0] + '<br>' + '$' + dataset[i][1] + ' Billion')
        .attr('data-date', dataset[i][0])
        .style('left', (i * barWidth) + 30 + 'px')
        .style('top', height + padding + 'px')
        .style('transform', 'translateX(50px)');
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
    });
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json').then(response => response.json()).then(data => {
  render(data.data);
})