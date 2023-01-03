/** Handler to manage a displaying map */
class MapDisplay {
  /**
   * @param svg the target svg to render within
   * @param mapData map source data (GeoJSON format)
   * @param {{
   *    organization: string,
   *    pos: number[],
   *    data: {status: string, count: number}[]
   * }[]} graphData graph source data
   * @param {number[]} svgSize [width, height] pixels size of the svg
   * @param {number[]} viewCenter [longitude, latitude] center of the view
   * @param {number} viewZoom zoom level of the view
   */
  constructor(
    svg,
    mapData,
    graphData = [],
    svgSize = [300, 150],
    viewCenter = [-96, 38],
    viewZoom = 500,
  ) {
    // define default variables
    this.projection = d3.geoMercator();
    this.zoom = d3.zoom()
    this.isRendering = false;
    this.isRenderQueued = false;

    // define data data
    this.setMapData(mapData);
    this.setGraphData(graphData);

    // prepare svg
    this.setSVG(svg);
    this.setView(viewCenter, viewZoom);
    this.setSVGSize(svgSize);
    this.initZoom();
  }
  setMapData(mapData) { this.mapData = mapData; }
  setGraphData(graphData) { this.graphData = graphData; }
  /**
   * Set a new target svg element
   * @param svg the target svg to render within
   */
  setSVG(svg) {
    this.svg = svg;
    this.svgGroup = svg.append('g')
      .attr('class', 'map-display-render-group')
  }
  /**
   * Set the svg size
   * @param {number[]} svgSize [width, height] pixels size of the svg
   */
  setSVGSize(svgSize) {
    // resize svg
    this.svgSize = svgSize;
    this.svg
      .attr('width', svgSize[0])
      .attr('height', svgSize[1]);
    // update map translation to make the target location the center of the svg viewport
    this.projection.translate(this.svgSize.map((n) => { return n/2; }))
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
    // update the zoom translation bounds
    this.zoom.translateExtent([[0, 0], this.svgSize])
  }
  /**
   * @param {number[]} viewCenter [longitude, latitude] center of the view
   * @param {number} viewZoom zoom level of the view
   */
  setView(viewCenter, viewZoom) {
    this.projection
      .center(viewCenter)
      .scale(viewZoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  // TODO: documentation
  initZoom() {
    this.zoom
      .scaleExtent([1, 5])
      .translateExtent([[0, 0], this.svgSize])
      .on('zoom', (e) => {
        this.svgGroup.attr('transform', e.transform);
      });
    this.svg.call(this.zoom);
  }
  /** Renders the map display inside of the SVG */
  render() {
    // time
    const startTime = Date.now();

    // queue overlapping render calls
    if (this.isRendering) {
      this.isRenderQueued = true;
      return;
    }
    this.isRendering = true;

    // render map
    this.svgGroup.selectAll('.map-display')
    .data(this.mapData.features)
    .join('path')
      .attr('class', 'map-display')
      .attr('fill', '#EDEDED')
      .attr('stroke-width', 0.3)
      .style('stroke', 'darkgrey')
      .attr('d', this.projectionGeoPath)

    // TODO: find more performant solution for updating data
    // delete existing data
    this.svgGroup.selectAll('.data-display')
      .remove()

    // render data
    this.svgGroup.selectAll('.data-display')
      .data(this.graphData)
      .enter()
      .append('circle')
      .attr('class', 'data-display')
      .attr('cx', (d) => this.projection(d.pos)[0])
      .attr('cy', (d) => this.projection(d.pos)[1])
      .attr('r', 1)
      .attr('fill', 'red')

    // end time
    const endTime = Date.now();
    console.log(`It took ${endTime - startTime}ms to render the map.`)

    // rerender if render is queued
    this.isRendering = false;
    if (this.isRenderQueued) this.render();
  }
}

/* Test MapDisplay */
// request data
const map = d3.json('data/usa-states.json');
const data = d3.json('data/mock-data.json');

// prepare container & svg
const container = document.querySelector('#map-display-container');
container.style = 'width: 80vw; height: min(80vh, 50vw); border: solid; margin:  auto;';
const svg = d3.select('#map-display-container').append('svg')

// calculate initial view properties
let svgSize = [
  container.clientWidth,
  container.clientHeight
];
let viewPos = [-96, 38];
let viewZoom = 500;

let mapDisplay;
Promise.all([map, data]).then((result) => {
  mapDisplay = new MapDisplay(
    svg,
    result[0],
    result[1],
    svgSize,
    viewPos,
    viewZoom,
  );
  mapDisplay.render();

  // when the window is resized, update svg to fit container
  addEventListener('resize', (e) => {
    // update svg size to equal its container
    svgSize = [container.clientWidth, container.clientHeight];
    mapDisplay.setSVGSize(svgSize);
    // re-render
    mapDisplay.render();
  });
});
