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
    this.setView(viewPos, viewOffset, viewZoom);
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
    this.projection = d3.geoMercator()
      .center(pos)
      .translate(offset)
      .scale(zoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewPos(pos) {
    this.projection = d3.geoMercator()
      .center(pos)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewOffset(offset) {
    this.projection = d3.geoMercator()
      .translate(offset)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  setViewZoom(zoom) {
    this.projection = d3.geoMercator()
      .scale(zoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  getViewPos() { return this.projection.center(); }
  getViewOffset() { return this.projection.translate(); }
  getViewZoom() { return this.projection.scale(); }
  /** Renders the map display inside of the SVG */
  render() {
    const startTime = Date.now();

    this.svg.selectAll('path')
    .data(this.mapData.features)
    .join('path')
      .attr('fill', 'grey')
      .style('stroke', 'none')
      .attr('d', this.projectionGeoPath)

    // Render data
    // TODO: create proper data visualization (bubbles)
    this.svg.selectAll('circle')
      .data(this.graphData)
      .enter()
      .append('circle')
      .attr('cx', (d) => this.projection(d.pos)[0])
      .attr('cy', (d) => this.projection(d.pos)[1])
      .attr('r', 3)
      .attr('fill', 'red')

    const endTime = Date.now();
    console.log(`It took ${endTime - startTime}ms to render the map.`)
  }
}

// Test
const map = d3.json('data/usa-states.json');
const data = d3.json('data/mock-data.json');
const container = d3.select('#map');
const size = [300, 300];
const svg = container.append('svg')
  .attr('width', size[0])
  .attr('height', size[1]);
const pos = [-96, 37];
const offset = size.map((n) => { return n/2; });
const zoom = 500;

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
});
