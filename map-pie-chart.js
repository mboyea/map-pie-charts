// The svg
const svg = d3.select("svg#map"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
  .center([2, 47])                // GPS of location to zoom on
  .scale(980)                       // This is like the zoom
  .translate([ width/2, height/2 ])

// Load external data and boot
d3.json("data/usa-outline.json").then( function(data){

// Filter data
data.features = data.features.filter(d => {console.log(d.properties.name); return d.properties.name=="France"})
// Draw the mapg.append("g")
  .selectAll("path")
  .data(data.features)
  .join("path")
  .attr("fill", "grey")
  .attr(
    "d",
    d3.geoPath().projection(projection)
  )
  .style("stroke", "none")
})