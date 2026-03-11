var http = require("http");
var fs = require("fs");

http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync("../index.html"));
  })
  .listen(8004, "0.0.0.0");

console.log("Server running on port 8004");
