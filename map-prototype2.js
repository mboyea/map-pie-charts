let width = 600, height = 400;

// Test
const map = d3.json('data/usa-states.json');
const data = d3.json('data/mock-data.json');

Promise.all([map, data]).then((result) => {
  d3.select('#map-display-container').append('svg').append('g');

  let viewPos = [-125, 50],
  viewOffset = [0, 0],
  viewZoom = 150;

  const handleZoom = (e) => {
    d3.select('svg g')
      .attr('transform', e.transform);
  }

  let zoom = d3.zoom()
  .scaleExtent([1, viewZoom])
  .translateExtent([[0, 0], [width, height]])
  .on('zoom', handleZoom);

  // Calculate viewport
  const projection = d3.geoMercator()
    .center(viewPos)
    .translate(viewOffset)
    .scale(viewZoom)

  const projectionGeoPath = d3.geoPath().projection(projection);

  // Initialize Zoom
	d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zoom);

  // Render map
  d3.select('svg g').selectAll('path')
    .data(result[0].features)
    .join('path')
      .attr('fill', 'grey')
      .style('stroke', 'none')
      .attr('d', projectionGeoPath)

  // Render data
  d3.select('svg g').selectAll('circle')
    .data(result[1])
    .enter()
    .append('circle')
    .attr('cx', (d) => projection(d.pos)[0])
    .attr('cy', (d) => projection(d.pos)[1])
    .attr('r', 3)
    .attr('fill', 'red')
});
