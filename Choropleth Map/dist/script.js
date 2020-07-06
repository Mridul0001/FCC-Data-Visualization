const svg = d3.select('#main')
.append('svg')
.attr('width', 960)
.attr('height', 600);

const tooltip = d3.select('body')
                  .append('div')
                  .attr('id', 'tooltip')
                  .style('opacity', 0);

const pathGenerator = d3.geoPath();

/*
 render data to screen
 */
const render = (county, education) => {
  
  //colors
  var color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(d3.schemeYlOrBr[9]);
  
 //building map
  var map =
  svg.selectAll('path').data(county.features)
     .enter().append('path')
     .attr('class', 'county')
     .attr('data-fips', d=> d.id)
     .attr('data-education', d=> {
        var i = education.findIndex(o => d.id === o.fips)
        return education[i].bachelorsOrHigher;})
  //fill with colors
     .attr('fill', d => {
        var i = education.findIndex(o => d.id === o.fips)
        return color(education[i].bachelorsOrHigher);
  })
     .attr('d', pathGenerator)
  //adding tootltip
  .on('mouseover', function(d){
      tooltip.style('opacity', .9);
      tooltip.html(function(){
        var i = education.findIndex(o => d.id === o.fips)
        return education[i].area_name + ', ' + education[i].state
                + ': ' + education[i].bachelorsOrHigher + '%';
      })
      .attr('data-education', () =>{
          var i = education.findIndex(o => d.id === o.fips)
          return education[i].bachelorsOrHigher;
      })
      .style("left", (d3.event.pageX + 10) + "px") 
      .style("top", (d3.event.pageY - 28) + "px");
  }).on('mouseout', function(d){tooltip.style('opacity', 0)});
  
  
  //legend variables
   var x = d3.scaleLinear()
    .domain([2.6, 75.1])
    .rangeRound([600, 860]);
  
  var g = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x) { return Math.round(x) + '%' })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();
  
  //zoom
  svg.call(d3.zoom().on('zoom', () => {
      map.attr('transform', d3.event.transform)
  }))
}

//get data from both datafiles
async function getData(){
  //county data
  const countyfetch  = await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
  const countyresp = await countyfetch.json();
  const countydata = await topojson.feature(countyresp, countyresp.objects.counties)
  
  //education data
  const edufetch = await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json');
  const edudata = await edufetch.json();
  
 //passing data objects to render function
  render(countydata, edudata);
}
getData();