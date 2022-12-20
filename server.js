const http = require('http');
const fs = require('fs');

// basic server which doesn't cache files
http.createServer((req, res) => {
  fs.readFile(__dirname + req.url, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(8080);