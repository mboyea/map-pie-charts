/**
 * Renders an svg which contains a map of the USA with graphs overlaid on top, 
 * zoomed to fit each graph within the view
 * @param parent
 * parent element which the svg will be rendered within
 * @param {{x: number, y: number}} size
 * size of the map svg in pixels
 * @param {{top: number, right: number, bottom: number, left: number}} margin
 * margins of the map svg in pixels
 * @param {{lat: number, long: number}[]} graphData
 * array of graph data which the map will display at given lat/long coordinates
 * @returns {void}
 * nothing
 */
const renderDataMap = (parent, size, margin, graphData) => {
  const startTime = Date.now();

  // Inject svg into parent
  mapSVG = parent.append('svg')
    .attr('width', size.x)
    .attr('height', size.y)

  // Get USA map data
  d3.json('data/usa-states.json').then((data) => {
    // Calculate viewport properties
    const projection = d3.geoMercator()
    projection.fitExtent([
      [margin.left,margin.top],
      [size.x-margin.right,size.y-margin.bottom]
    ],data);

    // Render USA map
    mapSVG.append("g")
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("fill", "grey")
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "none");
  });

  const endTime = Date.now();
  console.log(`It took ${endTime - startTime}ms to render the map.`)
}

renderDataMap(
  d3.select('#map'),
  {x: 800, y: 450},
  {top: 0, right: 0, bottom: 0, left: 0},
  [],
);

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
