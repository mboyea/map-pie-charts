/** Handler to manage a displaying map */
class MapDisplay {
  /**
   * @param svg
   * the target svg to render within
   * @param mapData
   * map source data (GeoJSON format)
   * @param {{
   *    organization: string,
   *    pos: number[],
   *    data: {status: string, count: number}[]
   * }[]} graphData
   * graph source data
   * @param {number[]} viewPos
   * [longitude, latitude] position of the view
   * @param {number[]} viewOffset
   * [width, height] pixels offset from the viewPos
   * (at [0, 0], viewPos is the top left of the view)
   * @param {number} viewZoom
   * zoom level of the view
   */
  constructor(
    svg,
    mapData,
    graphData = [],
    viewPos = [-125, 50],
    viewOffset = [0, 0],
    viewZoom = 500,
  ) {
    this.setSVG(svg);
    this.setMapData(mapData);
    this.setGraphData(graphData);
    this.projection = d3.geoMercator();
    this.setView(viewPos, viewOffset, viewZoom);
    this.isRendering = false;
    this.isRenderQueued = false;
  }
  setSVG(svg) { this.svg = svg; }
  setMapData(mapData) { this.mapData = mapData; }
  setGraphData(graphData) { this.graphData = graphData; }
  /**
   * Sets the view of the map to a given position and zoom
   * @param {number[]} pos
   * [longitude, latitude] position of the view
   * @param {number[]} offset
   * [width, height] pixels offset from the viewPos
   * (at [0, 0], viewPos is the top left of the view)
   * @param {number} zoom
   * zoom level of the view
   */
  setView(pos, offset, zoom) {
    this.projection
      .center(pos)
      .translate(offset)
      .scale(zoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewPos(pos) {
    this.projection.center(pos)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewOffset(offset) {
    this.projection.translate(offset)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewZoom(zoom) {
    zoom = Math.max(zoom, 0)
    this.projection.scale(zoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  getViewPos() { return this.projection.center(); }
  getViewOffset() { return this.projection.translate(); }
  getViewZoom() { return this.projection.scale(); }
  /** Renders the map display inside of the SVG */
  render() {
    const startTime = Date.now();

    // Queue overlapping render calls
    if (this.isRendering) {
      this.isRenderQueued = true;
      return;
    }
    this.isRendering = true;

    // Render map
    this.svg.selectAll('.map')
    .data(this.mapData.features)
    .join('path')
      .attr('class', 'map')
      .attr('fill', 'lightsteelblue')
      .attr('stroke-width', 0.4)
      .style('stroke', 'white')
      .attr('d', this.projectionGeoPath)

    // Delete existing data
    this.svg.selectAll('.data-display')
      .remove()

    // Render data
    this.svg.selectAll('.data-display')
      .data(this.graphData)
      .enter()
      .append('circle')
      .attr('class', 'data-display')
      .attr('cx', (d) => this.projection(d.pos)[0])
      .attr('cy', (d) => this.projection(d.pos)[1])
      .attr('r', 1)
      .attr('fill', 'red')

    this.isRendering = false;
    const endTime = Date.now();
    console.log(`It took ${endTime - startTime}ms to render the map.`)

    // Rerender if render is queued
    if (this.isRenderQueued) {
      this.render();
    }
  }
}

/* Test MapDisplay */
// utility functions
const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

// request data
const map = d3.json('data/usa-states.json');
const data = d3.json('data/mock-data.json');

// prepare container & svg
const container = document.querySelector('#map-display-container');
container.style = 'width: 80vw; height: min(80vh, 50vw); border: solid; margin: 12px auto;';
let size = [
  container.clientWidth,
  container.clientHeight
];
const svg = d3.select('#map-display-container').append('svg')
  .attr('width', size[0])
  .attr('height', size[1]);

// calculate initial view properties
let pos = [-96, 38];
let offset = size.map((n) => { return n/2; });
let zoom = 500;

let mapDisplay;
Promise.all([map, data]).then((result) => {
  mapDisplay = new MapDisplay(
    svg,
    result[0],
    result[1],
    pos,
    offset,
    zoom,
  );
  mapDisplay.render();

  // when the window is resized (update offset)
  addEventListener('resize', (e) => {
    // update svg size to equal its container
    size = [container.clientWidth, container.clientHeight];
    svg.attr('width', size[0]).attr('height', size[1]);
    // update map view center
    offset = size.map((n) => { return n/2; });
    mapDisplay.setViewOffset(offset);
    // rerender the map
    mapDisplay.render();
  });

  // when a scrollwheel is moved over the container (update zoom)
  container.onwheel = (e) => {
    e.preventDefault();
    // update map zoom
    const currentZoom = mapDisplay.getViewZoom();
    zoom = currentZoom - clamp(e.deltaY, -150, 150) * Math.max(0.2, (currentZoom / 400));
    mapDisplay.setViewZoom(zoom);
    // rerender the map
    mapDisplay.render();
  }

  // when the container is dragged (update pos)
  const onMapDrag = (e) => {
    // update map pos
    const currentPos = mapDisplay.getViewPos();
    const currentZoom = mapDisplay.getViewZoom();
    pos = [
      currentPos[0] - e.movementX / (currentZoom / 40),
      currentPos[1] + e.movementY / (currentZoom / 40)
    ];
    mapDisplay.setViewPos(pos);
    // rerender the map
    mapDisplay.render();
  };
  container.onmousedown = (e) => {
    e.preventDefault();
    addEventListener('mousemove', onMapDrag);
  }
  addEventListener('mouseup', (e) => {
    removeEventListener('mousemove', onMapDrag)
  });
});
