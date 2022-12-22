/**
 * Renders an svg which contains a map with graphs overlaid on top
 * @param parent
 * parent element which the svg will be rendered within
 * @param mapData
 * the map source data (GeoJSON format)
 * @param {number[]} size
 * [width, height] of the svg
 * @param {number[]} viewPos
 * [latitude, longitude] of the view position
 * @param {number[]} viewOffset
 * [width, height] pixels offset from the viewPos
 * (at [0, 0], viewPos is the top left of the view)
 * @param {number} viewZoom
 * zoom level of the view
 * @param {{pos: number[], data: Object}[]} graphData
 * array of graph data which the map will display at pos [latitude, longitude]
 * @returns {void}
 * nothing
 */
const renderDataMap = (
  parent,
  mapData,
  size,
  viewPos = [-125, 50],
  viewOffset = [0, 0],
  viewZoom = 150,
  graphData = []
) => {
  const startTime = Date.now();

  // Calculate viewport
  const projection = d3.geoMercator()
    .center(viewPos)
    .translate(viewOffset)
    .scale(viewZoom)
  
  console.log(`Center: ${projection.center()}`);
  console.log(`Scale: ${projection.scale()}`);
  console.log(`Rotation: ${projection.rotate()}`);
  console.log(`Translation: ${projection.translate()}`);
  console.log(`ClipAngle: ${projection.clipAngle()}`);
  console.log(`ClipExtent: ${projection.clipExtent()}`);
  console.log(`Precision: ${projection.precision()}`);

  // Inject svg into parent
  mapSVG = parent.append('svg')
    .attr('width', size[0])
    .attr('height', size[1])

  // Render map
  mapSVG.append("g")
  .selectAll("path")
  .data(mapData.features)
  .join("path")
  .attr("fill", "grey")
  .attr("d", d3.geoPath().projection(projection))
  .style("stroke", "none");

  const endTime = Date.now();
  console.log(`It took ${endTime - startTime}ms to render the map.`)
}

d3.json('data/usa-states.json').then((map) => {
  renderDataMap(
    d3.select('#map'),
    map,
    [800, 450],
    [-125, 50],
    [0, 0],
    500,
    [
      {pos: [-115, 40], data: {}},
      {pos: [-110, 35], data: {}},
    ],
  );
});

/* RENDER DONUT GRAPH:

// set the dimensions and margins of the graph
const width = 450,
    height = 450,
    margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
const svg = d3.select("#donut-chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Create dummy data
const data = {a: 9, b: 20, c:30, d:8, e:12}

// set the color scale
const color = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
const pie = d3.pie()
  .value(d=>d[1])

const data_ready = pie(Object.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('whatever')
  .data(data_ready)
  .join('path')
  .attr('d', d3.arc()
    .innerRadius(100)         // This is the size of the donut hole
    .outerRadius(radius)
  )
  .attr('fill', d => color(d.data[0]))
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
*/
