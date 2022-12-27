/**
 * Renders an svg which contains a map with graphs overlaid on top
 * @param parent
 * parent element which the svg will be rendered within
 * @param mapData
 * the map source data (GeoJSON format)
 * @param {number[]} size
 * [width, height] of the svg
 * @param {number[]} viewPos
 * [longitude, latitude] of the view position
 * @param {number[]} viewOffset
 * [width, height] pixels offset from the viewPos
 * (at [0, 0], viewPos is the top left of the view)
 * @param {number} viewZoom
 * zoom level of the view
 * @param {{
 *    organization: string,
 *    pos: number[],
 *    data: {status: string, count: number}[]
 * }[]} graphData
 * array of graph data which the map will display at pos [longitude, latitude]
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
  graphData = [],
) => {
  const startTime = Date.now();

  // Calculate viewport
  const projection = d3.geoMercator()
    .center(viewPos)
    .translate(viewOffset)
    .scale(viewZoom)

  const projectionGeoPath = d3.geoPath().projection(projection);
  
  console.log(`Center: ${projection.center()}`);
  console.log(`Scale: ${projection.scale()}`);
  console.log(`Rotation: ${projection.rotate()}`);
  console.log(`Translation: ${projection.translate()}`);
  console.log(`ClipAngle: ${projection.clipAngle()}`);
  console.log(`ClipExtent: ${projection.clipExtent()}`);
  console.log(`Precision: ${projection.precision()}`);

  // Create map
  svg = parent.append('svg')
    .attr('width', size[0])
    .attr('height', size[1])
    .append('g')

  // Render map
  svg.selectAll('path')
    .data(mapData.features)
    .join('path')
      .attr('fill', 'grey')
      .style('stroke', 'none')
      .attr('d', projectionGeoPath)

  // Render data
  svg.selectAll('circle')
    .data(graphData)
    .enter()
    .append('circle')
    .attr('cx', (d) => projection(d.pos)[0])
    .attr('cy', (d) => projection(d.pos)[1])
    .attr('r', 3)
    .attr('fill', 'red')

  const endTime = Date.now();
  console.log(`It took ${endTime - startTime}ms to render the map.`)
}

// Test
const map = d3.json('data/usa-states.json');
const data = d3.json('data/mock-data.json');

Promise.all([map, data]).then((result) => {
  renderDataMap(
    d3.select('#map'),
    result[0],
    [800, 450],
    [-125, 50],
    [0, 0],
    500,
    result[1],
  );
});
