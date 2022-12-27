🗺️ Map Charts
===
A web application which shows a map with charts overlaid on top.
---
A simple geographic data visualization example.

This application is built with HTML and JavaScript, using the D3.js rendering library.

### To run
* [Install Node].
* Clone this repository to your computer.
* Open a terminal in the root directory of this repository.
* Run `npm run start` in the terminal
* Navigate to [localhost:8080] in a web browser.

### Scripts
To run a script, type `npm run <script-name>`

| script-name | description |
|:----------- |:----------- |
| `start` | start a server to host the application locally |

To edit commands, see "scripts" in package.json

### Current Term Goals (January 8th 2022)
✓ Renders a D3.js map of the United States  
✓ Map rendering is within a javascript function which injects the map into a given element  
✓ The render function can move the viewport to specified lat/long coordinates  
✓ The render function takes in lat/long coordinates and renders red points at those positions  
✓ Mock data is added  
The red points are replaced with charts representing the data  
Styling is at a presentable quality  
Ensure performance with 1-40 charts, even on mobile devices  

### References
Data source: https://eric.clst.org/tech/usgeojson/ (Puerto Rico, Hawaii, & Alaska were culled)  
D3.js documentation: https://devdocs.io/d3~7/  
D3.js svg guide: https://observablehq.com/@d3/selection-join  
Similar MapboxGL map implementation: https://docs.mapbox.com/mapbox-gl-js/example/cluster/  
Similar D3.js map implementation: https://gist.github.com/mapsam/6090056  
Testing if a given point is in view with D3.js: https://observablehq.com/@d3/testing-projection-visibility  
Optimization approach - hide svg and render on a canvas instead, then use hidden svg to test mouse collisions: https://www.mongodb.com/blog/post/d3-round-two-how-blend-html5-canvas-svg-speed-up-rendering  

### To contribute to this project
This project doesn't support user contributions.

[Install Node]: https://nodejs.org/en/download/
[localhost:8080]: http://localhost:8080
