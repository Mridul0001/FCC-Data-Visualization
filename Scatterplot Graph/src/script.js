//heigth width and padding
const width = 800;
const height = 500;
const padding = 50;

//svg container and tooltip
const svg = d3.select('#main')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

var tooltip = d3.select("#main").append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

//helper function to get y-axis format
function convert(str){
  return new Date(`2010 01 01 00:${str}`);
}
//function to render data
const render = dataset => {
  //color schemes
  var color = d3.scaleOrdinal(d3.schemePaired);
  //domain bounds for x and y axis
  var timeFormat = d3.timeFormat("%M:%S");
  const xmin = d3.min(dataset, function(d){
    return d[0] - 1;
  });
  const xmax = d3.max(dataset, function(d){
    return d[0] + 1;
  });
   const ymin = d3.min(dataset, function(d){
    return d[1];
  })
  const ymax = d3.max(dataset, function(d){
    return d[1];
  })
  
  //xScale and yScale
  const xScale = d3.scaleLinear()
                   .domain([xmin, xmax]).range([padding, width-padding]);
  const yScale = d3.scaleTime().domain([ymax, ymin]).range([height-padding, padding]);
  
  //drawing xAxis and yAxis lines
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  
   //drawing x and y axis  
   svg.append("g").attr("id", "x-axis")
       .attr("transform", "translate(0," + (height-padding) + ")")
       .call(xAxis);
  
  svg.append("g").attr("id", "y-axis")
       .attr("transform", "translate(" + (padding) + ", 0)")
       .call(yAxis);
  
  //adding text to axis
  svg.append('text').attr("id", "text")
     .attr('transform', 'rotate(-90)')
     .attr('x', -300).attr('y', 13)
     .text("Time in minutes");
  
  //creating dots
  svg.selectAll('.dot').data(dataset).enter()
     .append('circle').attr('class', 'dot')
     .attr('r', 6).attr('cx', function(d){
          return xScale(d[0]);
  }).attr('cy', function(d){
          return yScale(d[1]);
  }).attr('data-xvalue', function(d){
          return d[0];        
  }).attr('data-yvalue', function(d){
          return d[1];
  }).style("fill", function(d){
          return color(d[2] != "");
  })
  //adding tooltip
  .on('mouseover', function(d){
    tooltip.style('opacity', .9)
           .attr('data-year', d[0])
           .html(d[3] + " : " + d[4] + "</br>" +  "Year: " +  d[0] + ", Time: " + timeFormat(d[1]) 
              + (d[2]?"<br/><br/>" + d[2]:""))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
  }).on('mouseout', function(d){
    tooltip.style('opacity', 0);
  });
  
  //legend
  const legend = svg.append('g')
            .attr('id', 'legend')
            .selectAll('#legend').data(color.domain())
            .enter().append('g').attr('class', 'legend-label')
            .attr('transform', function(d, i) {
      return "translate(0," + (height/2 - i * 20) + ")";})
  
  
  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      if (d) return "Riders with doping allegations";
      else {
        return "No doping allegations";
      };
    });
  
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json').then(response => response.json()).then(data => {
  render(data.map(d => [d.Year, convert(d.Time), d.Doping, d.Name, d.Nationality]));
})