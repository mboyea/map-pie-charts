/** Handler to manage a displaying map */
class MapDisplay {
  /** initialize and render a MapDisplay
   * @param svg the target svg to render within
   * @param mapData map source data (GeoJSON format)
   * @param {{
   *    organization: string,
   *    coords: number[],
   *    data: {status: string, count: number}[]
   * }[]} graphData graph source data
   * @param {number[]} svgSize [width, height] pixels size of the svg
   * @param {number[]} viewCenter [longitude, latitude] center of the view
   * @param {number} viewZoom initial zoom level of the view
   * @param {number[]} viewZoomRange [min, max] user zoom limits
   * @param {number} dataClusterRange max distance in pixels between clustered points
   */
  constructor(
    svg,
    mapData,
    graphData = [],
    svgSize = [300, 150],
    viewCenter = [-96, 38],
    viewZoom = 500,
    viewZoomRange = [1, 5],
    dataClusterRange = 100,
  ) {
    // define default variables
    this.projection = d3.geoMercator();
    this.zoom = d3.zoom()
    this.isRendering = false;
    this.isRenderQueued = false;

    // define render data
    this.setMapData(mapData);
    this.setGraphData(graphData);

    // prepare for rendering
    this.setDataClusterRange(dataClusterRange);
    this.setSVG(svg);
    this.setSVGSize(svgSize);
    this.setView(viewCenter, viewZoom);
    this.setViewZoomRange(viewZoomRange);
    this.initZoom();

    // render
    this.render();
  }
  setMapData(mapData) { this.mapData = mapData; }
  setGraphData(graphData) {
    this.graphData = graphData;
    this.renderData = graphData;
  }
  /** Set a new target svg element
   * @param svg the target svg to render within
   */
  setSVG(svg) {
    this.svg = svg;
    this.svgGroup = svg.append('g')
      .attr('class', 'map-display-group');
  }
  /** Set the svg size
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
    this.zoom.translateExtent([[0, 0], this.svgSize]);
    // cluster data
    this.clusterDataWithinView();
  }
  /** Set the default view (before user zoom/translation)
   * @param {number[]} viewCenter [longitude, latitude] center of the view
   * @param {number} viewZoom zoom level of the view
   */
  setView(viewCenter, viewZoom) {
    this.projection
      .center(viewCenter)
      .scale(viewZoom)
    this.projectionGeoPath = d3.geoPath().projection(this.projection);
  }
  /** Set the max distance between clustered points
   * @param {number} dataClusterRange max distance in pixels between clustered points
  */
  setDataClusterRange(dataClusterRange) {
    this.dataClusterRange = dataClusterRange;
  }
  /** Initialize user zoom functionality for the map */
  initZoom() {
    this.zoom
      .translateExtent([[0, 0], this.svgSize])
      .on('zoom', (e) => {
        this.svgGroup.attr('transform', e.transform);
        this.clusterDataWithinView();
      });
    this.svg.call(this.zoom);
  }
  /** Set the range of user zooming
   * @param {number[]} viewZoomRange [min, max] zoom level limits
   */
  setViewZoomRange(viewZoomRange) {
    this.zoom.scaleExtent(viewZoomRange);
    this.viewZoomRange = viewZoomRange;
  }
  #isWithinBounds(a, b) {
    return (
      a.x < b.right &&
      a.right > b.x &&
      a.y < b.bottom &&
      a.bottom > b.y
    );
  }
  #isWithinDistance(a, b, range) {
    return false;
  }
  /** Cluster visible data into combined datapoints as renderData */
  clusterDataWithinView() {
    // render test data
    this.svgGroup.selectAll('.data-test')
      .data(this.graphData)
      .enter()
      .append('circle')
      .attr('style', 'visibility: hidden;')
      .attr('class', 'data-test')
      .attr('cx', (d) => this.projection(d.coords)[0])
      .attr('cy', (d) => this.projection(d.coords)[1])
      .attr('r', 3);
    
    this.renderData = [];
    let clusterData = [];
    const data = this.svgGroup.selectAll('.data-test');
    const dataNodes = data.nodes();
    const svgRect = this.svg.node().getBoundingClientRect();

    // for every datapoint
    let dataRect, dataCluster, clusterCount = 0;
    for (let i = 0; i < dataNodes.length; i++) {
      dataRect = dataNodes[i].getBoundingClientRect();

      // ignore datapoint if it's outside the view
      if (!this.#isWithinBounds(dataRect, svgRect)) continue;
      /*
      // determine whether datapoint is to be clustered (0 for not clustered, a number for a given cluster)
      dataCluster = 0;
      // for every currently processed datapoint
      for (let j = 0; j < clusterData.length; j++) {
        // if new datapoint is within the data cluster range
        if (this.#isWithinDistance(dataRect, clusterData[i].rect, this.dataClusterRange)) {
          // if the already processed datapoint already has a cluster, use that cluster; otherwise, use a new cluster
          if (clusterData[j].dataCluster != 0)
            dataCluster = clusterData[j].dataCluster;
          else {
            clusterCount++;
            dataCluster = clusterCount;
            clusterData[j].dataCluster = clusterCount;
          }
        }
      }*/
      // store data for clustering
      this.renderData.push({...dataNodes[i].__data__, rect: dataRect, dataCluster});
    }
    // TODO: run k-means clustering algorithm with k=clusterCount and n=??? on clusterData with dataCluster = 0
    console.log(this.renderData);

    // delete test data
    this.svgGroup.selectAll('.data-test').remove()
  }
  /** Renders the map display inside of the SVG */
  render() {
    // render map
    this.svgGroup.selectAll('.map-display')
      .data(this.mapData.features)
      .join('path')
      .attr('class', 'map-display')
      .attr('fill', '#EDEDED')
      .attr('stroke-width', 0.3)
      .style('stroke', 'darkgrey')
      .attr('d', this.projectionGeoPath);

    // TODO: find more performant solution for updating data
    // delete existing data
    this.svgGroup.selectAll('.data-display')
      .remove()

    // render data
    this.svgGroup.selectAll('.data-display')
      .data(this.renderData)
      .enter()
      .append('circle')
      .attr('class', 'data-display')
      // TODO: maybe just re-assigning the projection would update data position when map is panned/zoomed
      .attr('cx', (d) => this.projection(d.coords)[0])
      .attr('cy', (d) => this.projection(d.coords)[1])
      .attr('r', 3)
      .attr('fill', 'red')
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

  // when the window is resized, update svg to fit container
  addEventListener('resize', (e) => {
    // update svg size to equal its container
    svgSize = [container.clientWidth, container.clientHeight];
    mapDisplay.setSVGSize(svgSize);
    // re-render
    mapDisplay.render();
  });
});
