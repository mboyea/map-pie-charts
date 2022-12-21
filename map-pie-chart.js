// The svg
const svg = d3.select("svg#map"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()

// Load external data and boot
d3.json("data/usa-states.json").then( (data) => {
  // // Filter data
  // data.features = data.features.filter(d => {console.log(d.properties.name); return d.properties.name=="France"});
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("fill", "grey")
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "none");
})