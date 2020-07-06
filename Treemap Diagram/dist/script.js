//height and width
const height = 600;
const width = 960;

//svg variable
const svg = d3.select("#main")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

//tooltip
const tooltip = d3.select("#main")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);
//function to render to screen
const render = moviedata => {
  
  // console.log(moviedata);
  //color variable
  const color = d3.scaleOrdinal()
                .domain(moviedata.children.map(d => d.name))
                .range(d3.schemeDark2);
              
  
  // console.log(color.domain())
  //creating treemap instance
  const treemap = d3.treemap()
                  .size([width, height])
                  .padding(1);
  //root for treemap
  const root = d3.hierarchy(moviedata)
               .sum(d => d.value);
  
  treemap(root);
  
  const cell = svg.selectAll("g").data(root.leaves())
                .enter().append("g")
                .attr("transform", d => `translate(${d.x0}, ${d.y0})`);
  
  // console.log(root.leaves())
  const tile = cell.append("rect")
                 .attr("class", "tile")
                 .attr("data-name", d => d.data.name)
                 .attr("data-category", d=> d.data.category)
                 .attr("data-value", d=> d.data.value)
                 .attr("width", d => d.x1 - d.x0)
                 .attr("height", d => d.y1 - d.y0)
                 .attr("fill", d=> color(d.data.category))
  //tooltip
  .on("mouseover", d => {
    tooltip.style("opacity", .9);
    tooltip
      .attr("data-value", d.data.value)
      .html(function(){
      return "Movie : " + d.data.name + "</br> Genre : " + d.data.category + "</br> Value : " + d.data.value
    }).style("left", (d3.event.pageX) + "px") 
      .style("top", (d3.event.pageY - 28) + "px");
  }).on("mouseout", d => tooltip.style("opacity", 0));
  
  //adding text
  cell.append("text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append("tspan")
    .attr("style", "font-size: 11px")
    .attr("fill", "white")
    .attr("x", 8)
    .attr("y", (d, i) => 15 + i * 15)
    .text(d => d);
  
  //legend
  var categories = root.leaves().map(nodes => nodes.data.category);
  categories = categories.filter(function(category, index, self){
    return self.indexOf(category)===index;    
  })
 
  const blockSize = 20;
  const legendWidth = 200;
  const legendHeight = (blockSize + 2) * categories.length;
  
  const legend = d3.select("#leg").append("svg")
                   .attr("id", "legend")
                   .attr("width", legendWidth)
                   .attr("height", height)
  
  legend.selectAll("rect").data(categories)
        .enter().append("rect")
        .attr("class", "legend-item")
        .attr("fill", d=> color(d))
        .attr("x", blockSize/2).attr("y", (d, i) => i*(blockSize + 1) + 10)
        .attr("width", blockSize)
        .attr("height", blockSize)
  
  legend.append("g").selectAll("text").data(categories).enter()
        .append("text").attr("fill", "black")
        .attr("x", 2*blockSize).attr("y", (d, i) => i*(blockSize + 1) + 25)
        .text(d => d)
}
//fetch data from json file
fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
.then(response => response.json())
.then(data => render(data))