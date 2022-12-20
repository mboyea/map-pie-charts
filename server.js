const http = require('http');
const fs = require('fs');

// basic server which doesn't cache files
http.createServer((req, res) => {
  if (req.url == '/') {
    fs.readFile(__dirname + '/index.html', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    })
  }
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