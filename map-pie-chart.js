// The svg
const svg = d3.select('svg#map');
svg.attr('width', 1600);
svg.attr('height', 900);

// Map and projection
const projection = d3.geoMercator()

// Load USA map
d3.json("data/usa-states.json").then((data) => {
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("fill", "grey")
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "none");
})

// Map properties:
// X zoomLevel
// Svg usaMap (display in site)
// Svg[] donutGraphs (display on top)
